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

    // Defensive: if gallery items contain elements that are not <img>,
    // prefer data-src attribute but fall back to src if present.
    const galleryImageSrcs = Array.from(galleryItems).map(item => {
        return item.dataset && item.dataset.src ? item.dataset.src
             : (item.src ? item.src : (item.querySelector && item.querySelector('img') ? item.querySelector('img').src : ""));
    }).filter(src => src); // remove empty strings

    let currentIndex = 0;

    // Function to update the modal image
    function updateModalImage(index) {
        if (!galleryImageSrcs.length) return;
        // Normalize index (just in case)
        currentIndex = ((index % galleryImageSrcs.length) + galleryImageSrcs.length) % galleryImageSrcs.length;
        modalImage.src = galleryImageSrcs[currentIndex];
        // For accessibility, update alt if possible (try to pull alt from the original element)
        const original = galleryItems[currentIndex];
        if (original) {
            const alt = original.alt ?? (original.dataset && original.dataset.alt) ?? "";
            modalImage.alt = alt;
        }
    }

    if (modal && modalImage && modalClose && galleryItems && modalPrev && modalNext) {
        
        // Add click event to each gallery item to open the modal
        galleryItems.forEach((item, index) => {
            item.addEventListener("click", (e) => {
                // Prevent link navigation if the gallery item is inside an <a>
                if (e && e.preventDefault) e.preventDefault();

                // If we filtered src list, make sure index maps correctly.
                // Find the corresponding index in galleryImageSrcs for this item.
                const src = (item.dataset && item.dataset.src) ? item.dataset.src
                          : (item.src ? item.src : (item.querySelector && item.querySelector('img') ? item.querySelector('img').src : ""));
                const mappedIndex = galleryImageSrcs.indexOf(src);
                const useIndex = mappedIndex >= 0 ? mappedIndex : 0;

                updateModalImage(useIndex); // Set the correct image
                modal.classList.add("active");

                // Optionally set focus to modal for keyboard users
                modal.setAttribute("tabindex", "-1");
                modal.focus();
            });
        });

        // --- Navigation Button Listeners ---

        // Next button
        modalNext.addEventListener("click", () => {
            if (!galleryImageSrcs.length) return;
            let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
            updateModalImage(nextIndex);
        });

        // Previous button
        modalPrev.addEventListener("click", () => {
            if (!galleryImageSrcs.length) return;
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

        // --- KEYBOARD NAVIGATION ---
        // Right Arrow (→) = next, Left Arrow (←) = previous, Escape = close
        document.addEventListener("keydown", (e) => {
            // Only respond when modal is open / active
            if (!modal.classList.contains("active")) return;

            // Prevent default page scrolling when using arrow keys while modal is active
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
            }

            if (e.key === "ArrowRight") {
                if (!galleryImageSrcs.length) return;
                let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
                updateModalImage(nextIndex);
            }

            if (e.key === "ArrowLeft") {
                if (!galleryImageSrcs.length) return;
                let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
                updateModalImage(prevIndex);
            }

            if (e.key === "Escape" || e.key === "Esc") {
                modal.classList.remove("active");
            }
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success-message");

    if (contactForm && successMessage) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Prevent actual form submission for this demo

            // In a real project, you would send data to a server here.
            
            // Show success message
            successMessage.style.display = "block";
            
            // Reset form
            contactForm.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 5000);
        });
    }

});
