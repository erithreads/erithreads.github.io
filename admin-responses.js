(function () {
    const config = window.ERITHREADS_FORM_CONFIG;
    const keyInput = document.querySelector("[data-admin-key]");
    const loadButton = document.querySelector("[data-load-responses]");
    const message = document.querySelector("[data-admin-message]");
    const panel = document.querySelector("[data-responses-panel]");

    function showMessage(text, type) {
        message.textContent = text;
        message.dataset.type = type;
    }

    function renderResponses(rows) {
        panel.innerHTML = "";

        if (!rows.length) {
            panel.innerHTML = '<section class="form-section"><p>No responses yet.</p></section>';
            return;
        }

        rows.reverse().forEach((row) => {
            const card = document.createElement("article");
            card.className = "response-card";
            card.innerHTML = `
                <h2>${row.customerName || "No name"}</h2>
                <dl>
                    <dt>Submitted</dt>
                    <dd>${row.timestamp || ""}</dd>
                    <dt>Instagram</dt>
                    <dd>${row.instagramUsername || ""}</dd>
                    <dt>English Books</dt>
                    <dd>${row.englishBooks || ""}</dd>
                    <dt>Bengali Books</dt>
                    <dd>${row.bengaliBooks || ""}</dd>
                    <dt>Custom Books</dt>
                    <dd>${row.customBooks || ""}</dd>
                    <dt>Colors</dt>
                    <dd>${row.fridgeMagnetColors || ""}</dd>
                    <dt>Shelf Types</dt>
                    <dd>${row.shelfTypes || ""}</dd>
                </dl>
            `;
            panel.appendChild(card);
        });
    }

    window.handleErithreadsResponses = function (response) {
        if (!response.success) {
            showMessage(response.message || "Could not load responses.", "error");
            return;
        }

        showMessage(`Loaded ${response.rows.length} response(s).`, "success");
        renderResponses(response.rows);
    };

    loadButton.addEventListener("click", () => {
        const adminKey = keyInput.value.trim();

        if (!config.googleAppsScriptUrl || config.googleAppsScriptUrl.includes("PASTE_YOUR")) {
            showMessage("Add your Google Apps Script URL in form-config.js first.", "error");
            return;
        }

        if (!adminKey) {
            showMessage("Enter your admin key.", "error");
            return;
        }

        showMessage("Loading responses...", "pending");

        const existingScript = document.querySelector("[data-response-loader]");
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement("script");
        script.dataset.responseLoader = "true";
        script.src = `${config.googleAppsScriptUrl}?adminKey=${encodeURIComponent(adminKey)}&callback=handleErithreadsResponses`;
        script.onerror = () => {
            showMessage("Could not reach the response storage.", "error");
        };
        document.body.appendChild(script);
    });
})();
