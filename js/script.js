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
        // For accessibility, update alt text if available from the source item
        const srcOwner = galleryItems[currentIndex];
        if (srcOwner && srcOwner.alt !== undefined) {
            modalImage.alt = srcOwner.alt || `Gallery image ${currentIndex + 1}`;
        } else {
            modalImage.alt = `Gallery image ${currentIndex + 1}`;
        }
    }

    // Helper: open modal at index
    function openModalAt(index) {
        updateModalImage(index);
        if (modal) {
            modal.classList.add("active");
            // focus the close button for keyboard users
            if (modalClose) modalClose.focus();
        }
    }

    // Helper: close modal
    function closeModal() {
        if (modal) {
            modal.classList.remove("active");
        }
    }

    if (modal && modalImage && modalClose && galleryItems && modalPrev && modalNext) {
        
        // Make gallery items keyboard-focusable (so Enter/Space can open the modal)
        galleryItems.forEach(item => {
            // Only set tabindex if not already focusable
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
            }
            // Add key handlers to open modal with Enter or Space
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    // Prevent scrolling when Space is used
                    e.preventDefault();
                    const idx = Array.from(galleryItems).indexOf(item);
                    openModalAt(idx);
                }
            });
        });

        // Add click event to each gallery item to open the modal
        galleryItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                openModalAt(index); // Set the correct image
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
            closeModal();
        });

        // Close modal by clicking on the background
        modal.addEventListener("click", (e) => {
            // We check to make sure the click is *not* on the nav arrows or the image
            if (e.target === modal) {
                closeModal();
            }
        });

        // --- Keyboard Support for Modal Navigation ---
        // Global keydown listener to handle left/right/escape when modal is open.
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return; // only when modal open

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    {
                        let nextIndex = (currentIndex + 1) % galleryImageSrcs.length;
                        updateModalImage(nextIndex);
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    {
                        let prevIndex = (currentIndex - 1 + galleryImageSrcs.length) % galleryImageSrcs.length;
                        updateModalImage(prevIndex);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeModal();
                    break;
                case 'Home':
                    // optional: jump to first image
                    e.preventDefault();
                    updateModalImage(0);
                    break;
                case 'End':
                    // optional: jump to last image
                    e.preventDefault();
                    updateModalImage(galleryImageSrcs.length - 1);
                    break;
                default:
                    break;
            }
        });

        // Optional: keyboard support for Prev/Next buttons themselves (for accessibility)
        [modalPrev, modalNext].forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    btn.click();
                }
            });
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
