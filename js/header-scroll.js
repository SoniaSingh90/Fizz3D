/**
 * header-scroll.js
 * Makes the header hide when scrolling down and show when scrolling up
 */

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance before triggering
        
        if (!this.header) return;
        
        // Add scroll-aware class to header
        this.header.classList.add('scroll-aware');
    }
    
    init() {
        // Only initialize if header exists
        if (!this.header) return;
        
        // Listen for scroll events
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't do anything if we're at the top of the page
        if (currentScrollTop <= 0) {
            this.header.classList.remove('header-hidden');
            this.lastScrollTop = 0;
            return;
        }
        
        if (Math.abs(this.lastScrollTop - currentScrollTop) <= this.scrollThreshold) {
            return;
        }
        
        // Show/hide header based on scroll direction
        if (currentScrollTop > this.lastScrollTop) {
            // Scrolling down
            this.header.classList.add('header-hidden');
        } else {
            // Scrolling up
            this.header.classList.remove('header-hidden');
        }
        
        this.lastScrollTop = currentScrollTop;
    }
} 