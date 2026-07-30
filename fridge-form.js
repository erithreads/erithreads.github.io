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
    const selectedBooksSection = document.querySelector("[data-selected-books-section]");
    const selectedBooks = document.querySelector("[data-selected-books]");
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

        const text = createBookText(value, category);

        label.append(input, text);
        return label;
    }

    function getBookDisplayParts(value, category) {
        if (category !== "bengali") {
            return [value];
        }

        const titleParts = value.match(/^(.*)\s(\([^()]+\))$/);

        if (!titleParts) {
            return [value];
        }

        return [titleParts[1], titleParts[2]];
    }

    function createBookText(value, category) {
        const text = document.createElement("span");
        text.className = "option-text";

        getBookDisplayParts(value, category).forEach((part, index) => {
            const line = document.createElement("span");
            line.textContent = part;

            if (index > 0) {
                line.className = "option-transliteration";
            }

            text.appendChild(line);
        });

        return text;
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
                    input.checked = true;
                    renderSelectedBooks();
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

    function renderSelectedBooks() {
        const checkedBooks = Array.from(
            form.querySelectorAll('input[name="englishBooks"]:checked, input[name="bengaliBooks"]:checked')
        );

        selectedBooks.innerHTML = "";
        selectedBooksSection.classList.toggle("is-hidden", checkedBooks.length === 0);

        checkedBooks.forEach((input) => {
            const selectedBook = document.createElement("div");
            selectedBook.className = "selected-book";

            const selectedText = createBookText(input.value, input.dataset.category);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "selected-book-remove";
            removeButton.setAttribute("aria-label", `Remove ${input.value}`);
            removeButton.addEventListener("click", () => {
                input.checked = false;
                renderSelectedBooks();
            });

            selectedBook.append(selectedText, removeButton);
            selectedBooks.appendChild(selectedBook);
        });
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

    form.addEventListener("change", (event) => {
        if (event.target.matches('input[name="englishBooks"], input[name="bengaliBooks"]')) {
            renderSelectedBooks();
        }
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
        renderSelectedBooks();
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
