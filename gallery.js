class ImageGallery {
    constructor() {
        this.galleryContainer = document.getElementById('gallery');
        this.loadingIndicator = document.getElementById('loading');
        this.errorMessage = document.getElementById('error');
        this.galleryStats = document.getElementById('gallery-stats');
        this.imageCount = document.getElementById('image-count');
        this.modal = document.getElementById('modal');
        this.modalImage = document.getElementById('modal-image');
        this.closeModalBtn = document.getElementById('close-modal');
        this.prevBtn = document.getElementById('prev-image');
        this.nextBtn = document.getElementById('next-image');
        
        this.images = [];
        this.currentImageIndex = 0;
        
        this.init();
    }
    
    init() {
        this.loadImages();
        this.setupModalEvents();
        this.setupKeyboardNavigation();
    }
    
    async loadImages() {
        try {
            this.showLoading();
            
            const response = await fetch('images.json');
            if (!response.ok) {
                throw new Error('Failed to fetch images.json');
            }
            
            const data = await response.json();
            this.images = data.images;
            this.renderGallery(data.images);
            this.updateStats(data.images.length);
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading images:', error);
            this.showError();
        }
    }
    
    renderGallery(images) {
        this.galleryContainer.innerHTML = '';
        
        images.forEach((image, index) => {
            const imageCard = this.createImageCard(image, index);
            imageCard.style.opacity = '0';
            imageCard.style.transform = 'translateY(20px)';
            this.galleryContainer.appendChild(imageCard);
            
            // Add staggered animation delay
            setTimeout(() => {
                imageCard.style.transition = 'all 0.6s ease-in-out';
                imageCard.style.opacity = '1';
                imageCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        this.galleryContainer.classList.remove('hidden');
    }
    
    createImageCard(image, index) {
        const card = document.createElement('div');
        card.className = 'image-card rounded-2xl overflow-hidden cursor-pointer group shadow-sm';
        
        card.innerHTML = `
            <div class="aspect-square overflow-hidden relative">
                <img 
                    src="images/${image.name}" 
                    alt="${image.alt || 'Gallery image'}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    loading="lazy"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                            <span class="text-white text-sm font-medium">View</span>
                        </div>
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-white">
                <p class="text-gray-600 text-sm truncate">${image.alt || 'Gallery image'}</p>
            </div>
        `;
        
        // Add click event to open modal
        card.addEventListener('click', () => {
            this.currentImageIndex = index;
            this.openModal(`images/${image.name}`, image.alt || 'Gallery image');
        });
        
        return card;
    }
    
    setupModalEvents() {
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.prevBtn.addEventListener('click', () => {
            this.showPreviousImage();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.showNextImage();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('hidden')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.showPreviousImage();
                        break;
                    case 'ArrowRight':
                        this.showNextImage();
                        break;
                }
            }
        });
    }
    
    openModal(imageSrc, imageAlt) {
        this.modalImage.src = imageSrc;
        this.modalImage.alt = imageAlt;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Update navigation button visibility
        this.updateNavigationButtons();
    }
    
    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateModalImage();
        }
    }
    
    showNextImage() {
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
            this.updateModalImage();
        }
    }
    
    updateModalImage() {
        const currentImage = this.images[this.currentImageIndex];
        this.modalImage.src = `images/${currentImage.name}`;
        this.modalImage.alt = currentImage.alt || 'Gallery image';
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        this.prevBtn.style.opacity = this.currentImageIndex > 0 ? '1' : '0.3';
        this.nextBtn.style.opacity = this.currentImageIndex < this.images.length - 1 ? '1' : '0.3';
        this.prevBtn.style.pointerEvents = this.currentImageIndex > 0 ? 'auto' : 'none';
        this.nextBtn.style.pointerEvents = this.currentImageIndex < this.images.length - 1 ? 'auto' : 'none';
    }
    
    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.galleryContainer.classList.add('hidden');
        this.galleryStats.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }
    
    updateStats(count) {
        this.imageCount.textContent = `${count} ${count === 1 ? 'image' : 'images'}`;
        this.galleryStats.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }
    
    showError() {
        this.loadingIndicator.classList.add('hidden');
        this.galleryContainer.classList.add('hidden');
        this.errorMessage.classList.remove('hidden');
    }
    
    // Method to refresh the gallery (useful for dynamic updates)
    refresh() {
        this.loadImages();
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new ImageGallery();
});

// Optional: Auto-refresh every 30 seconds to check for new images
// Uncomment the line below if you want automatic refresh
// setInterval(() => window.gallery.refresh(), 30000);
