"""Invented design-preview data. No production imports, keys or customer records."""
from copy import deepcopy

NOW = "2026-09-21T10:00:00Z"
SITE = {
    "site_id": "SITE_DESIGN_DEMO", "folder": "demo-only",
    "client_name": "Sample Studio", "project_name": "Sample Studio Website",
    "website_type": "business", "website_type_label": "Business website",
    "status": "trial", "trial_days_left": 14, "assistant_name": "BoloSite AI",
    "default_language": "en", "domains": [], "intents": [], "forms": {},
    "content": {"website": "Sample Studio offers website design and support. This is fictional preview content.", "sales": "Contact the sample team to discuss your project."},
    "notes": "Fictional account for website design preview only.",
    "embed_code": "<!-- Existing BoloSite integration is managed by the core team. -->",
    "language_config": {"base_language_codes": ["en", "hi"], "default_language": "en"},
}
ENQUIRY = {
    "id": "demo-enquiry", "enquiry_id": "demo-enquiry", "title": "Sample website enquiry",
    "status": "published", "description": "Fictional example for layout review.",
    "questions": [{"key": "service", "text": "Which service interests you?", "type": "text"}],
    "created_at": NOW, "updated_at": NOW,
    "stats": {"total": 1, "completed": 1, "partial": 0},
}
RESPONSE = {
    "response_id": "demo-response", "respondent_name": "Sample Visitor",
    "status": "completed", "progress": "1 / 1", "language": "en", "channel": "text",
    "audience": "visitor", "consented": True, "created_at": NOW, "updated_at": NOW,
    "answers": {"service": "Website redesign"}, "question_snapshot": ENQUIRY["questions"],
}
REVIEW = {
    "id": "demo-review", "display_name": "Sample Reviewer", "role": "visitor",
    "rating": 4, "category": "general", "language": "en", "created_at": NOW,
    "comment": "Fictional review for testing the card layout and typography.",
    "visibility": "public", "status": "approved", "outcome": "yes",
    "owner_verified": False, "allow_website": False, "allow_metrics": False,
    "channel": "text", "reply": "", "issue_status": "reviewing",
}


def proof_data():
    return {
        "summary": {"average": 4, "rated": 1, "reviews": 1},
        "distribution": {"4": 1}, "roles": [{"role": "visitor", "count": 1, "rated": 1, "average": 4}],
        "outcomes": [], "categories": [], "role_topics": [],
        "reviews": [deepcopy(REVIEW)], "updates": [], "websites": [], "has_more": False,
        "usage": {"available": False}, "updated_at": NOW,
    }


def analysis_data():
    metrics = {key: 0 for key in ["events", "visitors", "assistant_users", "requests", "forms", "failed_requests", "legacy_calls", "delivered"]}
    return {
        "metrics": metrics, "previous": metrics.copy(),
        "filters": {"from": "2026-09-01", "to": "2026-09-21", "timezone": "Asia/Kolkata", "start": 1788192000, "end": 1789948800},
        "availability": {"page_views": False, "journey": False, "forms": False},
        "coverage": {"first_event": None, "last_event": None, "tracking_since": None, "detailed_since": None, "retention_days": 30, "expected_pages": 0, "unobserved_pages": []},
        "profile": {"label": "Design preview", "results_label": "Sample business results", "journey": "Visit > Enquiry > Follow-up", "topics": ["Services", "Contact"]},
        "enquiries": {"available": True, "completed": 1, "total": 1, "partial": 0, "completion_rate": 100, "audience": [], "reason": "Fictional sample enquiry; no live measurement."},
        "daily": [], "topics": [], "examples": [], "pages": [], "busy": [], "monthly": [], "insights": [],
        "breakdown": {key: [] for key in ["request_type", "language", "channel", "device", "referrer", "utm_source", "utm_campaign"]},
        "audience": {}, "journey": {},
        "business": {"items": [], "attribution": [], "connected": False, "available": False, "reason": "No business service connected in this preview."},
        "quality": {"owner_reviews": [], "visitor_feedback": [], "note": "No live runtime measurements in the UI package."},
        "health": {"queued": 0, "retrying": 0, "rejected": 0, "delivery": "Preview only."},
        "readiness": {"checks": [], "note": "This preview does not assess production readiness."},
    }


def billing_data():
    money = lambda n: {"rupees": n}
    return {
        "month": "2026-09", "charges": {key: money(0) for key in ["total", "requests", "wallet_auto_deducted", "uncovered_overage"]},
        "wallet": {"balance": money(0)}, "account": {"status": "trial", "status_label": "Sample account"},
        "trial": {"active": True, "days_left": 14}, "credit": {"limit": money(1000), "used_percent": 0},
        "warnings": [{"level": "info", "message": "Fictional preview. Payments are unavailable."}],
        "pricing": {"base_charge": money(0)}, "usage": {"billable_request_count": 0},
        "invoices": [], "payments": [],
    }


def api_fixture(path):
    """Only explicit display fixtures; unknown endpoints must report unavailable."""
    if path == "/api/client/dashboard":
        return {"site": deepcopy(SITE)}
    if path == "/api/client/dashboard/billing":
        return {"billing": billing_data()}
    if path == "/api/client/dashboard/content-builder/jobs":
        return {"jobs": [], "controls": {}}
    if path == "/api/client/dashboard/rag/status":
        return {"site": deepcopy(SITE), "status": "idle"}
    if path == "/api/client/dashboard/enquiries":
        return {"enquiries": [deepcopy(ENQUIRY)], "summary": {"total": 1, "published": 1}}
    if path == "/api/client/dashboard/enquiries/demo-enquiry":
        return {"enquiry": deepcopy(ENQUIRY)}
    if path == "/api/client/dashboard/enquiries/demo-enquiry/responses":
        return {"responses": [deepcopy(RESPONSE)], "columns": [{"key": "service", "label": "Which service interests you?"}], "summary": {"total": 1, "completed": 1}, "pagination": {"page": 1, "pages": 1, "total": 1, "limit": 50}}
    if path == "/api/client/dashboard/enquiries/demo-enquiry/analysis":
        return {"analysis": {"total": 1, "completed": 1}}
    if path == "/api/client/dashboard/analysis":
        return analysis_data()
    if path in ["/api/client/dashboard/analysis/activity", "/api/client/dashboard/analysis/pages"]:
        return {"items": [], "pages": [], "total": 0, "has_more": False}
    if path == "/api/client/dashboard/analysis/saved-reports":
        return {"reports": []}
    if path == "/api/client/dashboard/analysis/settings":
        return {"settings": {}, "profile": analysis_data()["profile"], "integration": {}, "templates": [], "goals": [], "languages": {"en": "English", "hi": "Hindi"}}
    if path == "/api/client/dashboard/quick-suggestions":
        return {"settings": {"mode": "auto", "items": [], "hidden": [], "order": []}, "candidates": []}
    if path == "/api/bolosite-test/jobs":
        return {"jobs": []}
    if path == "/api/client/profile":
        return {"profile": {"name": "Sample Owner", "email": "owner@example.test", "client_name": "Sample Studio", "security": {}}}
    if path == "/api/proof/context":
        return {"csrf_token": "preview-only", "owner_verified": False, "sites": [], "site_id": ""}
    if path == "/api/proof/public":
        return proof_data()
    if path == "/api/proof/review/demo-review":
        return {"review": deepcopy(REVIEW)}
    return None
