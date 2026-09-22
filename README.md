# BoloSite website UI handoff

Ye folder website design team ko poora share kar sakte hain. Ismein 10 current page templates, website CSS/JavaScript, images, logos, videos aur local preview hain. Main project ki zaroorat preview run karne ke liye nahi hai.

**Chat, voice orb, assistant state aur core runtime is package ka hissa nahi hain.** `agent.js`, `loader.js`, their bundled runtime, tracker, voice helpers, Python business backend, AI prompts, client records, databases and credentials are excluded.

## Start the preview

Python 3.10 or newer is required. Open a terminal **inside this folder**:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\start-preview.cmd
```

Open **http://127.0.0.1:4173/__preview** for the page list, or **http://127.0.0.1:4173/** for the homepage. Keep the terminal running; press Ctrl+C to stop. After setup, double-click `start-preview.cmd` to start again. If the port is busy, run `start-preview.cmd --port 4174`.

On macOS/Linux:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -B preview/server.py
```

If Flask is already installed, `python -B preview/server.py` is enough. There is no Node build, main application setup, `.env`, account or API key requirement. Use the local server rather than opening HTML through `file://`; admin templates and absolute asset paths need the preview routes.

## What the team edits

- `templates/`: page layout, visible copy, forms, inline CSS and inline JavaScript. Some templates contain most of their styling and behavior inline; copying external CSS alone would miss them.
- `assets/css/`: shared page styles and homepage/guide/feedback styling.
- `assets/js/`: website navigation, page interactions, feedback UI and owner suggestion editor UI. Keep existing API wiring and field identifiers compatible.
- `assets/images/`, `assets/video/`: website media. New media, styles and scripts in `assets/` are supported by the preview.
- `website_owner_analysis/dashboard.css` and `dashboard.js`: owner Analysis dashboard presentation.

Read [PAGE_MAP.md](PAGE_MAP.md) before editing and [INTEGRATION.md](INTEGRATION.md) before handing the changes back. Edit, save, then refresh the browser. The preview serves source files directly. Original templates and assets were copied byte-for-byte, including existing local edits at handoff time. `SOURCE_MANIFEST.json` records their initial hashes; it is a baseline, not an instruction to overwrite newer main-project work.

## Preview behavior

All 10 pages load. Owner and admin dashboards start with a fictional account; the bottom-right **UI preview** control switches between dashboard and login views. Dummy login input is only for previewing the transition: use invented values. Enquiry tables have a sample response; feedback has a sample review. Analysis includes sample/empty measurement states and billing displays a fictional trial account.

Navigation, responsive styles, menus, theme controls, tabs, form fields, review language switching and enquiry detail drawers use the copied website UI. Data fixtures are fixed: changing filters does not query live records. Saving forms/settings, registering accounts, payments, exports, AI builders, running Test Lab jobs and authentication security operations intentionally report that the main application is required. They never claim a live save or payment occurred.

The BoloSite embed tags remain in the copied page source for later integration. Locally their runtime URL returns only an explanatory comment, so the chat/orb is absent from this design preview. No runtime source or compiled runtime is included. The real project's chat/state implementation remains unchanged.

Google Fonts needs internet access; system font fallbacks work without it. Social/contact links retain their original destinations. Preview API requests and form submissions are restricted to the local preview origin. The local server binds to `127.0.0.1` and is for design work, not deployment.

## Package layout

```text
website_ui_handoff/
  templates/                Editable page sources
  assets/                   Website styles, scripts, media
  website_owner_analysis/   Dashboard frontend only
  preview/                  Standalone server, invented fixtures, toolbar, checks
  start-preview.cmd          Windows launcher
  requirements.txt          Preview dependency only
  SOURCE_MANIFEST.json       Original copied source hashes
  PAGE_MAP.md                Page-to-source guide
  INTEGRATION.md             Return-to-project boundaries
  VERIFICATION.md            Completed checks and known limits
```

The legacy website files `assets/css/legacy-portal.css`, `assets/js/client-portal.js`, and `assets/js/script_old.js` are retained as reference source. Current templates do not load them; use the page map to find active files.

## Verify after design edits

```powershell
python -B preview/validate.py
```

For optional desktop/mobile browser checks, install Playwright in the same environment and use an installed Edge browser on Windows:

```powershell
python -m pip install playwright
python -B preview/validate.py --browser --channel msedge
```

Alternatively run `python -m playwright install chromium`, then `python -B preview/validate.py --browser`. The validation server stops automatically. Run `--check-baseline` only to verify an untouched handoff: intentional source edits should change its hashes.

Share this entire folder. Omit `.venv/`, Python caches and any personal working files if you create them later.
