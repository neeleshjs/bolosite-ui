"""Standalone UI preview. Never imports or connects to the main BoloSite app."""
import argparse
import json
import secrets
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from flask import Flask, Response, abort, jsonify, redirect, render_template, request, send_file, session
from fixtures import ENQUIRY, RESPONSE, REVIEW, SITE, api_fixture

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "/": "index.html", "/visitor": "user.html", "/owner": "client.html",
    "/what-is-bolosite": "what-is-bolosite.html", "/future": "future.html",
    "/pricing": "pricing.html", "/contact": "contact.html",
    "/trust": "proof.html", "/owner-portal": "bolosite_owner-portal.html",
    "/test-lab": "bolosite_test.html", "/enquiry-data": "bolosite_enquiry-data.html",
    "/admin": "bolosite_admin.html", "/admin/enquiry": "bolosite_admin-enquiry.html",
    "/admin/proof": "bolosite_admin-proof.html",
}
ALIASES = {"/" + name: path for path, name in PAGES.items()}
ALIASES.update({"/index": "/", "/user": "/visitor", "/client": "/owner", "/proof": "/trust", "/client-portal": "/owner-portal", "/client-portal.html": "/owner-portal", "/bolosite_client_portal.html": "/owner-portal", "/bolosite-test": "/test-lab", "/bolosite-test.html": "/test-lab"})
ALIASES.update({"/api/pages/" + name: path for name, path in {"home": "/", "visitor": "/visitor", "owner-guide": "/owner", "what-is-bolosite": "/what-is-bolosite", "future": "/future", "pricing": "/pricing", "contact": "/contact", "trust": "/trust", "owner-portal": "/owner-portal", "test-lab": "/test-lab"}.items()})
SOURCE_FILES = {entry["path"] for entry in json.loads((ROOT / "SOURCE_MANIFEST.json").read_text(encoding="utf-8"))["files"]}
app = Flask(__name__, template_folder=str(ROOT / "templates"), static_folder=None)
app.secret_key = secrets.token_hex(32)
app.config.update(MAX_CONTENT_LENGTH=1_000_000, BOLOSITE_ADMIN_MFA_REQUIRED=False)
UNAVAILABLE = "UI preview only: this operation needs the main application and is not performed here."


@app.after_request
def isolate_preview(response):
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    # Original templates stay byte-identical. Only served previews receive controls.
    # Network APIs cannot reach a production origin, even if UI code has an absolute URL.
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; "
        "media-src 'self' blob:; connect-src 'self'; form-action 'self'; "
        "frame-src 'none'; object-src 'none'; base-uri 'self'"
    )
    return response


def html_response(html):
    injection = '<script src="/__preview/toolbar.js" defer></script>'
    return Response(html.replace("</head>", injection + "</head>", 1), mimetype="text/html")


def admin_context():
    filters = {key: request.args.get(key, "") for key in ["search", "status", "date_from", "date_to"]}
    client = dict(SITE, response_count=1, enquiry=ENQUIRY)
    return {
        "authenticated": session.get("admin", True), "admin_ready": True,
        "csrf_token": "preview-only", "error": "", "filters": filters,
        "clients": [client], "selected": client, "responses": [RESPONSE],
        "response_detail": RESPONSE if "/response/" in request.path else None,
        "question_rows": [{"question": "Which service interests you?", "answer": "Website redesign"}],
    }


