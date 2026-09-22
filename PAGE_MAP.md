# Page and content map

Every path below is available in the standalone preview. HTML files include the real editable copy; Jinja admin placeholders receive invented data from `preview/fixtures.py`.

| Page | Preview URL | Main source | Shared frontend |
| --- | --- | --- | --- |
| Homepage | `/` | `templates/index.html` | `style.css`, `homepage.css`, `script.js`, `clean-navigation.js` |
| What is BoloSite | `/what-is-bolosite` | `templates/what-is-bolosite.html` | `style.css`, `homepage.css`, `script.js`, `clean-navigation.js` |
| Future / roadmap | `/future` | `templates/future.html` | `style.css`, `homepage.css`, `script.js`, `clean-navigation.js` |
| Pricing | `/pricing` | `templates/pricing.html` | `style.css`, `homepage.css`, `script.js`, `clean-navigation.js` |
| Contact | `/contact` | `templates/contact.html` | `style.css`, `homepage.css`, `script.js`, `clean-navigation.js` |
| Visitor guide | `/visitor` | `templates/user.html` | `style.css`, `homepage.css`, `guide-pages.css`, `clean-navigation.js` |
| Owner guide | `/owner` | `templates/client.html` | `style.css`, `homepage.css`, `guide-pages.css`, `clean-navigation.js` |
| Trust / Feedback & Results | `/trust` | `templates/proof.html` | `proof.css`, `proof.js` |
| Owner login and portal | `/owner-portal` | `templates/bolosite_owner-portal.html` | `clean-navigation.js`, `owner-quick-suggestions.js`, Analysis CSS/JS |
| Test Lab | `/test-lab` | `templates/bolosite_test.html` | `clean-navigation.js`; inline UI logic/styles |
| Enquiry responses | `/enquiry-data` | `templates/bolosite_enquiry-data.html` | Inline UI logic/styles |
| Admin login and home | `/admin` | `templates/bolosite_admin.html` | Inline CSS; Jinja rendering |
| Admin enquiry list and detail | `/admin/enquiry` | `templates/bolosite_admin-enquiry.html` | Inline CSS; Jinja rendering |
| Admin feedback moderation | `/admin/proof` | `templates/bolosite_admin-proof.html` | `proof.css`; Jinja rendering |

CSS filenames above live in `assets/css/`; JavaScript filenames in `assets/js/`, except Analysis files below. The original `/api/pages/...` and common `.html` page aliases are also supported in the preview.

## Owner portal sections

The Owner Portal is one large HTML template with multiple panels, not one file per panel. Search for `data-dashboard-target`, `data-dashboard-section`, panel titles or these URL fragments:

`#overview`, `#domains`, `#content`, `#sales-agent`, `#intents`, `#forms`, `#language`, `#response-style`, `#embed`, `#enquiries`, `#analysis`, `#billing`, `#settings`, `#admin`.

Login, registration, password reset, profile and security dialogs are in the same template. Keep their field names, validation and API calls compatible while changing presentation. Chat, voice and state settings are controls for the protected runtime; do not change their meaning/defaults or the installation snippet as part of the website redesign.

The Analysis markup is in this template. Its external UI code is in:

- `website_owner_analysis/dashboard.css`
- `website_owner_analysis/dashboard.js`

The preview maps `/api/client/analysis-ui.css`, `/api/client/analysis-ui.js` and `/api/client/quick-suggestions-ui.js` to these readable frontend files; there is no production API behind those display routes.

## Where to change content

- Page headings, paragraphs, CTA labels, navigation/footer text: corresponding HTML template.
- Text created after clicking or loading data: inline `<script>` blocks or the linked website JS.
- Feedback translations: language dictionaries inside `assets/js/proof.js`.
- Owner analytics labels: owner template plus `website_owner_analysis/dashboard.js`.
- Page titles, description/canonical/social metadata: template `<head>`.
- Logos, founder image and video files: `assets/images/` and `assets/video/`.
- Fictional dashboard data for layout experiments: `preview/fixtures.py`. This file never goes into production.

There is no new central content CMS in this package. Preserve the existing source structure so the reviewed design can be merged back reliably. Do not remove Jinja expressions such as `{{ ... }}` or `{% ... %}` in admin templates; these render real values in the original app.
