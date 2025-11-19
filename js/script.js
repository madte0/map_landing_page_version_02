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
        
        // Open modal from gallery click
        galleryItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                updateModalImage(index);
                modal.classList.add("active");
            });
        });

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

        // Close modal
        modalClose.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });

        // --- KEYBOARD NAVIGATION (NEW) ---
        document.addEventListener("keydown", (e) => {
            if (!modal.classList.contains("active")) return;

            if (e.key === "ArrowRight") {
                let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
                updateModalImage(nextIndex);
            }

            if (e.key === "ArrowLeft") {
                let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
                updateModalImage(prevIndex);
            }

            if (e.key === "Escape") {
                modal.classList.remove("active");
            }
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success-message");

    if (contactForm && successMessage) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            successMessage.style.display = "block";
            contactForm.reset();

            setTimeout(() => {
                successMessage.style.display = "none";
            }, 5000);
        });
    }

});
