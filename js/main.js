document.addEventListener("DOMContentLoaded", function() {
  
    const pathToRoot = window.location.pathname.includes('/pages/') ? '../' : '';
    
    // Check if we're on the Sussex server
    const isSussexServer = window.location.hostname.includes('sussex.ac.uk');
    const sussexBaseUrl = 'http://users.sussex.ac.uk/~Ss2618';
    const inPagesDir = window.location.pathname.includes('/pages/');
    
    // Function to process URLs based on environment
    function processUrls(element) {
        const links = element.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Handle different types of URLs
            if (href.startsWith('/')) {
                // Root-relative URLs
                if (isSussexServer) {
                    // On Sussex server, prepend the Sussex base URL
                    link.setAttribute('href', sussexBaseUrl + href);
                } else {
                    // On local machine, make it relative to current directory
                    if (inPagesDir) {
                        // If in pages directory, remove leading slash and add ../
                        link.setAttribute('href', '..' + href);
                    } else {
                        // If in root, just remove leading slash
                        link.setAttribute('href', href.substring(1));
                    }
                }
            } else if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('/')) {
                // Relative URLs (no leading slash)
                if (inPagesDir) {
                    // If in pages directory, add ../ to make it relative to root
                    link.setAttribute('href', '../' + href);
                }
            }
        });
    }
    
    // Load Header
    fetch(`${pathToRoot}partials/header.html`)
        .then(response => response.text())
        .then(data => {
            // Extract only the header component from the full HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const headerContent = tempDiv.querySelector('header');
            
            if (headerContent) {
                // Process URLs based on environment
                processUrls(headerContent);
                document.getElementById("header-placeholder").innerHTML = headerContent.outerHTML;
            } else {
                // Fallback if the header component can't be extracted
                document.getElementById("header-placeholder").innerHTML = data;
            }
            
            // After loading header, set active nav item
            setActiveNavItem();
            
            // Re-initialize theme toggle after loading header
            if (typeof initThemeToggle === 'function') {
                initThemeToggle();
            }

            // Initialize the scroll-aware header
            initScrollAwareHeader();
        })
        .catch(error => {
            console.error('Error loading header:', error);
            document.getElementById("header-placeholder").innerHTML = '<div class="alert alert-danger">Error loading header. Please try refreshing the page.</div>';
        });
    
    // Load Footer
    fetch(`${pathToRoot}partials/footer.html`)
        .then(response => response.text())
        .then(data => {
            // Extract only the footer component from the full HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const footerContent = tempDiv.querySelector('footer');
            
            if (footerContent) {
                // Process URLs based on environment
                processUrls(footerContent);
                document.getElementById("footer-placeholder").innerHTML = footerContent.outerHTML;
            } else {
                // Fallback if the footer component can't be extracted
                document.getElementById("footer-placeholder").innerHTML = data;
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            document.getElementById("footer-placeholder").innerHTML = '<div class="alert alert-danger">Error loading footer. Please try refreshing the page.</div>';
        });
    
    // Initialize 3D models if on the home page
    if (document.getElementById('coke-model-container')) {
        initializeModels();
    }
});

// Initialize scroll-aware header that hides on scroll down and shows on scroll up
function initScrollAwareHeader() {
    let header = document.querySelector('header');
    if (!header) return;
    
    // Add scroll-aware class to enable CSS transitions
    header.classList.add('scroll-aware');
    
    let lastScrollTop = 0;
    const scrollThreshold = 10; // Minimum scroll amount to trigger hide/show
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't do anything if we're at the top
        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
            return;
        }
        
        // Determine scroll direction and whether we've scrolled enough to trigger
        if (Math.abs(lastScrollTop - currentScroll) <= scrollThreshold) return;
        
        if (currentScroll > lastScrollTop) {
            // Scrolling DOWN
            header.classList.add('header-hidden');
        } else {
            // Scrolling UP
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = currentScroll;
    }, { passive: true });
}

// Set active navigation item based on current page
function setActiveNavItem() {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-link");
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        
        // Check if this is the active link
        if (linkHref === currentPage || 
            (currentPage === "" && linkHref === "index.html") ||
            (currentPage === "about.html" && linkHref === "pages/about.html")) {
            link.classList.add("active");
        }
    });
}

// Initialize 3D models
function initializeModels() {
    // Determine correct path to models based on current page location
    const pathToRoot = window.location.pathname.includes('/pages/') ? '../' : '';
    
    // Initialize each 3D model with its own controller
    const cokeModel = new ModelController('coke-model-container', `${pathToRoot}models/coke_can.glb`);
    const spriteModel = new ModelController('sprite-model-container', `${pathToRoot}models/sprite_can.glb`);
    const drPepperModel = new ModelController('dr-pepper-model-container', `${pathToRoot}models/dr_pepper_can.glb`);
    
    // Set up control buttons for Coca-Cola model
    setupModelControls('coke', cokeModel);
    
    // Set up control buttons for Sprite model
    setupModelControls('sprite', spriteModel);
    
    // Set up control buttons for Dr Pepper model
    setupModelControls('dr-pepper', drPepperModel);
}

// Set up controls for a specific model
function setupModelControls(modelPrefix, modelController) {
    // Toggle wireframe
    const wireframeBtn = document.getElementById(`${modelPrefix}-wireframe-btn`);
    if (wireframeBtn) {
        wireframeBtn.addEventListener('click', function() {
            const isWireframe = modelController.toggleWireframe();
            this.classList.toggle('active', isWireframe);
            this.innerHTML = isWireframe ? 
                '<i class="fas fa-cube"></i> Solid View' : 
                '<i class="fas fa-wind"></i> Wireframe View';
        });
    }
    
    // Toggle rotation
    const rotateBtn = document.getElementById(`${modelPrefix}-rotate-btn`);
    if (rotateBtn) {
        rotateBtn.addEventListener('click', function() {
            const isRotating = modelController.toggleRotation();
            this.classList.toggle('active', isRotating);
            this.innerHTML = isRotating ? 
                '<i class="fas fa-pause"></i> Stop Rotation' : 
                '<i class="fas fa-sync-alt"></i> Start Rotation';
        });
    }
    
    // Camera view buttons
    const viewButtons = {
        'front': document.getElementById(`${modelPrefix}-view-front`),
        'side': document.getElementById(`${modelPrefix}-view-side`),
        'top': document.getElementById(`${modelPrefix}-view-top`),
        'isometric': document.getElementById(`${modelPrefix}-view-isometric`)
    };
    
    for (const [view, button] of Object.entries(viewButtons)) {
        if (button) {
            button.addEventListener('click', function() {
                // Remove active class from all view buttons
                Object.values(viewButtons).forEach(btn => {
                    if (btn) btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Set camera angle
                modelController.setCameraAngle(view);
            });
        }
    }
    
    // Rotation speed control
    const speedControl = document.getElementById(`${modelPrefix}-speed-control`);
    if (speedControl) {
        speedControl.addEventListener('input', function() {
            modelController.setRotationSpeed(this.value);
        });
    }
} 