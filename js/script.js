document.addEventListener("DOMContentLoaded", () => {
    
    // --- Mobile Navigation Toggle ---
    const menuToggle = document.getElementById("menu-toggle");
    const navCloseBtn = document.getElementById("nav-close-btn");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");

    if (menuToggle && navbar && navCloseBtn) {
        // Open menu
        menuToggle.addEventListener("click", () => {
            navbar.classList.add("active");
        });

        // Close menu with 'X' button
        navCloseBtn.addEventListener("click", () => {
            navbar.classList.remove("active");
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navbar.classList.remove("active");
            });
        });
    }

    // --- Gallery Modal ---
    const modal = document.getElementById("gallery-modal");
    const modalImage = document.getElementById("modal-image");
    const modalClose = document.getElementById("modal-close");
    const galleryItems = document.querySelectorAll(".gallery-item");
    const modalPrev = document.getElementById("modal-prev");
    const modalNext = document.getElementById("modal-next");

    // Create an array of all gallery image sources
    const galleryImageSrcs = Array.from(galleryItems)
        .map(item => item && (item.src || item.getAttribute('data-src') || ""))
        .filter(src => !!src); // remove empty strings
    let currentIndex = 0;

    // Function to update the modal image
    function updateModalImage(index) {
        if (!galleryImageSrcs.length) return;
        // clamp index
        index = ((index % galleryImageSrcs.length) + galleryImageSrcs.length) % galleryImageSrcs.length;
        currentIndex = index;
        // Only update if modalImage exists
        if (modalImage) modalImage.src = galleryImageSrcs[currentIndex];
    }

    // Only attach modal functionality if we actually have images and required DOM nodes
    if (modal && modalImage && modalClose && modalPrev && modalNext && galleryImageSrcs.length) {
        
        // Add click event to each gallery item to open the modal
        galleryItems.forEach((item, index) => {
            if (!item) return;
            item.addEventListener("click", () => {
                // ensure the clicked item has a valid src index (if images were filtered, map index to src)
                // Find the index of this item's src in galleryImageSrcs
                const src = item.src || item.getAttribute('data-src') || "";
                const idx = galleryImageSrcs.indexOf(src);
                const openIndex = idx >= 0 ? idx : 0;
                updateModalImage(openIndex); // Set the correct image
                modal.classList.add("active");
            });
        });

        // --- Navigation Button Listeners ---

        // Next button
        modalNext.addEventListener("click", () => {
            let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
            updateModalImage(nextIndex);
        });

        // Previous button
        modalPrev.addEventListener("click", () => {
            let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
            updateModalImage(prevIndex);
        });


        // --- Close Modal Listeners ---

        // Close modal with 'X' button
        modalClose.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        // Close modal by clicking on the background
        modal.addEventListener("click", (e) => {
            // We check to make sure the click is *not* on the nav arrows or the image
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });

        // --- Keyboard Navigation ---
        // Right Arrow: next image
        // Left Arrow: previous image
        // Escape: close modal
        document.addEventListener("keydown", (e) => {
            // Only respond to keys when modal is open
            if (!modal.classList.contains("active")) return;

            if (e.key === "ArrowRight") {
                e.preventDefault(); // prevent page scrolling
                let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
                updateModalImage(nextIndex);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault(); // prevent page scrolling
                let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
                updateModalImage(prevIndex);
            } else if (e.key === "Escape") {
                modal.classList.remove("active");
            }
        });

    } else {
        // If modal exists but we had no images, hide modal controls to avoid confusing UI
        if (modal && modalImage && (!galleryImageSrcs.length)) {
            console.warn("Gallery modal initialized but no gallery images found.");
            // optionally hide modal controls if present
            if (modalPrev) modalPrev.style.display = "none";
            if (modalNext) modalNext.style.display = "none";
            if (modalClose) modalClose.style.display = "none";
        }
    }

    // --- Contact Form Submission (sends to Google Apps Script endpoint) ---
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success-message");

    // === CONFIGURE THESE ===
    // Replace this with the URL you get after deploying the Apps Script web app
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyD1CSv1ZjTR35VQEWpaiFFlo7jqIimHTqAOoZi7lFNRUXlr4KbKohxCvimXXm8mi0RwQ/exec";

    // Optional: a secret string that both the client and script share. Set the same string in Apps Script.
    const WEBHOOK_SECRET = "9c5b94b1-35ad-10bb-b118-8e8fc24abf80";
    // =======================

    // tiny helper: show a non-blocking message (used for dev)
    function showTemporaryMessage(msg, duration = 5000) {
        if (!successMessage) return;
        successMessage.textContent = msg;
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
        }, duration);
    }

    if (contactForm && successMessage) {
        // ensure success message is hidden initially (defensive)
        successMessage.style.display = successMessage.style.display || "none";

        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(contactForm);
            const payload = {
                name: (formData.get("name") || "").trim(),
                email: (formData.get("email") || "").trim(),
                interest: (formData.get("interest") || "").trim(),
                message: (formData.get("message") || "").trim(),
                to: "ateo05@gmail.com" // destination email (you asked for this)
            };

            // Simple front-end validation
            if (!payload.name) {
                alert("Please enter your name.");
                return;
            }
            if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) {
                alert("Please enter a valid email address.");
                return;
            }
            if (!payload.message) {
                if (!confirm("Send without a message?")) return;
            }

            // Disable submit button to prevent duplicate sends
            const submitBtn = contactForm.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                // keep the original text for restoration
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = "Sending…";

                // Send to Apps Script endpoint
                try {
                    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("REPLACE_WITH")) {
                        throw new Error("Google Script URL not configured. Please set GOOGLE_SCRIPT_URL in js/script.js");
                    }

                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

                    const res = await fetch(GOOGLE_SCRIPT_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-WEBHOOK-SECRET": WEBHOOK_SECRET
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    clearTimeout(timeout);

                    if (!res.ok) {
                        // try to get error message
                        let errText;
                        try {
                            errText = await res.text();
                        } catch (e) {
                            errText = `Status ${res.status}`;
                        }
                        throw new Error(`Server responded with ${res.status}: ${errText}`);
                    }

                    // parse JSON safely
                    let result;
                    try {
                        result = await res.json();
                    } catch (parseErr) {
                        throw new Error("Failed to parse server response as JSON.");
                    }

                    if (result && result.status === "success") {
                        // Show success message and reset
                        successMessage.textContent = "Thank you for your inquiry! We will be in touch soon.";
                        successMessage.style.display = "block";
                        contactForm.reset();

                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            successMessage.style.display = "none";
                        }, 5000);
                    } else {
                        const msg = result && result.message ? result.message : "Unknown server response";
                        throw new Error(msg);
                    }
                } catch (err) {
                    console.error("Contact form send error:", err);
                    // show friendly error to the user
                    alert("An error occurred while sending. Open the browser console for more info.");
                } finally {
                    // restore button state
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || "Send Inquiry";
                    }
                }
            } else {
                // no submit button found — still attempt send (edge-case)
                try {
                    const res = await fetch(GOOGLE_SCRIPT_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-WEBHOOK-SECRET": WEBHOOK_SECRET
                        },
                        body: JSON.stringify(payload),
                    });

                    if (!res.ok) throw new Error("Network response was not ok");
                    const result = await res.json();
                    if (result && result.status === "success") {
                        showTemporaryMessage("Thank you for your inquiry!");
                        contactForm.reset();
                    } else {
                        throw new Error(result && result.message ? result.message : "Unknown server response");
                    }
                } catch (err) {
                    console.error("Contact form send error:", err);
                    alert("An error occurred while sending. Check the console for details.");
                }
            }
        });
    } else {
        if (!contactForm) console.warn("No contact form element found with id 'contact-form'.");
        if (!successMessage) console.warn("No success message element found with id 'form-success-message'.");
    }

});