@app.route("/__preview")
def index():
    items = "".join(f'<li><a href="{path}">{name}</a> <code>{path}</code></li>' for path, name in PAGES.items())
    return html_response(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Website design preview</title>
    <style>body{{font:17px/1.65 system-ui;max-width:950px;margin:40px auto;padding:0 24px}}li{{padding:8px}}code{{background:#eee;padding:4px}}a{{color:#1759b8}}</style></head><body>
    <h1>BoloSite website design preview</h1><p>Edit the copied templates and assets, then refresh the page. All data is fictional. Chat, voice and state runtime are excluded.</p>
    <ul>{items}</ul><p><a href="/__preview/session?owner=0">Owner login screen</a> · <a href="/__preview/session?owner=1">Owner dashboard</a> · <a href="/__preview/session?admin=0">Admin login screen</a> · <a href="/__preview/session?admin=1">Admin dashboard</a></p>
    <p>Forms, settings and filters can be styled here. Fixture data is fixed; saving, payments, AI generation, exports, live tests and real authentication require the main application.</p></body></html>''')


@app.route("/__preview/session")
def switch_session():
    if "admin" in request.args:
        session["admin"] = request.args["admin"] == "1"
        return redirect("/admin")
    session["owner"] = request.args.get("owner", "1") == "1"
    return redirect("/owner-portal")


@app.route("/__preview/toolbar.js")
def toolbar():
    return send_file(ROOT / "preview" / "toolbar.js", mimetype="text/javascript")


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def serve(path):
    url = "/" + path
    if url.startswith("/api/") and url not in ALIASES:
        return preview_api(url)
    if request.method != "GET":
        if url in ["/admin/login", "/admin/logout"]:
            session["admin"] = url.endswith("login")
            return redirect("/admin")
        return html_response(f'<html><head><title>Preview only</title></head><body><p>{UNAVAILABLE}</p><a href="/__preview">Back to pages</a></body></html>'), 501
    if url in ALIASES:
        return redirect(ALIASES[url])
    if url == "/bolosite-runtime.min.js":
        return Response("/* Core BoloSite runtime deliberately excluded from website design preview. */", mimetype="text/javascript")
    if url == "/favicon.ico":
        return send_file(ROOT / "assets/images/bolosite black.jpeg", mimetype="image/jpeg")
    filename = PAGES.get(url)
    if url.startswith("/admin/enquiry/response/"):
        filename = "bolosite_admin-enquiry.html"
    if filename:
        if filename == "bolosite_admin-proof.html":
            html = render_template(filename, rows=[{"record": REVIEW, "feedback": REVIEW, "reports": []}], total=1, page=0, status="", categories=["general"], category="", website="", order="newest", reported=False, filters="", csrf_token="preview-only")
        elif filename.startswith("bolosite_admin"):
            html = render_template(filename, **admin_context())
        else:
            html = (ROOT / "templates" / filename).read_text(encoding="utf-8")
        return html_response(html)
    if path.startswith("assets/"):
        asset = (ROOT / path).resolve()
        allowed_types = {".css", ".js", ".json", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".mp4", ".webm", ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".otf"}
        if asset.is_relative_to(ROOT / "assets") and asset.suffix.lower() in allowed_types and asset.is_file():
            return send_file(asset)
    if path.startswith("website_owner_analysis/") and path in SOURCE_FILES:
        return send_file(ROOT / path)
    abort(404)


def preview_api(url):
    ui = {
        "/api/client/analysis-ui.js": "website_owner_analysis/dashboard.js",
        "/api/client/analysis-ui.css": "website_owner_analysis/dashboard.css",
        "/api/client/quick-suggestions-ui.js": "assets/js/owner-quick-suggestions.js",
    }
    if url in ui and request.method == "GET":
        return send_file(ROOT / ui[url])
    if request.method == "POST" and url in ["/api/client/login", "/api/client/logout"]:
        session["owner"] = url.endswith("login")
        return jsonify(ok=True, preview=True, authenticated=session["owner"], site=SITE if session["owner"] else None)
    if request.method != "GET":
        return jsonify(ok=False, preview=True, error=UNAVAILABLE), 501
    if url in ["/api/client/session", "/api/bolosite-test/session"]:
        authenticated = session.get("owner", True)
        return jsonify(ok=True, preview=True, authenticated=authenticated, site=SITE if authenticated else None, csrf_token="preview-only")
    if url == "/api/client/csrf":
        return jsonify(ok=True, csrf_token="preview-only")
    if url == "/api/public/session":
        return jsonify(ok=True, authenticated=False, account=None, csrf_token="preview-only")
    data = api_fixture(url)
    if data is None:
        return jsonify(ok=False, preview=True, error=UNAVAILABLE), 501
    return jsonify(ok=True, preview=True, **data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    print(f"Website UI preview: http://127.0.0.1:{args.port}/__preview", flush=True)
    app.run(host="127.0.0.1", port=args.port, debug=False, use_reloader=False, load_dotenv=False)
