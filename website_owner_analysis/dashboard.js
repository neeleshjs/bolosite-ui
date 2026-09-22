/* Owner-only reports. Counts and filters come from the authenticated reporting API. */
(() => {
    let api = null, site = null, report = null, initialized = false, version = 0, activityVersion = 0;
    let selectedTab = "overview", offset = 0, controller = null, activityController = null, applied = {}, pageOffset = 0, pageVersion = 0, settingsVersion = 0;
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const num = value => value == null ? "—" : Number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 });
    const names = { en: "English", hi: "Hindi", hinglish: "Hinglish", chat: "Chat", voice: "Voice", unknown: "Not recorded", "": "Not recorded", mobile: "Mobile", desktop: "Desktop", tablet: "Tablet" };
    const label = value => names[value] || value;
    const stamp = value => value ? new Date(value*1000).toLocaleString("en-IN", { timeZone: report?.filters.timezone || "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
    const empty = message => `<div class="an-empty">${esc(message || "No matching activity in this period. Try a wider date range or clear filters.")}</div>`;
    const table = (headers, rows) => rows.length ? `<div class="an-table"><table><thead><tr>${headers.map(x=>`<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : empty();
    const evidence = (text, filters) => `<button type="button" data-an-evidence="${esc(JSON.stringify(filters))}">${esc(text)}</button>`;
    function values() { return Object.fromEntries(new FormData($("anFilters"))); }
    function query(extra = {}, selection = applied) { const params = new URLSearchParams({ ...selection, ...(report ? {as_of: report.filters.as_of,snapshot:report.snapshot || ""} : {}), ...extra }); for (const [k,v] of [...params]) if (!v) params.delete(k); return params.toString(); }
    function status(message, error = false) { $("anStatus").textContent = message; $("anStatus").dataset.error = String(error); }
    function bars(items, key = "label", count = "count", filter = "") {
        if (!items?.length) return empty();
        const max = Math.max(1, ...items.map(r=>r[count] || 0));
        return `<div class="an-bars">${items.map(r=>`<div class="an-bar"><div><span>${filter ? evidence(label(r[key]) || "Not recorded", { [filter]: r[key], kind: filter === "referrer" ? "page_view" : "request" }) : esc(label(r[key]))}</span><strong>${num(r[count])}</strong></div><div class="an-track" aria-hidden="true"><i style="width:${Math.max(1,(r[count] || 0)/max*100)}%"></i></div></div>`).join("")}</div>`;
    }
    function card(title, value, help, filter, previous, suffix = "") {
        const tag = filter && value != null ? "button" : "div";
        let change = "";
        if (previous != null && value != null) change = `<small class="an-change">${num(previous)} in previous equal-duration period${previous ? ` · ${value>=previous?"+":""}${num((value-previous)/previous*100)}%` : ""}</small>`;
        return `<${tag} class="an-metric"${tag === "button" ? ` type="button" data-an-evidence="${esc(JSON.stringify(filter))}"` : ""}><span>${esc(title)}</span><strong>${num(value)}${value == null ? "" : esc(suffix)}</strong><small>${esc(help)}</small>${change}</${tag}>`;
    }
    function insight(item) { return `<div class="an-insight"><span class="an-tag">${esc(item.priority)}</span><div><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p>${evidence("View supporting activity →", item.filter)}</div></div>`; }
    function trend(daily, tracked) {
        if (!daily.length) return empty("No activity recorded for this selection. New activity will appear after visitors use the updated website embed.");
        const max = Math.max(1, ...daily.flatMap(d=>[d.requests || 0,tracked ? d.views || 0 : 0]));
        const w = 600, h = 210, left = 45, bottom = 175, gap = (w-left-20)/Math.max(1,daily.length-1);
        const y = value => bottom-(value || 0)/max*150;
        const path = key => { let connected=false; return daily.map((d,i)=>{if(d[key]==null){connected=false;return "";}const part=`${connected?"L":"M"}${left+i*gap},${y(d[key])}`;connected=true;return part;}).join(" "); };
        return `<div class="an-legend"><span>Requests</span>${tracked?"<span>Page views</span>":""}</div>${tracked?"":"<p>Page views are unavailable for this selection.</p>"}<svg class="an-plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="Daily recorded activity; dates and exact counts in the table below"><line x1="${left}" y1="${bottom}" x2="580" y2="${bottom}" stroke="currentColor" opacity=".15"/><g fill="currentColor" font-size="11"><text x="35" y="29" text-anchor="end">${num(max)}</text><text x="35" y="179" text-anchor="end">0</text><text x="${left}" y="201">${esc(daily[0].day)}</text><text x="580" y="201" text-anchor="end">${esc(daily.at(-1).day)}</text></g><path d="${path("requests")}" stroke="currentColor" stroke-width="3" fill="none"/>${tracked?`<path d="${path("views")}" stroke="#258a89" stroke-width="3" fill="none"/>`:""}${daily.map((d,i)=>d.requests==null ? "" : `<circle cx="${left+i*gap}" cy="${y(d.requests)}" r="4" fill="currentColor"><title>${esc(d.day)}: ${num(d.requests)} requests${tracked?`, ${num(d.views)} views`:""}</title></circle>`).join("")}</svg><details><summary>Daily counts · ${esc(daily[0].day)} to ${esc(daily.at(-1).day)}</summary>${table(["Date ("+(report?.filters.timezone || "Asia/Kolkata")+")","Requests","Page views"],daily.map(d=>[esc(d.day),num(d.requests),tracked?num(d.views):"—"]))}</details>`;
    }
    function render(data) {
        const m=data.metrics, p=data.previous, c=data.coverage, enq=data.enquiries;
        const eventFiltered = ["language","channel","q","topic","status"].some(key=>data.filters[key]);
        const tracked = data.availability.page_views;
        const journeyAvailable = data.availability.journey;
        const detailed = c.detailed_since && c.detailed_since < data.filters.end;
        pageOffset=0;pageVersion++;
        $("anProfile").textContent = `${data.profile.label} · ${site.client_name || site.project_name || site.site_id}`;
        $("anSelection").textContent = `${data.filters.from} to ${data.filters.to} · ${data.filters.timezone} · ${Object.entries(applied).filter(([k,v])=>v && !["period","from","to"].includes(k)).map(([k,v])=>`${k}: ${v}`).join(" · ") || "All matching activity"}`;
        let coverageNote = `${num(m.events)} matching activity records. Updated ${new Date().toLocaleTimeString("en-IN", { timeZone: report?.filters.timezone || "Asia/Kolkata" })} ${data.filters.timezone}.`;
        if (m.legacy_calls) coverageNote += ` Includes ${num(m.legacy_calls)} historical calls without turn IDs, questions or confirmed results.`;
        if (!tracked) coverageNote += eventFiltered || data.filters.kind ? " Visitor/page-view metrics are not available under these event filters." : " Page-view tracking is not available for this period.";
        if (data.import?.pending) coverageNote += " Historical import is incomplete; refresh to continue loading records.";
        if (c.first_event && data.filters.start<c.first_event) coverageNote += ` Available activity begins ${stamp(c.first_event)}.`;
        status(coverageNote);
        $("anMetrics").innerHTML = [
            card("Tracked website visitors",tracked?m.visitors:null,"Distinct observed browsers, not exact people.",{kind:"page_view"},tracked?p.visitors:null),
            card("BoloSite users",m.assistant_users,"Browsers with recorded assistant requests.",{kind:"request"},p.assistant_users),
            card("User requests",m.requests,m.legacy_calls?"Includes historical calls; old retries cannot be identified.":"Distinct recorded user turns.",{kind:"request"},p.requests),
            card("Completed enquiries",enq.completed,enq.available?"Confirmed answers, not an admission or sale.":enq.reason,null),
            card("Confirmed form submissions",m.forms,data.availability.forms?"Validated receipts counted on confirmation date.":"Cannot determine form results under these filters or coverage.",{kind:"action",status:"submission_completed"},detailed?p.forms:null),
            card("Requests needing review",detailed?m.failed_requests:null,"Recorded request failures; inspect the related activity.",{kind:"request",status:"request_failed"},detailed?p.failed_requests:null)
        ].join("");
        $("anTrend").innerHTML=trend(data.daily, tracked);
        $("anHighlights").innerHTML=data.insights.slice(0,2).map(insight).join("") || empty("No evidence-based recommendations yet. New requests will help reveal demand and recurring issues.");
        $("anCoverage").innerHTML=`<div class="an-definition"><p>First available activity: ${esc(stamp(c.first_event))}<br>Last activity: ${esc(stamp(c.last_event))}<br>Page tracking observed since: ${esc(stamp(c.tracking_since))}<br>Detailed request/result tracking since: ${esc(stamp(c.detailed_since))}<br>Detailed tracking retention: ${num(c.retention_days)} days. Original historical logs are retained; earlier detailed records may be unavailable.</p><p>Counts cover only the pages where the embed reports activity. Browser privacy settings, blocked scripts and delivery failures can reduce coverage. Historical calls cannot establish page views, sessions or question topics.</p><p>Response started means a request returned response headers; it does not confirm correctness, complete playback or resolution. Enquiries use their creation date and current status. No sales, revenue, appointment attendance or admissions are inferred from form submissions.</p><p>Topic/language suggestions use wording rules, with unclassified requests kept visible. New/returning means first observed within retained data. Source filters never turn an unidentified browser into a confirmed customer.</p></div>`;
        $("anTopics").innerHTML=bars(data.topics.filter(x=>x.topic),"topic","requests","topic");
        $("anTypes").innerHTML=bars(data.breakdown.request_type);
        $("anExamples").innerHTML=data.examples.length?data.examples.map(x=>`<div class="an-sample"><p>${esc(x.question)}</p><span class="an-tag">${esc(x.topic)}</span><span class="an-tag">${esc(x.request_type)}</span>${evidence(x.page,{page:x.page,kind:"request"})}</div>`).join(""):empty("No question examples are available. Historical logs do not contain questions; form and personal values are excluded.");
        $("anLanguages").innerHTML=bars(data.breakdown.language,"label","count","language");
        $("anChannels").innerHTML=bars(data.breakdown.channel,"label","count","channel");
        $("anDevices").innerHTML=bars(data.breakdown.device,"label","count","device");
        $("anReturning").innerHTML=bars([{label:"First observed in period",count:data.audience.new_browsers || 0},{label:"Observed before period",count:data.audience.returning_browsers || 0}])+`<p>All matching activity. Retained browser history, not verified new or repeat customers.</p>`;
        $("anAudience").innerHTML=enq.available?bars(enq.audience):empty(enq.reason);
        $("anPages").innerHTML=table(["Page","Visitors","Views","Requests","Active time","Issues"],data.pages.map(x=>[evidence(x.page,{page:x.page})+`<small>${esc(x.title)}</small>`,tracked?num(x.visitors):"—",tracked?num(x.views):"—",num(x.requests),tracked?`${num(x.active_seconds/60)} min`:"—",num(x.issues)]));
        $("anPageOptions").innerHTML=data.pages.map(x=>`<option value="${esc(x.page)}"></option>`).join("");
        $("anJourney").innerHTML=journeyAvailable?bars([{label:"Sessions with page views",count:data.journey.viewed || 0},{label:"Then a user request",count:data.journey.asked || 0},{label:"Then a confirmed form submission",count:data.journey.submitted || 0}]):empty("Session progression needs page tracking and matching session IDs. Clear event/language/channel filters to see the complete sequence.");
        const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        $("anBusy").innerHTML=bars(data.busy.map(x=>({label:`${days[Number(x.weekday)]} ${x.hour}:00 ${data.filters.timezone}`,count:x.requests})));
        $("anReferrers").innerHTML=bars(data.breakdown.referrer.map(x=>({...x,label:x.label || "Direct / unknown"})));
        $("anBusinessTitle").textContent=data.profile.results_label;
        $("anBusinessJourney").textContent=data.profile.journey;
        $("anBusinessTopics").innerHTML=data.profile.topics.map(x=>`<span class="an-tag">${esc(x)}</span>`).join("");
        $("anResultCards").innerHTML=card("Enquiries started",enq.total,enq.reason)+card("Enquiry completion rate",enq.completion_rate,enq.total?`${num(enq.completed)} / ${num(enq.total)} consented enquiries`:"No eligible enquiry denominator",null,null,"%")+card("Delivered answer records",detailed?m.delivered:null,"Completed history receipts, not independently verified resolution.",{kind:"answer"});
        $("anEnquiries").innerHTML=enq.available?bars([{label:"Completed",count:enq.completed},{label:"In progress / review / paused",count:enq.partial}])+`<p>${esc(enq.reason)}</p>`:empty(enq.reason);
        const business=data.business;
        $("anBusinessOutcomes").innerHTML=business.items.length ? table(["Confirmed outcome","Count","Recorded amount","Request links"],business.items.map(x=>[esc(x.name),num(x.count),esc(x.amount_display),num(x.attributed)])) : empty(business.connected ? business.available?"No matching business confirmations yet.":business.reason : "Not connected. Generate a server integration key below and connect your business system.");
        $("anBusinessOutcomes").innerHTML+=`<p>${esc(business.reason)}</p>`;
        $("anAttribution").innerHTML=table(["Page","Topic","Source / campaign","Confirmed outcomes"],business.attribution.map(x=>[esc(x.page),esc(x.topic),esc([x.utm_source,x.utm_campaign].filter(Boolean).join(" / ")) || "Not recorded",num(x.outcomes)]));
        $("anCampaigns").innerHTML=bars(data.breakdown.utm_source.filter(x=>x.label))+bars(data.breakdown.utm_campaign.filter(x=>x.label));
        const q=data.quality, h=data.health;
        $("anQuality").innerHTML=table(["Measure","Recorded value"],[
            ["Requests with a delivered-answer receipt",num(q.requests_with_delivery)],
            ["Requests without a matching delivery receipt",num(q.delivery_missing)],
            ["Median response-header latency",`${num(q.latency_p50_ms)} ms`],
            ["95th percentile response-header latency",`${num(q.latency_p95_ms)} ms`]
        ])+`<p>${esc(q.note)} Sample: ${num(q.latency_sample)} of ${num(q.latency_total)} measured requests.</p>`+bars(q.owner_reviews.map(x=>({label:`Owner: ${x.quality}`,count:x.count})))+bars(q.visitor_feedback.map(x=>({label:`Visitor: ${x.status}`,count:x.count})));
        $("anHealth").innerHTML=table(["Measurement status","Value"],[
            ["Expected pages",num(c.expected_pages)], ["Expected pages not observed in this selection",num(c.unobserved_pages.length)],
            ["Durable batches waiting to be processed",num(h.queued)], ["Batches waiting for retry",num(h.retrying)], ["Intake events rejected since restart",num(h.rejected)]
        ])+`<p>${esc(h.delivery)} An unobserved page is a check to perform, not proof of a missing script.</p>`+ (c.unobserved_pages.length?table(["Expected page not observed"],c.unobserved_pages.map(x=>[esc(x)])):"");
        $("anMonthly").innerHTML=table(["Month (UTC)","Requests","Page views","Confirmed forms"],data.monthly.map(x=>[esc(x.month),num(x.requests),num(x.views),num(x.forms)]));
        $("anReadiness").innerHTML=table(["Client setup check","Status","Details"],data.readiness.checks.map(x=>[esc(x.name),esc(x.status.replaceAll("_"," ")),esc(x.detail)]))+`<p>${esc(data.readiness.note)}</p>`;
        $("anImprovements").innerHTML=data.insights.map(insight).join("") || empty("No supported improvement suggestions for this selection. Try a wider period once activity is available.");
        $("anBody").hidden=false;
        $("anCsv").disabled=false; $("anPrint").disabled=false;
        if(selectedTab==="activity") void loadActivity();
    }
    async function load() {
        if(!site || !api) return;
        initialize();
        controller?.abort(); activityController?.abort();
        controller=new AbortController();
        const current=++version;
        const selection=values();
        offset=0; pageOffset=0; report=null;
        $("anBody").hidden=true; $("anCsv").disabled=true; $("anPrint").disabled=true;
        status("Loading your report…");
        try {
            const data=await api(`/api/client/dashboard/analysis?${query({}, selection)}`,{signal:controller.signal});
            if(current!==version) return;
            applied=selection;report=data; render(data);
        } catch(error) { if(current===version && error.name!=="AbortError") status(`Report could not load. ${error.message} Use Refresh to retry.`,true); }
    }
    async function loadActivity() {
        if(!site || !report) return;
        activityController?.abort(); activityController=new AbortController();
        const current=++activityVersion, sessionVersion=version;
        $("anActivityStatus").textContent="Loading activity…";
        $("anActivity").innerHTML=""; $("anNext").disabled=true; $("anPrev").disabled=true;
        try {
            const data=await api(`/api/client/dashboard/analysis/activity?${query({offset})}`,{signal:activityController.signal});
            if(current!==activityVersion || sessionVersion!==version) return;
            $("anActivity").innerHTML=table(["Time ("+report.filters.timezone+")","Activity","Page","Visitor","Details"],data.items.map(x=>[esc(new Date(x.time).toLocaleString("en-IN",{timeZone:report.filters.timezone})),esc(x.kind.replaceAll("_"," "))+`<small>${esc(x.status.replaceAll("_"," "))}</small>`,evidence(x.page,{page:x.page}),evidence(x.visitor,{q:x.visitor}),`<details><summary>View details</summary><p>${esc(x.question || "No question text recorded.")}</p><small>${esc([label(x.channel),label(x.language),label(x.device),x.topic,x.environment,x.source].filter(Boolean).join(" · "))}</small><small>Session: ${esc(x.session_id || "Not recorded")}</small><small>Full visitor reference: ${esc(x.visitor_full)}</small><small>Request reference: ${esc(x.id)}</small>${x.kind==="request"?`<div class="an-review" data-review-id="${esc(x.id)}"><label>Correct topic<input data-review-topic maxlength="70" value="${esc(x.topic)}"></label><label>Owner review<select data-review-quality><option value="">No quality review</option><option value="helpful">Helpful</option><option value="unhelpful">Unhelpful</option><option value="missing_answer">Missing answer</option><option value="needs_review">Needs review</option></select></label><button type="button" class="btn ghost" data-review-save>Save review</button><span role="status"></span></div>`:""}</details>`]));
            $("anActivityStatus").textContent=data.import?.pending?"Historical import is incomplete. Refresh the report to continue.":"";
            $("anActivityCount").textContent=`${data.total?offset+1:0}–${offset+data.items.length} of ${num(data.total)}`;
            $("anPrev").disabled=offset===0; $("anNext").disabled=!data.has_more;
        } catch(error) { if(current===activityVersion && sessionVersion===version && error.name!=="AbortError") $("anActivityStatus").textContent=`Activity could not load: ${error.message}`; }
    }
    function tab(name) {
        if(!["overview","demand","pages","results","improvements","activity"].includes(name)) return;
        selectedTab=name;
        document.querySelectorAll("[data-an-tab]").forEach(button=>{const active=button.dataset.anTab===name;button.setAttribute("aria-selected",String(active));button.tabIndex=active?0:-1;$("anPanel-"+button.dataset.anTab).hidden=!active;});
        if(name==="activity") void loadActivity();
    }
    function initialize() {
        if(initialized || !$("analysis")) return;
        initialized=true;
        $("anFilters").addEventListener("submit",event=>{event.preventDefault();void load();});
        $("anFilters").elements.period.addEventListener("change",()=>document.querySelectorAll("[data-an-custom]").forEach(x=>x.hidden=$("anFilters").elements.period.value!=="custom"));
        $("anPagesPrev").addEventListener("click",()=>{pageOffset=Math.max(0,pageOffset-100);void loadPages();});
        $("anPagesNext").addEventListener("click",()=>{pageOffset+=100;void loadPages();});
        $("anSettingsForm").addEventListener("submit",saveSettings);
        $("anSettingsPanel").addEventListener("toggle",()=>{if($("anSettingsPanel").open)void loadSettings();});
        $("anCreateKey").addEventListener("click",()=>void integrationKey(false));
        $("anRevokeKey").addEventListener("click",()=>void integrationKey(true));
        $("anSavedRefresh").addEventListener("click",()=>void loadSaved());
        $("anDeleteForm").addEventListener("submit",deleteDetails);
        $("anActivity").addEventListener("click",async event=>{
            const button=event.target.closest("[data-review-save]");if(!button)return;
            const row=button.closest("[data-review-id]"), message=row.querySelector('[role="status"]');button.disabled=true;
            try{await api("/api/client/dashboard/analysis/review",{method:"POST",body:JSON.stringify({event_id:row.dataset.reviewId,topic:row.querySelector("[data-review-topic]").value,quality:row.querySelector("[data-review-quality]").value})});message.textContent="Review saved. Refresh to update the report.";}
            catch(error){message.textContent=error.message;}finally{button.disabled=false;}
        });
        $("anClear").addEventListener("click",()=>{$("anFilters").reset();document.querySelectorAll("[data-an-custom]").forEach(x=>x.hidden=true);void load();});
        $("anRefresh").addEventListener("click",()=>void load());
        $("anPrev").addEventListener("click",()=>{offset=Math.max(0,offset-30);void loadActivity();});
        $("anNext").addEventListener("click",()=>{offset+=30;void loadActivity();});
        $("anPrint").addEventListener("click",()=>void downloadPdf());
        $("anCsv").addEventListener("click",async()=>{
            try {
                const response=await fetch(`/api/client/dashboard/analysis/export?${query()}`,{credentials:"include"});
                if(!response.ok) throw new Error((await response.json()).error || "Export failed");
                const url=URL.createObjectURL(await response.blob()), a=document.createElement("a");
                a.href=url;a.download=`analysis-activity-${report.filters.from}-${report.filters.to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
            }catch(error){status(error.message,true);}
        });
        $("anOpenEnquiries").addEventListener("click",event=>{event.preventDefault();document.querySelector('[data-dashboard-target="enquiries"]')?.click();});
        $("analysis").addEventListener("click",event=>{
            const button=event.target.closest("[data-an-tab],[data-an-evidence]"); if(!button)return;
            if(button.dataset.anTab){tab(button.dataset.anTab);return;}
            let filters;try{filters=JSON.parse(button.dataset.anEvidence);}catch{return;}
            $("anFilters").reset();
            Object.entries(applied).forEach(([key,value])=>{const field=$("anFilters").elements.namedItem(key);if(field)field.value=value;});
            Object.entries(filters).forEach(([key,value])=>{const field=$("anFilters").elements.namedItem(key);if(field)field.value=value;});
            tab("activity");void load();
        });
        $("anTabs").addEventListener("keydown",event=>{
            if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
            const buttons=[...$("anTabs").querySelectorAll("button")],index=buttons.indexOf(document.activeElement);if(index<0)return;
            event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?buttons.length-1:(index+(event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length;
            buttons[next].focus();tab(buttons[next].dataset.anTab);
        });
    }
    function renderPages(data) {
        const a=report.availability;
        $("anPages").innerHTML=table(["Page","Visitors","Views","Requests","Active time","Issues"],data.items.map(x=>[
            evidence(x.page,{page:x.page})+`<small>${esc(x.title)}</small>`,a.visitors?num(x.visitors):"—",a.page_views?num(x.views):"—",
            a.requests?num(x.requests):"—",a.active_seconds?`${num((x.active_seconds || 0)/60)} min`:"—",num(x.issues)]));
        $("anPagesCount").textContent=`${data.total?data.offset+1:0}–${data.offset+data.items.length} of ${num(data.total)} pages`;
        $("anPagesPrev").disabled=data.offset===0;$("anPagesNext").disabled=!data.has_more;
    }
    async function loadPages() {
        const current=++pageVersion, sessionVersion=version;
        $("anPagesPrev").disabled=true;$("anPagesNext").disabled=true;
        try{const data=await api(`/api/client/dashboard/analysis/pages?${query({page_offset:pageOffset})}`);if(current===pageVersion && sessionVersion===version)renderPages(data);}
        catch(error){if(current===pageVersion && sessionVersion===version){$("anPagesCount").textContent=error.message;$("anPagesPrev").disabled=pageOffset===0;}}
    }
    async function downloadPdf() {
        if(!report)return;
        const current=version, button=$("anPrint");button.disabled=true;button.textContent="Preparing PDF…";
        try {
            const response=await fetch(`/api/client/dashboard/analysis/pdf?${query()}`,{credentials:"include"});
            if(!response.ok)throw Error((await response.json()).error || "PDF download failed");
            const blob=await response.blob();if(current!==version)return;
            const url=URL.createObjectURL(blob),link=document.createElement("a");
            link.href=url;link.download=`website-analysis-${report.filters.from}-${report.filters.to}.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
        }catch(error){if(current===version)status(error.message,true);}
        finally{button.textContent="Download full PDF";button.disabled=!report;}
    }
    const listLines=value=>String(value || "").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const commaList=value=>String(value || "").split(",").map(x=>x.trim()).filter(Boolean);
    async function loadSettings() {
        if(!site || !api)return;
        const current=++settingsVersion;
        try {
            const data=await api("/api/client/dashboard/analysis/settings");if(current!==settingsVersion)return;
            const settings=data.settings, form=$("anSettingsForm");
            const types={education:"Education",ecommerce:"Ecommerce",saas:"SaaS",clinics:"Clinic / healthcare",real_estate:"Real estate",restaurants:"Restaurant / cafe",hotels_travel:"Hotel / travel",local_services:"Local services",agencies:"Agency",portfolio:"Portfolio",professional_services:"Professional services",b2b_enterprise:"B2B / enterprise",custom:"Custom website"};
            form.elements.website_type.innerHTML=Object.entries(types).map(([key,value])=>`<option value="${key}">${esc(value)}</option>`).join("");
            for(const [key,value] of Object.entries(settings)){
                const field=form.elements.namedItem(key);if(!field)continue;
                field.value=key==="custom_topics"?value.map(x=>`${x.name}: ${x.terms.join(", ")}`).join("\n"):
                    key==="topic_aliases"?Object.entries(value).map(([old,name])=>`${old} → ${name}`).join("\n"):
                    ["query_keys","test_hosts","domains"].includes(key)?value.join(", "):
                    Array.isArray(value)?value.join("\n"):String(value);
            }
            if(!form.elements.website_type.value)form.elements.website_type.value="custom";
            const language=$("anFilters").elements.language, selected=language.value;
            Object.assign(names,data.languages);
            language.innerHTML='<option value="">All languages</option>'+Object.entries(data.languages).map(([key,value])=>`<option value="${esc(key)}">${esc(value)}</option>`).join("");language.value=selected;
            $("anSettingsStatus").textContent="";
        }catch(error){if(current===settingsVersion)$("anSettingsStatus").textContent=error.message;}
    }
    async function saveSettings(event) {
        event.preventDefault();const current=settingsVersion, form=$("anSettingsForm"), button=form.querySelector('[type="submit"]');button.disabled=true;
        try {
            const data=Object.fromEntries(new FormData(form));
            data.retention_days=Number(data.retention_days);data.require_consent=data.require_consent==="true";
            for(const key of ["query_keys","test_hosts","domains"])data[key]=commaList(data[key]);
            for(const key of ["outcome_names","expected_pages"])data[key]=listLines(data[key]);
            data.custom_topics=listLines(data.custom_topics).map(line=>{const split=line.indexOf(":");if(split<1)throw Error("Each custom topic needs Name: term, term");return {name:line.slice(0,split).trim(),terms:commaList(line.slice(split+1))};});
            data.topic_aliases=Object.fromEntries(listLines(data.topic_aliases).map(line=>{const parts=line.split(/→|->/).map(x=>x.trim());if(parts.length!==2 || !parts.every(Boolean))throw Error("Each merge rule needs Old topic → New topic");return parts;}));
            await api("/api/client/dashboard/analysis/settings",{method:"POST",body:JSON.stringify(data)});
            if(current!==settingsVersion)return;$("anSettingsStatus").textContent="Settings saved. Existing embeds receive updates within five minutes.";void load();
        }catch(error){if(current===settingsVersion)$("anSettingsStatus").textContent=error.message;}
        finally{button.disabled=false;}
    }
    async function integrationKey(revoke) {
        const current=settingsVersion;$("anIntegrationKey").textContent="";$("anIntegrationKey").hidden=true;
        try {
            const data=await api("/api/client/dashboard/analysis/integration-key",{method:"POST",body:JSON.stringify({revoke})});if(current!==settingsVersion)return;
            $("anIntegrationStatus").textContent=revoke?"Integration disconnected. Previously confirmed records remain available.":"Keep this server key private. It is shown only now and replaces your previous key.";
            if(data.key){$("anIntegrationKey").hidden=false;$("anIntegrationKey").textContent=`POST ${location.origin}${data.endpoint}\nAuthorization: Bearer ${data.key}\nContent-Type: application/json\n\n${JSON.stringify({name:report?.profile.outcomes[0] || "Confirmed business outcomes",external_id:"order-unique-id",amount_minor:12500,currency:report?.settings.currency || "INR"},null,2)}\n\nSend from your server. Omit amount fields when unavailable. Optional request_ref: use a full recorded request ID from Activity or BoloSiteAnalytics.getAttribution().request_ref. Repeat the same external_id only for an identical retry.`;}
            void load();
        }catch(error){if(current===settingsVersion)$("anIntegrationStatus").textContent=error.message;}
    }
    async function loadSaved() {
        const current=settingsVersion;
        try{const data=await api("/api/client/dashboard/analysis/saved-reports");if(current!==settingsVersion)return;
            $("anSavedReports").innerHTML=data.items.length?data.items.map(x=>`<details><summary>${esc(x.period)} · ${esc(x.payload.from)} to ${esc(x.payload.to_exclusive)} (end exclusive, UTC)</summary>${table(["Date","Activity","Result","Count"],x.payload.items.map(r=>[esc(r.day),esc(r.kind),esc(r.status),num(r.count)]))}<p>${esc(x.payload.coverage)}</p></details>`).join(""):empty("No saved reports yet. Enable a weekly or monthly schedule above.");
        }catch(error){if(current===settingsVersion)$("anSavedReports").textContent=error.message;}
    }
    async function deleteDetails(event) {
        event.preventDefault();const current=settingsVersion, form=$("anDeleteForm"),button=form.querySelector("button");button.disabled=true;
        try{const data=await api("/api/client/dashboard/analysis/delete-details",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(current!==settingsVersion)return;
            $("anDeleteStatus").textContent=`${num(data.deleted)} detailed records removed. ${data.note}`;form.reset();void load();
        }catch(error){if(current===settingsVersion)$("anDeleteStatus").textContent=error.message;}finally{button.disabled=false;}
    }
    function reset() {
        version++;activityVersion++;settingsVersion++;pageVersion++;controller?.abort();activityController?.abort();site=null;report=null;offset=0;
        if($("anBody")){ $("anIntegrationKey").textContent="";$("anIntegrationKey").hidden=true;$("anSavedReports").innerHTML="";$("anSettingsForm").reset(); $("anBody").hidden=true;$("anFilters").reset();document.querySelectorAll("[data-an-custom]").forEach(x=>x.hidden=true);$("anSelection").textContent="";$("anProfile").textContent="See what visitors need and where to improve.";$("anCsv").disabled=true;$("anPrint").disabled=true;status("Open Analysis to load your report.");}
    }
    window.OwnerAnalysis=Object.freeze({
        connect(client, currentSite){initialize();const changed=site?.site_id!==currentSite.site_id;if(changed)reset();api=client;site=currentSite;if(changed){settingsVersion++;report=null;void loadSettings();if($("analysis").classList.contains("dashboard-panel-active"))void load();}},
        open(name){initialize();if(name)tab(name);if(site&&!report)void load();},reset
    });
})();
