// Preview-only controls are injected by server.py; never copy this into production.
(() => {
  const host = document.createElement('aside');
  host.id = 'website-ui-preview-tools';
  host.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483647;max-width:calc(100vw - 24px)';
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>:host{font:13px/1.5 system-ui;color:#fff}details{background:#17243b;border:1px solid #789;border-radius:10px;padding:10px 14px;box-shadow:0 3px 18px #0004;max-width:300px}summary{cursor:pointer;font-weight:700}a{color:#c1e4ff;display:block;margin-top:7px}p{margin:8px 0 0}</style>
    <details><summary>UI preview · Sample data</summary><p>Chat/runtime excluded. Changes here do not reach the live app.</p><a href="/__preview">All 10 pages</a><a href="/__preview/session?owner=1">Owner dashboard</a><a href="/__preview/session?owner=0">Owner login screen</a><a href="/__preview/session?admin=1">Admin dashboard</a><a href="/__preview/session?admin=0">Admin login screen</a></details>`;
  document.body.append(host);
})();
