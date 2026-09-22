(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const form = $("feedback-form");
  if (!form) return;
  const en = Object.fromEntries([...document.querySelectorAll("[data-i18n]")].map(el => [el.dataset.i18n, el.textContent]));
  Object.assign(en, {
    all: "Everyone", allTopics: "All topics", allRatings: "All ratings", last90: "Last 90 days", allTime: "All time",
    visitorShort: "Visitors", ownerShort: "Owners", anonymous: "Anonymous", verified: "Verified owner", selfReported: "Self-reported",
    goalPlaceholder: "For example: find course fees, open a page, fill a form",
    benefitPlaceholder: "What became easier? What still needs work?",
    commentPlaceholder: "What worked well? What should improve? Please do not include private details.",
    choose: "Choose an option", unverifiedSite: "Continue without ownership verification",
    chat: "Chat", voice: "Voice", both: "Chat and voice", not_used: "Not used yet",
    yes: "Yes", partly: "Partly", no: "No", not_applicable: "Not applicable / prefer not to say",
    trying: "Trying it now", under_month: "Less than a month", one_to_six: "1–6 months", over_six: "More than 6 months",
    veryPoor: "Very poor", poor: "Poor", okay: "Okay", good: "Good", excellent: "Excellent",
    answers: "Answers & relevance", navigation: "Navigation & actions", forms: "Forms", speed: "Speed & reliability",
    usability: "Ease of use", setup: "Owner setup & controls", support: "Pricing & support", features: "Feature requests",
    general: "General experience", voiceCategory: "Voice & language",
    ratingBasis: "{n} shared ratings · {r} published reviews", noRatings: "No shared ratings in this selection yet.",
    roleBasis: "{n} shared responses · {r} ratings", roleEmpty: "No shared ratings yet.",
    outcomeSummary: "Goal achieved: {yes} yes · {partly} partly · {no} no",
    topicCount: "{n} responses", sentiment: "Overall ratings: {p} positive · {m} okay · {n} critical",
    noTopics: "No shared feedback matches these filters yet. Your experience can start the conversation.",
    noReviews: "No published reviews in this selection yet. Ratings shared anonymously can still appear in the overview.",
    noWebsites: "Website examples will appear when verified owners choose to publish their website with a review.",
    noUpdates: "Team replies and product updates will appear here as feedback is reviewed.",
    reviewCount: "{n} published reviews", readMore: "Read full review", ownerReported: "Owner-reported outcome",
    teamReply: "BoloSite team", reviewing: "Under review", planned: "Planned", in_progress: "In progress", released: "Released",
    releaseLink: "View release evidence", visitWebsite: "Visit website",
    usageEmpty: "Not measured yet. Counts will begin with recorded production activity; no sample numbers are shown.",
    usageBasis: "Recording since {date}. Visitor estimates count browser identifiers separately for each website.",
    updated: "Results fetched {date}. Feedback filters apply to ratings, topics, reviews and team replies.",
    sending: "Sending…", saving: "Saving…", saveChanges: "Save changes",
    sent: "Thank you. Your feedback is saved and awaiting moderation.",
    sentPrivate: "Thank you. Your feedback has been saved privately for the BoloSite team.",
    existing: "You already have feedback for this website. Use the private link below to update it.",
    saved: "Changes saved. Your feedback has returned to moderation.",
    manageLink: "Your private edit / withdraw link", managing: "Editing your feedback · {status}",
    pending: "Awaiting moderation", approved: "Reviewed", rejected: "Not published", withdrawn: "Withdrawn",
    withdrawnDone: "Your feedback has been withdrawn and removed from public results.",
    withdrawConfirm: "Withdraw this feedback and remove it from public results?",
    validation: "Please check the highlighted fields and try again.",
    commentInvalid: "A public review needs at least 10 characters.",
    unavailable: "This service is temporarily unavailable. Your text is still here; please retry.",
    csrf: "Your session changed. Please retry.", rate_limited: "Too many attempts. Please wait before trying again.",
    not_found: "This private link is invalid or the feedback has been withdrawn.", too_large: "Please shorten your feedback.",
    invalid: "We could not accept this request. Please check your feedback.",
    smallSample: "Small sample—read individual experiences before drawing conclusions.",
    privacyRequired: "Please choose how your feedback may be shared.",
    duplicate_website: "You already have shared feedback for this website. Please edit that review instead.",
    topTopics: "Most discussed: {topics}.",
    ratingScale: "1 · Very poor — 5 · Excellent",
    switchDark: "Switch to dark mode", switchLight: "Switch to light mode",
    pageNav: "On this page", languageChoice: "Page and feedback language",
  });
  const hinglish = {
    skip:"Content par jaayein", brandSection:"Feedback aur Results", share:"Feedback dein", eyebrow:"Aapke experience se behtar",
    title:"Asli experiences. Saaf results.", intro:"Kya achha kaam karta hai, kya improve hona chahiye, aur log BoloSite kaise use karte hain. Owners aur visitors ki baat padhein—apna experience bhi share karein.",
    explore:"Feedback dekhein ↓", honest:"Achha, mixed aur critical feedback—sabki jagah hai. Public reviews permission ke saath share hote hain.",
    yourVoice:"Aapki baat zaroori hai", formTitle:"BoloSite ka experience kaisa raha?", formIntro:"Quick rating ya detailed experience—jitna chahein share karein.",
    languageHint:"English ya Hinglish. Aapki choice.", contextError:"Abhi feedback form connect nahi ho pa raha.", retry:"Dobara try karein",
    newFeedback:"Naya feedback likhein", roleLabel:"Main apna experience share kar raha/rahi hoon as…",
    visitor:"Website visitor", visitorHelp:"Maine kisi website par BoloSite use kiya", owner:"Website owner / team", ownerHelp:"Main BoloSite wali website manage karta/karti hoon",
    exploring:"Abhi explore kar raha/rahi hoon", exploringHelp:"Mere paas koi idea ya pehla impression hai",
    ratingLabel:"Overall experience *", categoryLabel:"Feedback kis baare mein hai? *", channelLabel:"BoloSite kaise use kiya?",
    outcomeLabel:"Jo karna tha, woh ho paaya?", websiteLabel:"Kaunsi website use ki? (optional)", ownerSiteLabel:"Apni website verify karein",
    ownerLogin:"Ownership verify karne ke liye sign in karein", goalLabel:"Aap kya karna chahte the? (optional)", durationLabel:"BoloSite kab se use kar rahe hain?",
    benefitLabel:"Aapki website ke liye kya badla? (optional)", reportedNote:"Yeh owner ka bataya hua experience hoga; independently measured result nahi.",
    commentLabel:"Aapka experience ya suggestion", commentHelp:"Rating ke liye optional. Public review mein kam se kam 10 characters chahiye. Private details na likhein.",
    optionalDetails:"Naam aur follow-up details (optional)", nameLabel:"Public mein dikhne wala naam", anonymousHint:"Anonymous rehne ke liye khaali chhodein.",
    emailLabel:"Follow-up ke liye email", emailPrivate:"Aapka email public mein kabhi nahi dikhega.", sharingLabel:"Is feedback ko kaise use kar sakte hain? *",
    private:"Sirf BoloSite team", privateHelp:"Mera feedback private rakhein.", aggregate:"Anonymous analysis",
    aggregateHelp:"Meri rating aur topic public totals mein jodein, lekin review publish na karein.", public:"Mera review publish karein",
    publicHelp:"Moderation ke baad review aur chuna hua naam dikhaayein. Anonymous rehne ke liye naam khaali chhodein.",
    websiteConsent:"Is public review ke saath meri website ka link bhi dikha sakte hain.",
    consent:"Meri sharing choice ke mutabik BoloSite is feedback ko save aur use kar sakta hai. Main apne private link se ise edit ya withdraw kar sakta/sakti hoon.",
    submit:"Feedback bhejein", withdraw:"Feedback withdraw karein", moderationNote:"Moderation spam aur personal details check karti hai—review positive hai ya nahi, yeh approval ka rule nahi.",
    saveLink:"Feedback edit ya withdraw karne ke liye yeh private link save kar lein. Jiske paas link hoga, woh feedback manage kar sakega.",
    community:"Community ki baat", overviewTitle:"Log kya keh rahe hain", overviewIntro:"Shared ratings aur published reviews. Owners aur visitors ke results alag dekhein.",
    roleFilter:"Kisne diya", categoryFilter:"Topic", ratingFilter:"Rating", periodFilter:"Samay", reset:"Reset karein",
    resultsError:"Results load nahi ho paaye. Dobara try karein.", loading:"Shared feedback load ho raha hai…", overall:"Overall rating",
    categoryTitle:"Topic ke hisaab se feedback", categoryIntro:"Counts reviewer ke chune hue main topic ke hain; har feature ki alag rating nahi.",
    reviewsTitle:"Unke apne shabdon mein", reviewsIntro:"Original reviews, naye pehle. Language label review submit karte waqt chuni gayi language hai.",
    loadMore:"Aur reviews dekhein", measured:"Record ki gayi activity", usageTitle:"BoloSite ka actual use",
    usageIntro:"Runtime ki recorded production activity. Yeh numbers feedback filters se alag hain.",
    liveSites:"Live activity wali websites", last24:"Pichhle 24 ghante ki activity", activeVisitors:"Active visitors · estimate", last30:"Pichhle 30 din",
    conversations:"Conversations", actions:"Confirmed actions", websitesTitle:"Website owners ke experiences",
    websitesIntro:"Verified owners jinhone website share karna chuna. Statements owners ke hain; listing se website abhi online hona confirm nahi hota.",
    updatesTitle:"Aapne bataya. Hum sun rahe hain.", updatesIntro:"Aapke selected filters ke public feedback par team replies aur progress.",
    methodTitle:"In numbers ka matlab", methodRatings:"Ratings, reviews aur analysis",
    methodRatingsText:"Sirf moderated feedback count hota hai jiske public analysis ya publication ki permission hai. Private feedback exclude hota hai. Explore karne walon ke impressions usage ratings mein nahi judte. Summary exact counts, selected topics aur bataye gaye outcomes par banti hai; AI endorsement nahi hai. Chhota sample sabhi users ko represent nahi karta.",
    methodUsage:"Websites, visitors aur conversations",
    methodUsageText:"Live ka matlab pichhle 24 ghante mein production website ki recorded BoloSite activity hai, continuous uptime nahi. Visitors 30 din mein har website ke distinct browser identifiers hain; ek hi person doosre browser ya website par dobara count ho sakta hai. Conversation mein kam se kam ek recorded exchange hota hai. Recording is feature se shuru hoti hai; purane billing counters se usage nahi banaya jaata.",
    methodActions:"Actions aur verification",
    methodActionsText:"Confirmed action ke liye accepted completion receipt chahiye. Retries dobara count nahi hote; navigation start, external handoff ya unconfirmed submission success nahi hain. Verified owner ka feedback signed-in owner account aur uski website se linked hota hai. Isse review ki har baat independently verified nahi ho jaati.",
    methodPrivacy:"Aapki sharing choice",
    methodPrivacyText:"Private feedback BoloSite team ke paas rehta hai. Anonymous-analysis feedback totals mein judta hai, text ya identity public nahi hoti. Public review mein sirf chuni hui public details dikhti hain. Private management link se edit ya withdraw kar sakte hain; edit ke baad moderation dobara hoti hai. Purane private enquiry responses yahan automatically import nahi hote.",
    closingTitle:"Dekhein BoloSite aapki website ke liye kya kar sakta hai.", closingText:"Khud explore karein, phir bataayein kya achha laga aur kya improve hona chahiye.",
    openPortal:"Owner Portal kholein", footer:"Asli feedback. Saaf sources. Improvement ki jagah.",
    all:"Sabhi", allTopics:"Sabhi topics", allRatings:"Sabhi ratings", last90:"Pichhle 90 din", allTime:"Ab tak ka sab",
    visitorShort:"Visitors", ownerShort:"Owners", anonymous:"Anonymous", verified:"Verified owner", selfReported:"Khud bataya hua",
    goalPlaceholder:"Jaise: course fees dekhna, page kholna, form bharna", benefitPlaceholder:"Kya aasan hua? Abhi kya improve hona chahiye?",
    commentPlaceholder:"Kya achha laga? Kya improve karein? Private details mat likhein.", choose:"Option chunein",
    unverifiedSite:"Ownership verify kiye bina continue karein", chat:"Chat", voice:"Voice", both:"Chat aur voice", not_used:"Abhi use nahi kiya",
    yes:"Haan", partly:"Thoda", no:"Nahi", not_applicable:"Laagu nahi / batana nahi chahta/chahti",
    trying:"Abhi try kar raha/rahi hoon", under_month:"Ek mahine se kam", one_to_six:"1–6 mahine", over_six:"6 mahine se zyada",
    veryPoor:"Bahut kharab", poor:"Achha nahi", okay:"Theek", good:"Achha", excellent:"Bahut achha",
    answers:"Answers aur relevance", navigation:"Navigation aur actions", forms:"Forms", speed:"Speed aur reliability",
    usability:"Use karne mein aasaani", setup:"Owner setup aur controls", support:"Pricing aur support", features:"Naye features",
    general:"Overall experience", voiceCategory:"Voice aur language", ratingBasis:"{n} shared ratings · {r} published reviews",
    noRatings:"Is selection mein abhi shared ratings nahi hain.", roleBasis:"{n} shared responses · {r} ratings", roleEmpty:"Abhi shared ratings nahi hain.",
    outcomeSummary:"Kaam hua: {yes} haan · {partly} thoda · {no} nahi", topicCount:"{n} responses",
    sentiment:"Overall ratings: {p} achhi · {m} theek · {n} critical", noTopics:"In filters mein abhi feedback nahi hai. Aapka experience shuruaat kar sakta hai.",
    noReviews:"Is selection mein public reviews nahi hain. Anonymous ratings overview mein phir bhi dikh sakti hain.",
    noWebsites:"Jab verified owners review ke saath website share karenge, examples yahan dikhenge.",
    noUpdates:"Feedback review hone par team replies aur product updates yahan dikhenge.", reviewCount:"{n} published reviews",
    readMore:"Poora review padhein", ownerReported:"Owner ka bataya hua result", teamReply:"BoloSite team", reviewing:"Review ho raha hai",
    planned:"Plan mein hai", in_progress:"Kaam chal raha hai", released:"Release ho gaya", releaseLink:"Release ka evidence dekhein", visitWebsite:"Website dekhein",
    usageEmpty:"Abhi measure nahi hua. Production activity record hone par counts shuru honge; sample numbers nahi dikhaye gaye hain.",
    usageBasis:"Recording {date} se. Visitor estimates har website ke browser identifiers alag count karte hain.",
    updated:"Results {date} par fetch hue. Filters ratings, topics, reviews aur team replies par apply hain.",
    sending:"Bhej rahe hain…", saving:"Save ho raha hai…", saveChanges:"Changes save karein",
    sent:"Shukriya. Feedback save ho gaya hai aur moderation ke liye pending hai.", sentPrivate:"Shukriya. Feedback BoloSite team ke liye privately save ho gaya.",
    existing:"Is website ke liye aapka feedback pehle se hai. Neeche private link se update karein.",
    saved:"Changes save ho gaye. Feedback dobara moderation mein hai.", manageLink:"Aapka private edit / withdraw link",
    managing:"Aapka feedback edit ho raha hai · {status}", pending:"Moderation pending", approved:"Review ho gaya", rejected:"Publish nahi hua",
    withdrawn:"Withdraw ho gaya", withdrawnDone:"Feedback withdraw ho gaya aur public results se remove kar diya gaya.",
    withdrawConfirm:"Yeh feedback withdraw karke public results se hata dein?",
    validation:"Highlighted fields check karke dobara try karein.", commentInvalid:"Public review mein kam se kam 10 characters chahiye.",
    unavailable:"Service abhi available nahi hai. Aapka text yahin hai; dobara try karein.", csrf:"Session badal gaya. Dobara try karein.",
    rate_limited:"Bahut attempts hue hain. Thodi der baad try karein.", not_found:"Private link invalid hai ya feedback withdraw ho chuka hai.",
    too_large:"Feedback thoda chhota karein.", invalid:"Request accept nahi hui. Feedback check karein.",
    smallSample:"Sample chhota hai—conclusion se pehle individual experiences padhein.", privacyRequired:"Feedback share karne ka option chunein.",
    duplicate_website:"Is website ke liye aapka shared feedback pehle se hai. Usi review ko edit karein.", topTopics:"Sabse zyada baat hui: {topics}.",
    ratingScale:"1 · Bahut kharab — 5 · Bahut achha",
    switchDark:"Dark mode chunein", switchLight:"Light mode chunein",
    pageNav:"Is page ke sections", languageChoice:"Page aur feedback ki language",
    navFeedback:"Feedback", navCommunity:"Community", navUsage:"Usage",
    brandStoryEyebrow:"BoloSite ki community", brandStoryTitle:"Har conversation se aur behtar.",
    brandStoryText:"Aapka experience humein agla improvement chunne mein madad karta hai.",
    howMeasured:"Results kaise measure hote hain ↗", footerTagline:"Jo chahiye, bas ek conversation door.",
    footerExplore:"BoloSite explore karein", home:"Home", visitorGuide:"Visitors ke liye",
    ownerGuide:"Website owners ke liye", pricing:"Pricing", readReviews:"Experiences padhein"
  };
  const categories = ["answers","voice","navigation","forms","speed","usability","setup","support","features","general"];
  Object.assign(en, {
    draftSaved:"Draft saved in this tab for up to 24 hours. Submit or discard to clear it.", draftRestored:"Your draft is restored. Please review your sharing choice before sending.", draftUnavailable:"This browser cannot save a draft. Keep this tab open until you send it.",
    copied:"Private link copied.", copyFailed:"Copy was unavailable. Select and copy the edit link manually.", manageLink:"Edit feedback", atGlance:"Results at a glance",
    allLanguages:"All languages", everyoneVerified:"All reviewers", verifiedOnly:"Verified owners", searchPlaceholder:"Search the original review text",
    ownerVerification:"Linked to a signed-in owner account and its registered website. The review's claims are not independently verified.", selfVerification:"Experience supplied by the reviewer; not linked to verified usage.",
    themePositive:"Positive mentions", themeProblem:"Problems mentioned", themeRequest:"Suggestions", themeBasis:"{n} published reviews mention this · {role}",
    themeCoverage:"Explicit themes detected in {n} of {total} published reviews in this selection. English/Hinglish wording rules can miss nuance; these are mentions, not feature scores. Showing the most discussed themes.",
    noThemes:"No explicit themes detected in these published comments yet. Individual reviews remain available below.", originalReview:"Read original review", reportSent:"Report received privately by the BoloSite team.",
    nextUpdate:"Next update expected: {date}", authorResolved:"Reviewer confirms: resolved", authorStillIssue:"Reviewer says: issue remains", noPrivateReply:"No team reply yet. Check this private page for updates.", statusUpdated:"Feedback status · {status}", statusChanged:"New update · {status}",
    measuredSite:"Recorded in 30 days: {visitors} estimated visitors · {actions} confirmed actions.", noMeasuredSite:"No recorded activity for this website in the last 30 days.", useCase:"Use case", usedVia:"Used via", sourceUpdated:"Data refreshed {date}. Activity counters update on refresh; totals may be cached briefly.",
    resolution_unavailable:"Confirmation is available after the team marks an approved review's issue released.", replyPrivate:"Team reply: {reply}", rejectionReason:"Not published: {reason}", statusNoChange:"No new update. Your current status is shown below.",
    reviewUnavailable:"This review is no longer public.", close:"Close"
  });
  Object.assign(hinglish, {
    metricsConsent:"Is public example ke saath meri website ke recorded 30-day visitor aur completed-action counts bhi dikha sakte hain.",
    experiencePrivacy:"Public review ke saath aapka use case, channel aur bataya benefit bhi dikh sakta hai. Email private rahega.", experienceDetails:"Website aur experience details (optional)", discardDraft:"Draft hataayein", copyLink:"Private link copy karein", atGlance:"Ek nazar mein results", currentSelection:"Chune hue feedback filters", sharedRatings:"Shared ratings",
    draftSaved:"Draft is tab mein 24 ghante tak saved hai. Submit ya discard karne par clear hoga.", draftRestored:"Draft wapas aa gaya. Bhejne se pehle sharing choice check karein.", draftUnavailable:"Is browser mein draft save nahi ho pa raha. Submit hone tak tab khula rakhein.", copied:"Private link copy ho gaya.", copyFailed:"Copy nahi ho paaya. Edit link ko manually select aur copy karein.", manageLink:"Feedback edit karein",
    reviewLanguage:"Review ki language", verification:"Verification", searchReviews:"Public reviews khojein", allLanguages:"Sabhi languages", everyoneVerified:"Sabhi reviewers", verifiedOnly:"Verified owners", searchPlaceholder:"Original review ke words khojein",
    ownerVerification:"Signed-in owner account aur uski registered website se linked. Review ki har baat independently verified nahi hai.", selfVerification:"Reviewer ka bataya experience; verified usage se linked nahi hai.",
    themesTitle:"Written feedback mein kya baat aa rahi hai", themesIntro:"Published comments mein mile positives, problems aur suggestions. Har theme ke original words bhi padhein.", themePositive:"Achhi baatein", themeProblem:"Batayi gayi problems", themeRequest:"Suggestions", themeBasis:"{n} public reviews mein zikr · {role}", themeCoverage:"Is selection ke {total} public reviews mein se {n} mein explicit themes mile. English/Hinglish wording rules nuance miss kar sakte hain; yeh mentions hain, feature scores nahi. Sabse discussed themes dikh rahe hain.", noThemes:"Abhi in public comments mein explicit themes nahi mile. Neeche original reviews padh sakte hain.", originalReview:"Original review padhein",
    observedSites:"Recorded activity wali websites", observedHelp:"Pichhle 30 din · total installations nahi", liveHelp:"Recent activity; continuous uptime nahi", visitorEstimate:"Browser-based estimate; unique people nahi", exampleScope:"Website examples review filters se alag hain. Bataye gaye benefits aur measured activity alag dikhte hain.",
    checkUpdates:"Updates check karein", resolutionQuestion:"Team ne released mark kiya hai. Kya aapka issue resolve hua?", resolved:"Haan, resolve ho gaya", stillIssue:"Issue abhi bhi hai", nextUpdate:"Agla update expected: {date}", authorResolved:"Reviewer ne confirm kiya: resolved", authorStillIssue:"Reviewer ke mutabik issue baaki hai", noPrivateReply:"Abhi team ka reply nahi hai. Updates is private page par check karein.", statusUpdated:"Feedback status · {status}", statusChanged:"Naya update · {status}", statusNoChange:"Naya update nahi hai. Current status neeche hai.", replyPrivate:"Team ka reply: {reply}", rejectionReason:"Publish nahi hua: {reason}",
    reportReview:"Is review ko report karein", reportHelp:"Spam, private details ya koi specific concern bataayein. Sirf rating se disagree karna review hatane ka reason nahi hai.", reportReason:"Reason", sendReport:"Report bhejein", reportSent:"Report BoloSite team ko privately mil gaya.", close:"Band karein", reviewUnavailable:"Yeh review ab public nahi hai.",
    measuredSite:"30 din ki recording: {visitors} estimated visitors · {actions} confirmed actions.", noMeasuredSite:"Is website ki pichhle 30 din mein activity record nahi hui.", useCase:"Use case", usedVia:"Use kiya via", sourceUpdated:"Data {date} par refresh hua. Activity counters refresh par update hote hain; totals thodi der cached ho sakte hain.", resolution_unavailable:"Team ke approved review ka issue released mark karne par confirmation de sakte hain.",
    usageIntro:"BoloSite use karne wali websites ki recorded activity. Yeh numbers feedback filters se alag hain."
  });
  const t = (key, vars = {}) => {
    const text = (language === "hinglish" ? hinglish[key] : en[key]) || en[key] || key;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  };
  let language = "en", context = null, resultData = null, reviewItems = [], requestKey = crypto.randomUUID();
  let manageToken = "", managingStatus = "", successKey = "", busy = false, loadVersion = 0, editingRole = "";
  let privateStatus = null, editingSite = null, managementVersion = 0, draftMessage = "", reportId = "", statusBusy = false;
  const draftKey = "bolosite-proof-draft-v1";
  let chosenTheme = null;
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  try {
    language = localStorage.getItem("bolosite-proof-language") === "hinglish" ? "hinglish" : "en";
    const saved = localStorage.getItem("bolosite-theme");
    chosenTheme = saved === "light" || saved === "dark" ? saved : null;
  } catch (_) {}
  function applyTheme() {
    const theme = chosenTheme || (systemTheme?.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    const button = $("proof-theme-toggle");
    button.setAttribute("aria-label", t(theme === "dark" ? "switchLight" : "switchDark"));
    button.title = button.getAttribute("aria-label");
  }
  $("proof-theme-toggle").addEventListener("click", () => {
    chosenTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("bolosite-theme", chosenTheme); } catch (_) {}
    applyTheme();
  });
  systemTheme?.addEventListener("change", () => { if (!chosenTheme) applyTheme(); });
  window.addEventListener("storage", event => {
    if (event.key !== "bolosite-theme" && event.key !== null) return;
    chosenTheme = event.newValue === "light" || event.newValue === "dark" ? event.newValue : null;
    applyTheme();
  });
  $("proof-year").textContent = String(new Date().getFullYear());
  // A direct link to the sharing policy should reveal its explanation too.
  function revealLinkedDetails() {
    if (location.hash === "#sharing-policy") $("sharing-policy").open = true;
  }
  window.addEventListener("hashchange", revealLinkedDetails);
  document.querySelectorAll('a[href="#sharing-policy"]').forEach(link => link.addEventListener("click", () => { $("sharing-policy").open = true; }));
  revealLinkedDetails();
  const selected = name => form.querySelector('input[name="' + name + '"]:checked')?.value || "";
  const categoryName = category => t(category === "voice" ? "voiceCategory" : category);
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
  const empty = (container, key) => { container.replaceChildren(el("div", t(key), "empty")); };
  const date = value => { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short"}); };
  function options(id, entries, defaultValue = "") {
    const select = $(id), old = select.value;
    select.replaceChildren(...entries.map(([value, text]) => { const option = el("option", text); option.value = value; return option; }));
    select.value = entries.some(entry => entry[0] === old) ? old : defaultValue;
  }
  function applyLanguage() {
    applyTheme();
    document.documentElement.lang = language === "hinglish" ? "hi-Latn" : "en";
    document.title = language === "hinglish" ? "BoloSite — Feedback aur Results" : "BoloSite — Feedback & Results";
    document.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll("[data-i18n-label]").forEach(node => { node.setAttribute("aria-label", t(node.dataset.i18nLabel)); });
    document.querySelectorAll("[data-placeholder]").forEach(node => { node.placeholder = t(node.dataset.placeholder); });
    document.querySelectorAll("[data-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
    options("category", [["",t("choose")], ...categories.map(c => [c,categoryName(c)])]);
    options("channel", ["not_used","chat","voice","both"].map(c => [c,t(c)]), "not_used");
    options("outcome", ["not_applicable","yes","partly","no"].map(c => [c,t(c)]), "not_applicable");
    options("duration", [["",t("choose")], ...["trying","under_month","one_to_six","over_six"].map(c => [c,t(c)])]);
    options("filter-role", [["",t("all")],["owner",t("ownerShort")],["visitor",t("visitorShort")],["exploring",t("exploring")]]);
    options("filter-category", [["",t("allTopics")],...categories.map(c => [c,categoryName(c)])]);
    options("filter-rating", [["",t("allRatings")],...[5,4,3,2,1].map(n => [String(n),String(n) + " / 5"])]);
    options("filter-days", [["30",t("last30")],["90",t("last90")],["0",t("allTime")]], "30");
    options("filter-language", [["",t("allLanguages")],["en","English"],["hinglish","Hinglish"]]);
    options("filter-verified", [["",t("everyoneVerified")],["1",t("verifiedOnly")]]);
    const rating = selected("rating");
    $("rating-options").replaceChildren(...[1,2,3,4,5].map((n,i) => {
      const label = el("label"), input = document.createElement("input");
      input.type = "radio"; input.name = "rating"; input.value = String(n); input.required = true;
      input.checked = rating === String(n); input.setAttribute("aria-label", n + " — " + t(["veryPoor","poor","okay","good","excellent"][i]));
      label.title = input.getAttribute("aria-label"); label.append(input, el("span",String(n))); return label;
    }));
    let scale = $("rating-scale");
    if (!scale) { scale = el("small",undefined,"rating-scale"); scale.id = "rating-scale"; $("rating-field").append(scale); }
    scale.textContent = t("ratingScale");
    ownerOptions();
    conditionalFields();
    if (resultData) renderResults();
    if (manageToken) $("manage-status").textContent = t("managing", {status:t(managingStatus)});
    if (successKey) $("success-message").textContent = t(successKey);
    $("manage-link").textContent = t("manageLink");
    if (draftMessage) $("draft-status").textContent = t(draftMessage);
    if (privateStatus) renderPrivateStatus();
    updateSubmit();
  }
  function ownerOptions() {
    const sites=[...(context?.owner_sites || [])];
    if(editingSite && !sites.some(site=>site.site_id===editingSite.site_id))sites.push(editingSite);
    options("owner-site", [["",t("unverifiedSite")],...sites.map(site => [site.site_id,site.name])]);
    $("owner-login").hidden = Boolean(context?.owner_sites?.length);
  }
  function conditionalFields() {
    const role = selected("role"), exploring = role === "exploring";
    $("rating-field").hidden = exploring;
    form.querySelectorAll('[name="rating"]').forEach(input => { input.disabled = exploring; input.required = !exploring; });
    ["owner-verification","duration-field","benefit-field"].forEach(id => { $(id).hidden = role !== "owner"; });
    $("goal-field").hidden = exploring;
    $("outcome-field").hidden = exploring;
    $("website-consent-row").hidden = selected("visibility") !== "public";
    $("comment").required = selected("visibility") === "public";
    $("comment").setCustomValidity("");
    const site = editingSite || context?.owner_sites?.find(item => item.site_id === $("owner-site").value);
    $("metrics-consent-row").hidden = !(role === "owner" && site && selected("visibility") === "public" && $("allow-website").checked);
    $("owner-site").disabled=Boolean(editingSite);if(editingSite)$("owner-login").hidden=true;
    $("website").readOnly = role === "owner" && Boolean(site);
    if (role === "owner" && site) $("website").value = site.website;
    $("character-count").textContent = $("comment").value.length + " / 2000";
  }
  function updateSubmit() {
    $("submit-feedback").disabled = busy || !context;
    $("submit-feedback").textContent = t(busy ? (manageToken ? "saving" : "sending") : (manageToken ? "saveChanges" : "submit"));
    $("withdraw-feedback").hidden = !manageToken;
    $("withdraw-feedback").disabled = busy;
  }
  async function api(path, data, retry = true) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/proof/" + path, {method:data ? "POST" : "GET", credentials:"same-origin", cache:"no-store", signal:controller.signal,
        headers:data ? {"Content-Type":"application/json","X-CSRF-Token":context?.csrf || ""} : {}, body:data ? JSON.stringify(data) : undefined});
      const body = await response.json();
      if (!response.ok || !body.ok) {
        if (response.status === 403 && body.code === "csrf" && data && retry) {
          context = await api("context"); return api(path, data, false);
        }
        throw Object.assign(new Error(body.code || "unavailable"), body);
      }
      return body;
    } catch (error) {
      if (!error.code) error.code = "unavailable";
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function loadContext() {
    $("context-error").hidden = true;
    try { context = await api("context"); ownerOptions(); updateSubmit(); }
    catch (_) { context = null; $("context-error").hidden = false; updateSubmit(); }
  }
  function payload() {
    return {role:selected("role"), rating:Number(selected("rating")) || null, language, visibility:selected("visibility"),
      category:$("category").value, comment:$("comment").value, website:$("website").value, email:$("email").value,
      display_name:$("display-name").value, channel:$("channel").value, outcome:$("outcome").value,
      goal:$("goal").value, owner_benefit:$("owner-benefit").value, duration:$("duration").value,
      owner_site_id:$("owner-site").value, allow_website:$("allow-website").checked, consent:$("consent").checked,
      allow_metrics:$("allow-metrics").checked,
      request_key:requestKey, company:$("company").value};
  }
  function clearDraft() {
    try { sessionStorage.removeItem(draftKey); } catch (_) {}
    draftMessage = ""; $("draft-notice").hidden = true;
  }
  function saveDraft() {
    if (form.hidden || busy) return;
    try {
      const data = payload(); data.consent = false;
      sessionStorage.setItem(draftKey, JSON.stringify({saved:Date.now(), scope:manageToken, data}));
      draftMessage = "draftSaved";
    } catch (_) { draftMessage = "draftUnavailable"; }
    $("draft-notice").hidden = false; $("draft-status").textContent = t(draftMessage);
  }
  function fillForm(p) {
    ["role","visibility"].forEach(name=>form.querySelectorAll('[name="'+name+'"]').forEach(input=>{input.checked=input.value===p[name];if(name==="role")input.disabled=Boolean(manageToken);}));
    form.querySelectorAll('[name="rating"]').forEach(input=>{input.checked=Number(input.value)===p.rating;});
    Object.entries({"category":"category","channel":"channel","outcome":"outcome","website":"website","goal":"goal","duration":"duration","owner-benefit":"owner_benefit","comment":"comment","display-name":"display_name","email":"email"}).forEach(([id,key])=>{$(id).value=p[key] || "";});
    $("allow-website").checked=Boolean(p.allow_website); $("owner-site").value=p.site_id || p.owner_site_id || "";
    $("allow-metrics").checked=Boolean(p.allow_metrics);
    $("consent").checked=false; conditionalFields();
    if (p.role === "owner") $("experience-details").open = true;
  }
  function restoreDraft() {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) || "null");
      if (!draft) return;
      if (Date.now() - draft.saved > 86400000) { clearDraft(); return; }
      if (draft.scope !== manageToken || !draft.data) return;
      fillForm(draft.data); if (draft.data.request_key) requestKey = draft.data.request_key;
      draftMessage="draftRestored"; $("draft-notice").hidden=false; $("draft-status").textContent=t(draftMessage);
    } catch (_) { /* Corrupt or blocked tab storage must not break the form. */ }
  }
  function revealField(node) {
    for (let parent=node?.parentElement; parent; parent=parent.parentElement) if (parent.tagName === "DETAILS") parent.open=true;
  }
  form.addEventListener("invalid", event=>revealField(event.target), true);
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", event=>{if(event.target.name==="role" && event.target.value==="owner")$("experience-details").open=true;saveDraft();});
  $("discard-draft").addEventListener("click", ()=>{clearDraft(); if(manageToken)readManagementLink();else resetForm();});
  function showError(error) {
    $("form-error").hidden = false; $("form-error").textContent = t(error.field === "duplicate_website" ? error.field : error.code || "unavailable");
    const ids = {rating:"rating-options", role:"feedback-form", category:"category", comment:"comment", email:"email",
      website:"website", display_name:"display-name", consent:"consent", visibility:"website-consent-row"};
    if (error.field && ids[error.field]) { const field=$(ids[error.field]); revealField(field); const target=field.matches("input,select,textarea")?field:field.querySelector("input"); target?.setAttribute("aria-invalid","true");target?.focus();field.scrollIntoView({block:"center"}); }
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !context) return;
    $("form-error").hidden = true; $("submission-success").hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach(node=>node.removeAttribute("aria-invalid"));
    $("comment").setCustomValidity(selected("visibility") === "public" && $("comment").value.trim().length < 10 ? t("commentInvalid") : "");
    if (!form.reportValidity()) return;
    busy = true; updateSubmit();
    try {
      const data = payload();
      const result = manageToken ? await api("manage", {token:manageToken, action:"update", feedback:data}) : await api("feedback", data);
      const token = result.manage_token || manageToken;
      $("manage-link").href = location.origin + "/trust#manage=" + encodeURIComponent(token);
      $("manage-link").textContent = t("manageLink");
      successKey = manageToken ? "saved" : !result.created ? "existing" : data.visibility === "private" ? "sentPrivate" : "sent";
      if (manageToken || result.created) clearDraft();
      manageToken = token; editingRole = data.role;
      form.hidden = true; $("private-link-tools").hidden = false; $("manage-link").hidden=false;
      $("manage-notice").hidden=true; $("copy-status").textContent="";
      $("success-message").textContent = t(successKey);
      $("submission-success").hidden = false; $("submission-success").focus();
      await refreshPrivateStatus();
      await loadResults();
    } catch (error) { showError(error); }
    finally { busy = false; updateSubmit(); }
  });
  form.addEventListener("change", conditionalFields);
  $("comment").addEventListener("input", conditionalFields);
  function reviewCard(item, updateOnly = false) {
    const card = el("article",undefined,"panel review-card"), head = el("div",undefined,"review-top"), person = el("div");
    person.append(el("div",item.name || t("anonymous"),"review-name"),
      el("div",t(item.role) + " · " + date(item.created_at),"review-meta"));
    head.append(person,el("div",item.rating ? item.rating + " / 5" : t("exploring"),"review-rating")); card.append(head);
    const tags = el("div",undefined,"review-tags");
    tags.append(el("span",categoryName(item.category),"tag"),el("span",item.language === "hinglish" ? "Hinglish" : "English","tag"),
      el("span",t(item.owner_verified ? "verified" : "selfReported"),"tag")); card.append(tags);
    tags.lastChild.title=t(item.owner_verified ? "ownerVerification" : "selfVerification");
    const verification=el("details",undefined,"verification-note");verification.append(el("summary",t("verification")),el("p",t(item.owner_verified?"ownerVerification":"selfVerification"),"fine-print"));card.append(verification);
    const comment = item.comment || "";
    if (comment.length > 400 && !updateOnly) {
      card.append(el("p",comment.slice(0,400) + "…","review-text"));
      const details = el("details"); details.append(el("summary",t("readMore")),el("p",comment.slice(400),"review-text")); card.append(details);
    } else card.append(el("p",comment,"review-text"));
    if (item.website) { const a = el("a",item.website_name || new URL(item.website).hostname,"text-link"); a.href = item.website; a.target="_blank"; a.rel="noopener noreferrer nofollow"; card.append(a); }
    if (item.owner_benefit && item.role === "owner") { card.append(el("p",t("ownerReported") + ": " + item.owner_benefit,"review-meta")); }
    if(item.goal)card.append(el("p",t("useCase")+": "+item.goal,"review-meta"));
    if(item.channel && item.channel!=="not_used")card.append(el("p",t("usedVia")+": "+t(item.channel),"review-meta"));
    if(item.measured)card.append(el("p",item.measured.available?t("measuredSite",item.measured):t("noMeasuredSite"),"measured-evidence"));
    if (item.reply) {
      const reply = el("div",undefined,"team-reply");
      reply.append(el("strong",t("teamReply") + " · " + t(item.issue_status)),el("p",item.reply));
      if(item.release_url){const a=el("a",t("releaseLink"),"text-link");a.href=item.release_url;a.target="_blank";a.rel="noopener noreferrer";reply.append(a);}
      card.append(reply);
    }
    if(item.next_update)card.append(el("p",t("nextUpdate",{date:item.next_update}),"review-meta"));
    if(item.author_resolution)card.append(el("p",t(item.author_resolution==="resolved"?"authorResolved":"authorStillIssue"),"review-meta"));
    const report=el("button",t("reportReview"),"text-button report-review");report.type="button";report.addEventListener("click",()=>{reportId=item.id;$("report-reason").value="";$("report-status").textContent="";$("send-report").disabled=false;$("report-dialog").showModal();});card.append(report);
    return card;
  }
  function renderResults() {
    const data = resultData, summary = data.summary;
    $("overall-rating").replaceChildren(document.createTextNode(summary.average == null ? "—" : Number(summary.average).toFixed(1)));
    if (summary.average != null) $("overall-rating").append(el("span"," / 5"));
    $("rating-basis").textContent = summary.rated ? t("ratingBasis",{n:summary.rated,r:summary.reviews || 0}) : t("noRatings");
    $("rating-distribution").replaceChildren(...[5,4,3,2,1].map(n => {
      const row = el("div",undefined,"bar-row"), bar=el("div",undefined,"bar"), fill=el("div",undefined,"bar-fill");
      fill.style.width = ((data.distribution[n] || 0) / Math.max(1,summary.rated) * 100) + "%"; bar.append(fill);
      row.append(el("span",n + " ★"),bar,el("span",String(data.distribution[n] || 0))); return row;
    }));
    $("role-summaries").replaceChildren(...["owner","visitor"].map(role => {
      const stat = data.roles.find(s => s.role === role) || {count:0,rated:0,average:null};
      const box=el("article",undefined,"panel role-summary"), head=el("div",undefined,"role-top");
      head.append(el("h3",t(role === "owner" ? "ownerShort" : "visitorShort")),el("strong",stat.average == null ? "—" : Number(stat.average).toFixed(1) + " / 5"));
      box.append(head,el("p",t("roleBasis",{n:stat.count,r:stat.rated})));
      const topics=(data.role_topics || []).filter(item=>item.role===role).slice(0,2);
      if(topics.length)box.append(el("p",t("topTopics",{topics:topics.map(item=>categoryName(item.category)+" ("+item.count+")").join(", ")})));
      const outcomes={yes:0,partly:0,no:0};data.outcomes.filter(s=>s.role===role).forEach(s=>{if(s.outcome in outcomes)outcomes[s.outcome]=s.count;});
      if(Object.values(outcomes).some(Boolean))box.append(el("p",t("outcomeSummary",outcomes)));
      if(stat.rated && stat.rated<5)box.append(el("p",t("smallSample"),"fine-print"));
      return box;
    }));
    if (!data.categories.length) empty($("category-insights"),"noTopics");
    else $("category-insights").replaceChildren(...data.categories.map(item => {
      const box=el("button",undefined,"panel category-card");box.type="button";
      box.append(el("strong",categoryName(item.category)),el("span",t("topicCount",{n:item.count})),
        el("p",t("sentiment",{p:item.positive || 0,m:item.neutral || 0,n:item.negative || 0})));
      box.addEventListener("click",()=>{$("filter-category").value=item.category;loadResults();});return box;
    }));
    const themes=data.themes || {items:[],covered:0,total:0};
    $("themes-coverage").textContent=t("themeCoverage",{n:themes.covered,total:themes.total});
    if(!themes.items.length)empty($("written-themes"),"noThemes");
    else $("written-themes").replaceChildren(...themes.items.map(item=>{
      const box=el("article",undefined,"panel theme-card");
      box.append(el("span",t(item.kind==="positive"?"themePositive":item.kind==="problem"?"themeProblem":"themeRequest"),"tag"),el("h3",language==="hinglish"?item.label_hinglish:item.label_en),el("p",t("themeBasis",{n:item.count,role:t(item.role)}),"fine-print"));
      const details=el("details");details.append(el("summary",t("originalReview")));
      item.examples.forEach(example=>{details.append(el("blockquote",example.quote));const link=el("button",t("originalReview"),"text-button");link.type="button";link.addEventListener("click",()=>showReview(example.id));details.append(link);});box.append(details);return box;
    }));
    $("review-count").textContent=t("reviewCount",{n:summary.reviews || 0});
    if(reviewItems.length)$("reviews").replaceChildren(...reviewItems.map(r=>reviewCard(r)));else empty($("reviews"),"noReviews");
    $("load-more").hidden=!data.has_more;
    if(data.updates.length)$("updates").replaceChildren(...data.updates.map(r=>reviewCard(r,true)));else empty($("updates"),"noUpdates");
    if(data.websites.length)$("websites").replaceChildren(...data.websites.map(r=>reviewCard(r)));else empty($("websites"),"noWebsites");
    const usage=data.usage;
    [["metric-sites","live_websites"],["quick-sites","live_websites"],["metric-observed","observed_websites"],["metric-visitors","visitors"],["quick-visitors","visitors"],["metric-conversations","conversations"],["metric-actions","actions"]].forEach(([id,key])=>{$(id).textContent=usage.available ? Number(usage[key] || 0).toLocaleString("en-IN") : "—";});
    $("quick-rating").textContent=summary.average==null?"—":Number(summary.average).toFixed(1)+" / 5";
    $("quick-ratings").textContent=Number(summary.rated || 0).toLocaleString("en-IN");
    $("usage-updated").textContent=t("sourceUpdated",{date:date(data.updated_at)});
    $("usage-note").textContent=usage.available ? t("usageBasis",{date:date(usage.tracking_since)}) : t("usageEmpty");
    $("last-updated").textContent=t("updated",{date:date(data.updated_at)});
  }
  async function loadResults(more=false) {
    const version=++loadVersion;
    $("results-error").hidden=true;$("results-loading").hidden=false;$("feedback-results").setAttribute("aria-busy","true");$("load-more").disabled=true;
    const params=new URLSearchParams({role:$("filter-role").value,category:$("filter-category").value,rating:$("filter-rating").value,days:$("filter-days").value,language:$("filter-language").value,verified:$("filter-verified").value,q:$("filter-query").value.trim(),offset:String(more?reviewItems.length:0)});
    try {
      const data=await api("public?"+params);
      if(version!==loadVersion)return;
      resultData=data;reviewItems=more?[...reviewItems,...data.reviews]:data.reviews;
      $("feedback-results").hidden=false;renderResults();
    } catch(_){
      if(version!==loadVersion)return;
      $("results-error").hidden=false;$("feedback-results").hidden=true;
      resultData=null;reviewItems=[];
      ["metric-sites","metric-observed","metric-visitors","metric-conversations","metric-actions","quick-sites","quick-visitors","quick-rating","quick-ratings"].forEach(id=>{$(id).textContent="—";});
      $("usage-updated").textContent="";$("last-updated").textContent="";
      $("usage-note").textContent=t("resultsError");empty($("websites"),"resultsError");empty($("updates"),"resultsError");
    } finally {
      if(version===loadVersion){$("results-loading").hidden=true;$("feedback-results").setAttribute("aria-busy","false");$("load-more").disabled=false;}
    }
  }
  async function readManagementLink() {
    if(!location.hash.startsWith("#manage="))return;
    let token;const version=++managementVersion;
    try { token=decodeURIComponent(location.hash.slice(8)); }
    catch (_) { showError({code:"not_found"}); return; }
    if(!context)await loadContext();
    if(!context)return;
    try {
      const result=await api("manage",{token,action:"read"}), p=result.feedback;
      if(version!==managementVersion)return;
      manageToken=token;managingStatus=result.status;editingRole=p.role;
      editingSite=p.owner_verified?{site_id:p.site_id,name:p.website_name,website:p.website}:null;
      language=p.language;try{localStorage.setItem("bolosite-proof-language",language);}catch(_){}
      applyLanguage();
      fillForm(p);restoreDraft();form.hidden=false;privateStatus=result;renderPrivateStatus();
      $("consent").checked=false;$("manage-notice").hidden=false;$("manage-status").textContent=t("managing",{status:t(result.status)});
      $("submission-success").hidden=true;successKey="";conditionalFields();updateSubmit();$("feedback").scrollIntoView();
    }catch(error){if(version!==managementVersion)return;form.hidden=false;showError(error);$("feedback").scrollIntoView();}
  }
  function renderPrivateStatus(changed=false) {
    if(!privateStatus)return;
    $("private-status").hidden=false;
    $("private-status-title").textContent=t(changed?"statusChanged":"statusUpdated",{status:t(privateStatus.status)});
    $("private-reason").textContent=privateStatus.reason?t("rejectionReason",{reason:privateStatus.reason}):"";
    $("private-reply").textContent=privateStatus.reply?t("replyPrivate",{reply:privateStatus.reply}):t("noPrivateReply");
    $("private-next-update").textContent=privateStatus.next_update?t("nextUpdate",{date:privateStatus.next_update}):"";
    $("private-resolution").textContent=privateStatus.author_resolution?t(privateStatus.author_resolution==="resolved"?"authorResolved":"authorStillIssue"):"";
    $("resolution-controls").hidden=!(privateStatus.status==="approved" && privateStatus.issue_status==="released");
  }
  async function refreshPrivateStatus(manual=false) {
    if(!manageToken || statusBusy)return;
    statusBusy=true;const token=manageToken;
    try {
      const data=await api("manage",{token,action:"status"});if(token!==manageToken)return;
      const signature=value=>JSON.stringify([value?.status,value?.reply,value?.reason,value?.next_update,value?.author_resolution]);
      const changed=Boolean(privateStatus)&&signature(privateStatus)!==signature(data);
      privateStatus=data;managingStatus=data.status;renderPrivateStatus(changed);
      if(manual&&!changed)$("private-status-title").textContent=t("statusNoChange");
    }catch(error){if(manual){$("private-status").hidden=false;$("private-status-title").textContent=t(error.code || "unavailable");}}
    finally{statusBusy=false;}
  }
  $("refresh-status").addEventListener("click",()=>refreshPrivateStatus(true));
  setInterval(()=>{if(!document.hidden && !busy)refreshPrivateStatus();},60000);
  document.querySelectorAll("[data-resolution]").forEach(button=>button.addEventListener("click",async()=>{
    if(busy||!manageToken)return;busy=true;updateSubmit();
    try{await api("manage",{token:manageToken,action:"resolve",resolution:button.dataset.resolution});await refreshPrivateStatus();await loadResults();}
    catch(error){$("private-resolution").textContent=t(error.field||error.code||"unavailable");}
    finally{busy=false;updateSubmit();}
  }));
  $("manage-link").addEventListener("click",event=>{if(location.hash===new URL(event.currentTarget.href).hash){event.preventDefault();readManagementLink();}});
  $("copy-manage-link").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText($("manage-link").href);$("copy-status").textContent=t("copied");}
    catch(_){$("copy-status").textContent=t("copyFailed");const selection=getSelection(),range=document.createRange();range.selectNode($("manage-link"));selection?.removeAllRanges();selection?.addRange(range);}
  });
  let detailVersion=0;
  async function showReview(id) {
    const version=++detailVersion;$("review-detail").replaceChildren(el("p",t("loading")));
    if(!$("review-dialog").open)$("review-dialog").showModal();
    try{const result=await api("review/"+encodeURIComponent(id));if(version===detailVersion)$("review-detail").replaceChildren(reviewCard(result.review));}
    catch(_){if(version===detailVersion)$("review-detail").replaceChildren(el("p",t("reviewUnavailable")));}
  }
  document.querySelectorAll("[data-close-dialog]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.closeDialog).close()));
  $("report-form").addEventListener("submit",async event=>{
    event.preventDefault();if(!$("report-form").reportValidity()||$("send-report").disabled)return;
    $("send-report").disabled=true;$("report-status").textContent=t("sending");
    try{if(!context)await loadContext();if(!context)throw {code:"unavailable"};await api("report",{id:reportId,reason:$("report-reason").value});$("report-status").textContent=t("reportSent");}
    catch(error){$("report-status").textContent=t(error.code||"unavailable");$("send-report").disabled=false;}
  });
  $("withdraw-feedback").addEventListener("click",async()=>{
    if(busy || !manageToken || !window.confirm(t("withdrawConfirm")))return;
    busy=true;updateSubmit();
    try{await api("manage",{token:manageToken,action:"withdraw"});resetForm();form.hidden=true;successKey="withdrawnDone";$("success-message").textContent=t(successKey);$("submission-success").hidden=false;$("private-link-tools").hidden=true;$("submission-success").focus();await loadResults();}
    catch(error){showError(error);}finally{busy=false;updateSubmit();}
  });
  function resetForm(){
    ++managementVersion;clearDraft();privateStatus=null;editingSite=null;$("private-status").hidden=true;form.hidden=false;$("experience-details").open=false;ownerOptions();
    manageToken="";editingRole="";managingStatus="";successKey="";form.reset();form.querySelectorAll('[name="role"]').forEach(input=>{input.disabled=false;});
    $("manage-notice").hidden=true;$("submission-success").hidden=true;$("manage-link").hidden=false;$("form-error").hidden=true;
    requestKey=crypto.randomUUID();history.replaceState(null,"",location.pathname+"#feedback");conditionalFields();updateSubmit();
  }
  $("new-feedback").addEventListener("click",resetForm);
  $("success-new-feedback").addEventListener("click",resetForm);
  document.querySelectorAll("[data-language]").forEach(button=>button.addEventListener("click",()=>{
    language=button.dataset.language;try{localStorage.setItem("bolosite-proof-language",language);}catch(_){}applyLanguage();
  }));
  ["filter-role","filter-category","filter-rating","filter-days","filter-language","filter-verified"].forEach(id=>$(id).addEventListener("change",()=>loadResults()));
  let searchTimer;$("filter-query").addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadResults(),300);});
  $("reset-filters").addEventListener("click",()=>{clearTimeout(searchTimer);["filter-role","filter-category","filter-rating","filter-language","filter-verified","filter-query"].forEach(id=>{$(id).value="";});$("filter-days").value="30";loadResults();});
  $("retry-context").addEventListener("click",()=>loadContext().then(readManagementLink));$("retry-results").addEventListener("click",()=>loadResults());
  $("load-more").addEventListener("click",()=>loadResults(true));window.addEventListener("hashchange",readManagementLink);
  const navLinks=[...document.querySelectorAll(".proof-nav a")];
  function markSection(){const top=document.querySelector(".proof-header").getBoundingClientRect().bottom+35;let active=navLinks[0];for(const link of navLinks){if(document.querySelector(link.hash).getBoundingClientRect().top<=top)active=link;}navLinks.forEach(link=>{if(link===active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});}
  let navFrame=false;addEventListener("scroll",()=>{if(!navFrame){navFrame=true;requestAnimationFrame(()=>{markSection();navFrame=false;});}},{passive:true});addEventListener("resize",markSection);markSection();
  applyLanguage();loadResults();loadContext().then(()=>{if(location.hash.startsWith("#manage="))return readManagementLink();restoreDraft();});
})();
