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
