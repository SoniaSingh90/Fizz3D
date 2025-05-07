/**
 * theme-toggle.js
 * Handles dark/light theme toggling with localStorage persistence
 */

class ThemeToggle {
    constructor() {
        this.body = document.body;
        this.themeToggleBtn = document.getElementById('themeToggle');
        
        // Make sure we have the toggle button
        if (!this.themeToggleBtn) {
            console.error('Theme toggle button not found');
            return;
        }
        
        this.themeIcon = this.themeToggleBtn.querySelector('i');
        this.themeText = this.themeToggleBtn.querySelector('.theme-text');
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }
    
    init() {
        // Initialize theme on page load
        this.applyTheme();
        
        // Set up event listener
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }
    
    applyTheme() {
        if (this.currentTheme === 'dark') {
            this.body.classList.remove('light-mode');
            this.body.classList.add('dark-mode');
            this.themeIcon.classList.remove('fa-sun');
            this.themeIcon.classList.add('fa-moon');
            if (this.themeText) {
                this.themeText.textContent = 'Dark';
            }
        } else {
            this.body.classList.remove('dark-mode');
            this.body.classList.add('light-mode');
            this.themeIcon.classList.remove('fa-moon');
            this.themeIcon.classList.add('fa-sun');
            if (this.themeText) {
                this.themeText.textContent = 'Light';
            }
        }
    }
    
    toggleTheme() {
        if (this.currentTheme === 'light') {
            this.currentTheme = 'dark';
        } else {
            this.currentTheme = 'light';
        }
        
        // Save to localStorage
        localStorage.setItem('theme', this.currentTheme);
        
        // Apply the new theme
        this.applyTheme();
        
        // Dispatch event that theme has changed
        document.dispatchEvent(new CustomEvent('themeChange', { 
            detail: { theme: this.currentTheme } 
        }));
    }
}

// Global function to initialize theme toggle (can be called after header is loaded)
function initThemeToggle() {
    if (document.getElementById('themeToggle')) {
        const themeToggle = new ThemeToggle();
        themeToggle.init();
        return themeToggle;
    }
    return null;
}

// Initialize the theme toggler when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the current theme from localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme to body immediately (before toggle button is available)
    if (currentTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    
    // Try to initialize the theme toggle
    // If header is loaded dynamically, this might be called again later
    initThemeToggle();
}); 