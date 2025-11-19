document.addEventListener("DOMContentLoaded", () => {

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.getElementById("menu-toggle");
    const navCloseBtn = document.getElementById("nav-close-btn");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");

    if (menuToggle && navbar && navCloseBtn) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.add("active");
            navbar.setAttribute("aria-hidden", "false");
        });

        navCloseBtn.addEventListener("click", () => {
            navbar.classList.remove("active");
            navbar.setAttribute("aria-hidden", "true");
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navbar.classList.remove("active");
                navbar.setAttribute("aria-hidden", "true");
            });
        });
    }

    // --- Gallery Modal & Features (lazy load, captions, swipe, focus trap) ---
    const modal = document.getElementById("gallery-modal");
    const modalImage = document.getElementById("modal-image");
    const modalClose = document.getElementById("modal-close");
    const galleryItems = document.querySelectorAll(".gallery-item");
    const modalPrev = document.getElementById("modal-prev");
    const modalNext = document.getElementById("modal-next");
    const modalCaption = document.getElementById("modal-caption"); // optional caption element
    const modalInner = modal ? modal.querySelector(".modal-inner") : null; // container inside modal for animation/focus

    // Required checks
    if (!modal || !modalImage || !modalClose || !modalPrev || !modalNext || galleryItems.length === 0) {
        return;
    }

    // Build a list of sources and alt/caption info.
    // Support: <img src>, element.dataset.src (lazy), element.href, inner <img>, and element.dataset-caption or inner img alt.
    const galleryData = Array.from(galleryItems).map(item => {
        let src = "";
        let alt = "";
        if (item.tagName === "IMG") {
            src = item.dataset.src || item.getAttribute("src") || "";
            alt = item.getAttribute("alt") || "";
        } else {
            src = item.dataset.src || item.getAttribute("href") || "";
            const innerImg = item.querySelector && item.querySelector("img");
            if (innerImg) alt = innerImg.getAttribute("alt") || "";
            alt = alt || item.dataset.alt || "";
        }
        const caption = item.dataset.caption || alt || "";
        return { src, alt, caption };
    }).filter(obj => obj.src); // drop entries without any src

    if (galleryData.length === 0) return;

    let currentIndex = 0;
    let lastFocused = null;

    // Lazy-load helper: returns a Promise that resolves when image loads or fails
    function loadImage(src) {
        return new Promise((resolve) => {
            if (!src) { resolve(null); return; }
            const img = new Image();
            img.loading = "lazy";
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });
    }

    async function updateModalImage(index, { preloaded = false } = {}) {
        if (galleryData.length === 0) return;
        currentIndex = ((index % galleryData.length) + galleryData.length) % galleryData.length;
        const entry = galleryData[currentIndex];

        // set a loading state (class) for animation/visual feedback
        modal.classList.add("loading");
        modalImage.alt = entry.alt || `Image ${currentIndex + 1} of ${galleryData.length}`;
        // lazy load - only set src once loaded (reduces flicker)
        const img = await loadImage(entry.src);
        if (img) {
            modalImage.src = entry.src;
        } else {
            // fallback: clear src and show alt/caption text
            modalImage.removeAttribute("src");
            modalImage.alt = entry.alt || "Image failed to load";
        }
        if (modalCaption) {
            modalCaption.textContent = entry.caption || `Image ${currentIndex + 1} of ${galleryData.length}`;
        }
        modal.classList.remove("loading");
        updateControlsState();
    }

    function updateControlsState() {
        const single = galleryData.length <= 1;
        modalPrev.disabled = single;
        modalNext.disabled = single;
        if (single) {
            modalPrev.setAttribute("aria-hidden", "true");
            modalNext.setAttribute("aria-hidden", "true");
        } else {
            modalPrev.setAttribute("aria-hidden", "false");
            modalNext.setAttribute("aria-hidden", "false");
        }
    }
    updateControlsState();

    // Open modal from gallery click
    galleryItems.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            if (e) e.preventDefault && e.preventDefault();
            // find corresponding index in filtered galleryData (in case some items had no src)
            const src = (item.tagName === "IMG" && (item.dataset.src || item.getAttribute("src"))) || item.dataset.src || item.getAttribute("href") || (item.querySelector && (item.querySelector("img") && item.querySelector("img").getAttribute("src"))) || "";
            const mappedIndex = galleryData.findIndex(g => g.src === src);
            const useIndex = mappedIndex >= 0 ? mappedIndex : (index % galleryData.length);
            lastFocused = document.activeElement;
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open"); // optional body lock
            // small delay to allow CSS animation; focus management after is fine
            updateModalImage(useIndex);
            trapFocusStart();
        });

        // keyboard accessibility: make item focusable and activate on Enter/Space
        if (!item.hasAttribute("tabindex")) {
            item.setAttribute("tabindex", "0");
            item.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    item.click();
                }
            });
        }
    });

    // Prev / Next click handlers
    modalNext.addEventListener("click", (e) => {
        if (e) e.preventDefault && e.preventDefault();
        const nextIndex = (currentIndex + 1) % galleryData.length;
        updateModalImage(nextIndex);
    });

    modalPrev.addEventListener("click", (e) => {
        if (e) e.preventDefault && e.preventDefault();
        const prevIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        updateModalImage(prevIndex);
    });

    // Close modal helper
    function closeModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        releaseFocusTrap();
        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(); // click on backdrop closes
    });

    // Keyboard navigation and Escape
    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;

        if (e.key === "ArrowRight") {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % galleryData.length;
            updateModalImage(nextIndex);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
            updateModalImage(prevIndex);
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeModal();
        } else if (e.key === "Tab") {
            // focus trapping handled separately; allow Tab handler to manage
            maintainFocusWithinModal(e);
        }
    });

    // Image error handling
    modalImage.addEventListener("error", () => {
        modalImage.alt = "Failed to load image";
        modalImage.removeAttribute("src");
    });

    // --- Focus trap implementation ---
    // we'll collect focusable elements inside the modal and keep focus cycling between them.
    function getFocusableElements(container) {
        if (!container) return [];
        const selectors = [
            'a[href]',
            'area[href]',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])'
        ];
        return Array.from(container.querySelectorAll(selectors.join(','))).filter(el => el.offsetParent !== null || el.getAttribute('tabindex') === '0');
    }

    let focusableInModal = [];
    function trapFocusStart() {
        focusableInModal = getFocusableElements(modalInner || modal);
        if (focusableInModal.length) {
            focusableInModal[0].focus();
        } else {
            // fallback: focus the close button
            modalClose.focus();
        }
    }

    function maintainFocusWithinModal(e) {
        if (!modal.classList.contains("active")) return;
        if (!focusableInModal || focusableInModal.length === 0) return;

        const first = focusableInModal[0];
        const last = focusableInModal[focusableInModal.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function releaseFocusTrap() {
        focusableInModal = [];
    }

    // --- Touch/Swipe gestures for modal navigation ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchHasMoved = false;

    const SWIPE_MIN_DISTANCE = 40; // pixels
    const SWIPE_MAX_OFF_AXIS = 80; // if vertical delta > this, it's probably not a horizontal swipe

    modalInner && modalInner.addEventListener("touchstart", (e) => {
        if (!modal.classList.contains("active")) return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchHasMoved = false;
    }, { passive: true });

    modalInner && modalInner.addEventListener("touchmove", (e) => {
        touchHasMoved = true;
    }, { passive: true });

    modalInner && modalInner.addEventListener("touchend", (e) => {
        if (!modal.classList.contains("active") || !touchHasMoved) return;
        const changed = e.changedTouches[0];
        const dx = changed.clientX - touchStartX;
        const dy = changed.clientY - touchStartY;
        if (Math.abs(dy) > SWIPE_MAX_OFF_AXIS) return; // too much vertical movement
        if (Math.abs(dx) > SWIPE_MIN_DISTANCE) {
            if (dx < 0) {
                // left swipe -> next
                const nextIndex = (currentIndex + 1) % galleryData.length;
                updateModalImage(nextIndex);
            } else {
                // right swipe -> prev
                const prevIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
                updateModalImage(prevIndex);
            }
        }
    });

    // Prevent page scrolling when modal is open on some devices (optional)
    // We'll add/remove a class on body and leave CSS to prevent scroll when .modal-open is present.
});
