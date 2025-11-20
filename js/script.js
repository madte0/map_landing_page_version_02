// js/script.js
document.addEventListener("DOMContentLoaded", () => {
    // --- Mobile Navigation Toggle ---
    const menuToggle = document.getElementById("menu-toggle");
    const navCloseBtn = document.getElementById("nav-close-btn");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");

    if (menuToggle && navbar && navCloseBtn) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.add("active");
        });

        navCloseBtn.addEventListener("click", () => {
            navbar.classList.remove("active");
        });

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

    const galleryImageSrcs = Array.from(galleryItems).map(item => item.src);
    let currentIndex = 0;

    function updateModalImage(index) {
        currentIndex = index;
        modalImage.src = galleryImageSrcs[currentIndex];
    }

    if (modal && modalImage && modalClose && galleryItems && modalPrev && modalNext) {
        galleryItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                updateModalImage(index);
                modal.classList.add("active");
            });
        });

        modalNext.addEventListener("click", () => {
            let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
            updateModalImage(nextIndex);
        });

        modalPrev.addEventListener("click", () => {
            let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
            updateModalImage(prevIndex);
        });

        modalClose.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (!modal.classList.contains("active")) return;

            if (e.key === "ArrowRight") {
                e.preventDefault();
                let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
                updateModalImage(nextIndex);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
                updateModalImage(prevIndex);
            } else if (e.key === "Escape") {
                modal.classList.remove("active");
            }
        });
    }

    // ---------- EmailJS INIT (replace YOUR_PUBLIC_KEY below) ----------
    // The EmailJS SDK must already be loaded in the page (script tag).
    // Replace 'YOUR_PUBLIC_KEY' with the public key from EmailJS dashboard.
    if (typeof emailjs !== "undefined") {
        try {
            emailjs.init("1q88Xk9pcCFt880cB"); // <- REPLACE THIS
            // Optionally console.log a confirmation (comment out in production)
            // console.log("EmailJS initialized");
        } catch (err) {
            console.warn("EmailJS init failed:", err);
        }
    } else {
        console.warn("EmailJS SDK not found. Make sure you loaded email.min.js before script.js");
    }

    // --- Contact Form Submission (EmailJS) ---
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success-message");

    if (contactForm && successMessage) {
        // Hide success message initially (in case CSS does not)
        successMessage.style.display = "none";

        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Replace these with your actual EmailJS service/template IDs
            const SERVICE_ID = "service_afh0vha";   // <- REPLACE THIS
            const TEMPLATE_ID = "template_4i37okj"; // <- REPLACE THIS

            // Show simple "sending..." feedback by reusing successMessage element temporarily
            successMessage.style.display = "block";
            successMessage.textContent = "Sending...";

            // Send form using EmailJS sendForm helper (sends the whole form)
            // Note: emailjs.sendForm returns a promise
            if (typeof emailjs === "undefined" || !emailjs.sendForm) {
                successMessage.textContent = "Email service not configured. See console for details.";
                console.error("EmailJS SDK is missing or incompatible.");
                return;
            }

            emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm)
                .then((response) => {
                    // Success
                    successMessage.textContent = "Thank you for your inquiry! We will be in touch soon.";
                    // Optional: log response for debugging
                    console.log("EmailJS success:", response.status, response.text);

                    // Reset form fields
                    contactForm.reset();

                    // Hide success message after 6 seconds
                    setTimeout(() => {
                        successMessage.style.display = "none";
                    }, 6000);
                }, (error) => {
                    // Failure
                    console.error("EmailJS error:", error);
                    successMessage.textContent = "Sorry — there was a problem sending your message. Please try again later.";
                    // Keep error message visible a bit longer
                    setTimeout(() => {
                        successMessage.style.display = "none";
                    }, 8000);
                });
        });
    }
});
