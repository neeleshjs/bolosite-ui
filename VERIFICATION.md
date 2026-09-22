# Handoff verification

Verified locally on 21 September 2026 using Python 3.11, Flask 3.1.3 and installed Microsoft Edge through Playwright.

| Check | Result |
| --- | --- |
| Original website source copies | 33 files match their baseline SHA-256 hashes, including the three videos |
| All page routes | 10/10 return working HTML, including rendered admin templates |
| Referenced local page assets | 19 distinct asset URLs return successfully |
| Browser rendering | All 10 pages opened at 1440×1000 and 390×844 |
| Website interactions | Desktop/mobile theme switch, mobile menu, all 14 owner navigation targets, Analysis/Activity tabs, feedback language switch, enquiry response drawer and login screens passed |
| Browser errors | No uncaught JavaScript errors or failed local requests during the tested browsing flows |
| JavaScript syntax | 8 website/helper JavaScript files passed `node --check` |
| Sensitive/core exclusions | No agent, loader, compiled assistant runtime, tracker, environment files or main app backend included; direct requests for protected paths return 404 |
| Preview isolation | Production-style write requests return explicit preview-only errors; browser API connections and form submissions restricted to local origin |
| Standalone portability | Copied the folder outside the repository, passed static checks and launched the preview CLI successfully without the main project |
| Main-project preservation | Task-start hashes checked for 244 existing files, including original website/core sources and environment files; only README, version history and Docker exclusion changed |

Reproduce the automated page/asset and browser checks from this folder:

```powershell
python -B preview/validate.py --check-baseline --browser --channel msedge
```

After intentional design edits, omit `--check-baseline`; the baseline hashes are expected to differ. See README for browser/dependency setup.

These are local UI checks with invented fixtures. They do not verify real credentials, payments, AI jobs, exports, server-side saves, live analytics or provider/device behavior. Runtime chat/orb/state is intentionally absent from the handoff preview and unchanged in the main project. No production deployment or Git publication was performed.

Temporary verification copies and task-start snapshots were removed after checks. No preview server is left running by the verification workflow.
