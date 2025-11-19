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
    const galleryImageSrcs = Array.from(galleryItems).map(item => item.src);
    let currentIndex = 0;

    // Function to update the modal image
    function updateModalImage(index) {
        currentIndex = index;
        modalImage.src = galleryImageSrcs[currentIndex];
    }

    if (modal && modalImage && modalClose && galleryItems && modalPrev && modalNext) {
        
        // Add click event to each gallery item to open the modal
        galleryItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                updateModalImage(index); // Set the correct image
                modal.classList.add("active");
            });
        });

        // --- Navigation Button Listeners ---

        // Next button
        modalNext.addEventListener("click", () => {
            // Modulo operator (%) handles wrapping back to 0
            let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
            updateModalImage(nextIndex);
        });

        // Previous button
        modalPrev.addEventListener("click", () => {
            // This formula correctly handles wrapping from 0 to the last index
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

    if (contactForm && successMessage) {
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
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending…";
            }

            // Send to Apps Script endpoint
            try {
                const res = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-WEBHOOK-SECRET": WEBHOOK_SECRET
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    // try to get error message
                    let errText = await res.text();
                    throw new Error(`Server responded with ${res.status}: ${errText}`);
                }

                const result = await res.json();

                if (result && result.status === "success") {
                    // Show success message
                    successMessage.style.display = "block";
                    // Reset form
                    contactForm.reset();

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMessage.style.display = "none";
                    }, 5000);
                } else {
                    throw new Error(result && result.message ? result.message : "Unknown server response");
                }
            } catch (err) {
                console.error("Contact form send error:", err);
                alert("An error occurred while sending. Check the browser console for details.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Send Inquiry";
                }
            }
        });
    }

});
