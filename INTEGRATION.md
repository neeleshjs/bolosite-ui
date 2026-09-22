# Returning the website design to BoloSite

## Scope and ownership

This folder is an editable website source snapshot and standalone design preview. It contains no main-app backend. The source filenames and relative paths mirror the original project so a reviewer can merge website changes file by file.

The following core components were not copied: `agent.js`, `loader.js`, `dist/bolosite-runtime.min.js`, the runtime build tool, analytics tracker, voice/widget runtime helpers, Python application modules, AI/RAG files, prompts, tenant folders, databases, environment files and deployment secrets. The three marketing-page embed tags are preserved as integration references only.

Frontend API request wiring remains in the website files because buttons, forms and dashboard states depend on it. The implementing server logic and actual data are excluded. The handoff's `preview/server.py` implements only local display fixtures and dummy view switching; it is not a copy of the BoloSite backend.

## Design changes to return

Return the changed files under `templates/`, `assets/` and `website_owner_analysis/`, with a short note of added/removed files. Also include any new assets used by the design. The main project may have progressed since the snapshot, so merge the diff rather than overwriting whole folders.

Keep these contracts intact unless the core team separately implements a matching change:

- Existing page URLs, form field names, DOM IDs, `data-*` hooks and dashboard navigation targets used by JavaScript.
- API URLs, HTTP methods, request/response field names, CSRF/session headers and login/security checks.
- BoloSite embed script URL, `data-site-id`, page identifiers, and runtime/chat/state settings.
- Consent/publication choices and the distinction between sample, unknown and measured business results.
- Jinja template syntax and escaping in admin pages.

Presentation changes can include layout, typography, colors, visible copy, imagery, spacing, responsiveness, menus and dialogs while retaining those contracts. Avoid global CSS selectors that unintentionally alter an embedded widget; the core team must check the redesigned pages with the real widget before release.

## Main-project integration

The core team should review and merge only the intended website changes, run the existing browser build if bundled website JavaScript changed, and use the main project's relevant checks. The production build also needs the protected core runtime inputs that are deliberately absent here.

Never copy `preview/`, its fixture data/toolbar, `start-preview.cmd`, this package's `requirements.txt`, or its local environment into the production application. Do not replace the root application entrypoint, production requirements, runtime assets or deployment configuration with handoff helpers. There is no automatic copy-back or deployment command in this package.

Verify real login, owner workflows, enquiry submissions, permissions and existing chat/orb/state behavior in the integrated application. Passing the standalone preview confirms website rendering and the tested UI interactions; it does not validate production services.
