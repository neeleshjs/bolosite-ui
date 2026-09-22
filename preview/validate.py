"""Check the standalone website handoff without importing the main application."""
import argparse
import hashlib
import json
import logging
import sys
from html.parser import HTMLParser
from threading import Thread
from urllib.parse import unquote, urljoin, urlsplit

sys.dont_write_bytecode = True
from server import PAGES, ROOT, SOURCE_FILES, app


class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "img", "source", "video", "audio"} and attrs.get("src"):
            self.urls.append(attrs["src"])
        if tag == "video" and attrs.get("poster"):
            self.urls.append(attrs["poster"])
        if tag == "link" and attrs.get("rel") in {"stylesheet", "icon"}:
            self.urls.append(attrs["href"])


def static_checks(check_baseline):
    client = app.test_client()
    assets = set()
    for path in PAGES:
        response = client.get(path)
        assert response.status_code == 200, (path, response.status_code)
        html = response.get_data(as_text=True)
        assert "<title>" in html and "</html>" in html, path
        assert "{%" not in html and "{{ csrf_token }}" not in html, path
        parser = Assets()
        parser.feed(html)
        for url in parser.urls:
            parsed = urlsplit(urljoin("http://preview.test" + path, url))
            if parsed.netloc == "preview.test":
                assets.add(unquote(parsed.path))
    for path in assets:
        assert client.get(path).status_code == 200, f"Missing asset: {path}"
    for path in ["/agent.js", "/loader.js", "/.env", "/production.env", "/preview/server.py", "/app_bolosite.py", "/assets/../preview/server.py", "/assets/%2e%2e/%2e%2e/.env"]:
        assert client.get(path).status_code == 404, f"Unexpected exposure: {path}"
    runtime = client.get("/bolosite-runtime.min.js").get_data(as_text=True)
    assert runtime.strip().startswith("/*") and len(runtime) < 200
    for path in ["/api/client/dashboard/content", "/api/public/submissions", "/api/client/payments", "/api/bolosite-test/jobs", "/api/proof/feedback"]:
        response = client.post(path, json={"sample": True})
        assert response.status_code == 501 and response.json["ok"] is False, path
    assert client.get("/api/unknown").status_code == 501
    assert "connect-src 'self'" in client.get("/").headers["Content-Security-Policy"]
    assert client.get("/__preview/session?owner=0").status_code == 302
    assert client.get("/api/client/session").json["authenticated"] is False
    client.get("/__preview/session?owner=1")
    assert client.get("/api/client/session").json["site"]["site_id"] == "SITE_DESIGN_DEMO"
    for name in ["agent.js", "loader.js", "bolosite-runtime.min.js", "tracker.js", ".env", "production.env", "app_bolosite.py"]:
        assert not any(ROOT.rglob(name)), f"Excluded file found: {name}"
    if check_baseline:
        for entry in json.loads((ROOT / "SOURCE_MANIFEST.json").read_text(encoding="utf-8"))["files"]:
            assert hashlib.sha256((ROOT / entry["path"]).read_bytes()).hexdigest() == entry["sha256"], f"Source edited since handoff: {entry['path']}"
    print(f"PASS: {len(PAGES)} pages, {len(assets)} local asset URLs, excluded-file checks and preview isolation.", flush=True)


def browser_checks(channel):
    from playwright.sync_api import sync_playwright
    from werkzeug.serving import make_server

    logging.getLogger("werkzeug").setLevel(logging.ERROR)
    server = make_server("127.0.0.1", 0, app, threaded=True)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, **({"channel": channel} if channel else {}))
            errors, failures = [], []
            try:
                for width, height in [(1440, 1000), (390, 844)]:
                    context = browser.new_context(viewport={"width": width, "height": height})
                    page = context.new_page()
                    page.set_default_timeout(10000)
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    page.on("response", lambda response: failures.append((response.status, response.url)) if response.url.startswith(base) and response.status >= 400 else None)
                    for path in PAGES:
                        page.goto(base + path, wait_until="networkidle")
                        assert page.locator("body").is_visible(), path
                        assert page.locator("#website-ui-preview-tools").is_visible(), path
                        if path == "/":
                            before = page.locator("html").get_attribute("data-theme")
                            if width < 500:
                                page.locator("#menuToggle").click()
                                assert page.locator("#menuToggle").get_attribute("aria-expanded") == "true"
                                page.locator("#mobileThemeToggle").click()
                            else:
                                page.locator("#themeToggle").click()
                            assert page.locator("html").get_attribute("data-theme") != before
                        elif path == "/trust":
                            assert page.locator("#reviews").inner_text().find("Fictional review") >= 0
                            page.locator('[data-language="hinglish"]').click()
                            assert page.locator('[data-language="hinglish"]').get_attribute("aria-pressed") == "true"
                        elif path == "/owner-portal":
                            assert page.locator("#dashView").is_visible()
                            # Follow each real navigation target; hash navigation also works on mobile.
                            targets = page.locator("[data-dashboard-target]").evaluate_all("nodes => [...new Set(nodes.map(n => n.dataset.dashboardTarget))]")
                            for target in targets:
                                page.evaluate("target => { location.hash = target; }", target)
                                page.wait_for_function("target => document.getElementById(target)?.classList.contains('dashboard-panel-active')", arg=target)
                                if target == "analysis":
                                    page.locator("#anBody").wait_for(state="visible")
                                    for tab in ["activity", "overview"]:
                                        page.locator("#anTab-" + tab).click()
                            assert "could not load" not in page.locator("#anStatus").inner_text().lower()
                        elif path == "/enquiry-data":
                            page.locator("[data-response-index]").first.click()
                            assert page.locator("#responseDrawer").is_visible()
                            assert "Website redesign" in page.locator("#drawerBody").inner_text()
                            page.locator("#closeDrawerBtn").click()
                            assert not page.locator("#responseDrawer").is_visible()
                    page.goto(base + "/__preview/session?owner=0", wait_until="networkidle")
                    assert page.locator("#authView").is_visible()
                    page.goto(base + "/__preview/session?admin=0", wait_until="networkidle")
                    assert page.locator('form[action="/admin/login"]').is_visible()
                    context.close()
                    print(f"PASS: {width}px viewport page and interaction checks.", flush=True)
                assert not errors, errors
                assert not failures, failures
                print("PASS: all 10 pages at desktop/mobile sizes, theme/menu, owner panels, Analysis, feedback language, enquiry drawer and login views; no uncaught JS errors or failing local requests.", flush=True)
            finally:
                browser.close()
    finally:
        server.shutdown()
        thread.join(timeout=5)
        server.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", action="store_true")
    parser.add_argument("--channel", default="", help="Use msedge or chrome if installed, otherwise bundled Chromium")
    parser.add_argument("--check-baseline", action="store_true")
    args = parser.parse_args()
    static_checks(args.check_baseline)
    if args.browser:
        browser_checks(args.channel)
