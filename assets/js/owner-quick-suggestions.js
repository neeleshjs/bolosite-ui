(() => {
    const langs = { en: "English", hi: "Hindi", hinglish: "Hinglish" };
    const endpoint = "/api/client/dashboard/quick-suggestions";
    let api, siteId = "", config, candidates = [], dirty = false, busy = false, generation = 0;
    let previewLanguage = "en";
    const root = () => document.getElementById("chatSuggestionEditor");
    function el(tag, text = "", attrs = {}) {
        const node = document.createElement(tag);
        node.textContent = text;
        Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
        return node;
    }
    function button(text, action, disabled = false) {
        const node = el("button", text, { type: "button", class: "btn ghost" });
        if (text === "↑" || text === "↓") node.setAttribute("aria-label", text === "↑" ? "Move question up" : "Move question down");
        node.disabled = disabled || busy;
        node.onclick = action;
        return node;
    }
    function selected() {
        if (config.mode === "off") return [];
        if (config.mode === "custom") return config.items.filter(item => item.enabled !== false).map(item => ({
            labels: Object.fromEntries(Object.keys(langs).map(lang => [lang, item[lang] || item.en || item.hi || item.hinglish || ""]))
        })).slice(0, 10);
        return ordered().filter(item => !config.hidden.includes(item.id)).slice(0, 10);
    }
    function ordered() {
        const order = new Map(config.order.map((id, i) => [id, i]));
        return [...candidates].sort((a, b) => (order.get(a.id) ?? order.size) - (order.get(b.id) ?? order.size));
    }
    function change() { dirty = true; render(); }
    function move(index, direction, custom) {
        const list = custom ? config.items : ordered();
        const target = index + direction;
        if (target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        if (!custom) config.order = list.map(item => item.id);
        change();
    }
    function preview() {
        const wrap = root()?.querySelector("[data-suggestion-preview]");
        if (!wrap) return;
        wrap.replaceChildren();
        const list = selected();
        const seen = new Set();
        if (!list.length) wrap.append(el("p", "No suggestions will be shown.", { class: "small" }));
        for (const item of list) {
            const text = (item.labels[previewLanguage] || "").trim();
            if (!text || seen.has(text.toLocaleLowerCase())) continue;
            seen.add(text.toLocaleLowerCase());
            wrap.append(el("span", text, { class: "badge" }));
        }
    }
    function message(text, error = false) {
        const status = root()?.querySelector("[data-suggestion-status]");
        if (status) { status.textContent = text; status.style.color = error ? "#dc2626" : ""; }
    }
    function render() {
        const host = root();
        if (!host || !config) return;
        host.replaceChildren();
        const controls = el("div", "", { class: "actions" });
        const mode = el("select", "", { "aria-label": "Suggestion mode" });
        for (const name of ["auto", "custom", "off"]) {
            const option = el("option", name === "auto" ? "Auto — use published website information" : name === "custom" ? "Custom — use my questions" : "Off — hide suggestions", { value: name });
            mode.append(option);
        }
        mode.value = config.mode;
        mode.disabled = busy;
        mode.onchange = () => {
            if (mode.value === "custom" && !config.items.length) config.items = selected().map(item => ({ ...item.labels, enabled: true }));
            config.mode = mode.value;
            change();
        };
        const language = el("select", "", { "aria-label": "Suggestion preview language" });
        for (const [id, label] of Object.entries(langs)) language.append(el("option", label, { value: id }));
        language.value = previewLanguage;
        language.onchange = () => { previewLanguage = language.value; render(); };
        controls.append(mode, language, button("Save suggestions", save, !dirty));
        host.append(controls, el("p", "Preview", { class: "small" }));
        const strip = el("div", "", { "data-suggestion-preview": "", class: "actions" });
        strip.style.flexWrap = "wrap";
        host.append(strip);
        const status = el("p", dirty ? "Unsaved changes" : "Saved suggestions", { "data-suggestion-status": "", role: "status", class: "small" });
        host.append(status);
        if (config.mode === "auto") {
            host.append(el("p", "Shown topics are supported by published website text or verified intents. Hide topics or move them up to prioritise them.", { class: "small" }));
            ordered().forEach((item, index, list) => {
                const row = el("div", "", { class: "actions" });
                row.style.cssText = "margin:8px 0;flex-wrap:wrap";
                const label = el("label");
                const check = el("input", "", { type: "checkbox", "aria-label": `Show ${item.labels.en}` });
                check.checked = !config.hidden.includes(item.id);
                check.disabled = busy;
                check.onchange = () => {
                    config.hidden = config.hidden.filter(id => id !== item.id);
                    if (!check.checked) config.hidden.push(item.id);
                    change();
                };
                label.append(check, document.createTextNode(" " + item.labels[previewLanguage]));
                row.append(label, button("↑", () => move(index, -1, false), index === 0), button("↓", () => move(index, 1, false), index === list.length - 1));
                host.append(row);
            });
        }
        if (config.mode === "custom") {
            host.append(el("p", "Use questions your website can answer. Up to 10, with 72 characters per language. A blank translation uses your available label.", { class: "small" }));
            config.items.forEach((item, index) => {
                const row = el("fieldset", "", { "data-custom-suggestion": String(index) });
                row.style.cssText = "margin:10px 0;padding:12px;border:1px solid var(--line,#8885);border-radius:10px;min-width:0";
                row.append(el("legend", `Question ${index + 1}`));
                const fields = el("div");
                fields.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px";
                for (const [lang, label] of Object.entries(langs)) {
                    const field = el("label", label);
                    const input = el("input", "", { type: "text", maxlength: "72", "aria-label": `${label} question ${index + 1}`, "data-suggestion-lang": lang });
                    input.value = item[lang] || "";
                    input.style.width = "100%";
                    input.disabled = busy;
                    input.oninput = () => { item[lang] = input.value; dirty = true; preview(); message("Unsaved changes"); host.querySelector("[data-save-suggestions]").disabled = false; };
                    field.append(input); fields.append(field);
                }
                row.append(fields);
                const actions = el("div", "", { class: "actions" });
                actions.style.marginTop = "8px";
                actions.append(button(item.enabled === false ? "Show" : "Hide", () => { item.enabled = item.enabled === false; change(); }),
                    button("↑", () => move(index, -1, true), index === 0), button("↓", () => move(index, 1, true), index === config.items.length - 1),
                    button("Remove", () => { config.items.splice(index, 1); change(); }));
                row.append(actions); host.append(row);
            });
            host.append(button("Add question", () => { config.items.push({ en: "", hi: "", hinglish: "", enabled: true }); change(); }, config.items.length >= 10));
        }
        controls.querySelector("button").setAttribute("data-save-suggestions", "");
        preview();
    }
    async function save() {
        if (busy || !config) return;
        const ownGeneration = generation;
        busy = true; render();
        try {
            const data = await api(endpoint, { method: "POST", body: JSON.stringify(config) });
            if (ownGeneration !== generation) return;
            config = data.settings; candidates = data.candidates; dirty = false;
        } catch (error) {
            if (ownGeneration === generation) { busy = false; render(); message(error.message, true); }
            return;
        } finally {
            if (ownGeneration === generation) busy = false;
        }
        render(); message("Saved. Open chats pick up changes within 30 seconds.");
    }
    async function connect(callApi, site) {
        api = callApi;
        if (!root()) return;
        if (siteId !== site.site_id) {
            siteId = site.site_id; generation += 1; dirty = false; busy = false; config = null;
            root().replaceChildren(el("p", "Loading suggestions…"));
        }
        if (dirty || busy) return;
        const ownGeneration = generation;
        busy = true;
        try {
            const data = await api(endpoint);
            if (generation !== ownGeneration || dirty) return;
            config = data.settings; candidates = data.candidates || [];
        } catch (error) {
            if (ownGeneration === generation) root().replaceChildren(el("p", error.message, { role: "status" }));
            return;
        } finally {
            if (ownGeneration === generation) busy = false;
        }
        render();
    }
    function reset() {
        generation += 1; siteId = ""; config = null; candidates = []; dirty = false; busy = false;
        root()?.replaceChildren();
    }
    window.OwnerQuickSuggestions = { connect, reset };
})();
