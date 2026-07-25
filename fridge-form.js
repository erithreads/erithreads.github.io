(function () {
    const books = window.ERITHREADS_BOOKS;
    const config = window.ERITHREADS_FORM_CONFIG;

    const form = document.querySelector("[data-book-form]");
    const hiddenForm = document.querySelector("[data-hidden-submit-form]");
    const payloadInput = document.querySelector("[data-payload-input]");
    const message = document.querySelector("[data-form-message]");
    const submitFrame = document.querySelector(".hidden-submit-frame");
    const searchInput = document.querySelector("[data-book-search]");
    const searchResults = document.querySelector("[data-search-results]");
    const bookToggles = document.querySelectorAll("[data-book-toggle]");

    let hasSubmitted = false;

    function createCheckbox(name, value, category) {
        const label = document.createElement("label");
        label.className = "option-row";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        input.value = value;
        input.dataset.category = category;

        const text = document.createElement("span");
        text.className = "option-text";

        if (category === "bengali") {
            const titleParts = value.match(/^(.*)\s(\([^()]+\))$/);

            if (titleParts) {
                const bengaliTitle = document.createElement("span");
                bengaliTitle.textContent = titleParts[1];

                const transliteratedTitle = document.createElement("span");
                transliteratedTitle.className = "option-transliteration";
                transliteratedTitle.textContent = titleParts[2];

                text.append(bengaliTitle, transliteratedTitle);
            } else {
                text.textContent = value;
            }
        } else {
            text.textContent = value;
        }

        label.append(input, text);
        return label;
    }

    function renderOptions(selector, values, name, category) {
        const container = document.querySelector(selector);
        container.innerHTML = "";
        values.forEach((value) => {
            container.appendChild(createCheckbox(name, value, category));
        });
    }

    function getCheckedValues(name) {
        return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
    }

    function renderSearchResults(query) {
        const cleanQuery = query.trim().toLowerCase();
        searchResults.innerHTML = "";

        if (!cleanQuery) {
            return;
        }

        const allBooks = [
            ...books.english.map((title) => ({ title, category: "english" })),
            ...books.bengali.map((title) => ({ title, category: "bengali" }))
        ];

        const matches = allBooks.filter((book) => book.title.toLowerCase().includes(cleanQuery));

        if (matches.length === 0) {
            searchResults.innerHTML = '<p class="empty-state">No matching books found.</p>';
            return;
        }

        matches.forEach((book) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "search-result-button";
            button.textContent = `${book.title} (${book.category})`;
            button.addEventListener("click", () => {
                const input = form.querySelector(`input[data-category="${book.category}"][value="${book.title}"]`);
                if (input) {
                    const section = input.closest(".book-category");
                    setBookCategoryOpen(section, true);
                    input.checked = true;
                    input.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
            searchResults.appendChild(button);
        });
    }

    function buildPayload() {
        return {
            submittedAt: new Date().toISOString(),
            englishBooks: getCheckedValues("englishBooks"),
            bengaliBooks: getCheckedValues("bengaliBooks"),
            customBooks: form.elements.customBooks.value.trim(),
            fridgeMagnetColors: getCheckedValues("fridgeMagnetColors"),
            shelfTypes: getCheckedValues("shelfTypes"),
            customerName: form.elements.customerName.value.trim(),
            instagramUsername: form.elements.instagramUsername.value.trim()
        };
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.dataset.type = type;
    }

    function setBookCategoryOpen(section, isOpen) {
        const toggle = section.querySelector("[data-book-toggle]");
        section.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    }

    function toggleBookCategory(toggle) {
        const section = toggle.closest(".book-category");
        setBookCategoryOpen(section, !section.classList.contains("is-open"));
    }

    renderOptions("[data-english-books]", books.english, "englishBooks", "english");
    renderOptions("[data-bengali-books]", books.bengali, "bengaliBooks", "bengali");
    renderOptions("[data-colors]", books.colors, "fridgeMagnetColors", "color");
    renderOptions("[data-shelf-types]", books.shelfTypes, "shelfTypes", "shelf");

    searchInput.addEventListener("input", () => {
        renderSearchResults(searchInput.value);
    });

    bookToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            toggleBookCategory(toggle);
        });
    });

    submitFrame.addEventListener("load", () => {
        if (!hasSubmitted) {
            return;
        }

        showMessage("Submitted successfully. Thank you!", "success");
        form.reset();
        searchResults.innerHTML = "";
        hasSubmitted = false;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!config.googleAppsScriptUrl || config.googleAppsScriptUrl.includes("PASTE_YOUR")) {
            showMessage("Form storage is not connected yet. Add your Google Apps Script URL in form-config.js.", "error");
            return;
        }

        hasSubmitted = true;
        showMessage("Submitting...", "pending");
        hiddenForm.action = config.googleAppsScriptUrl;
        payloadInput.value = JSON.stringify(buildPayload());
        hiddenForm.submit();
    });
})();
