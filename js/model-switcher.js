/**
 * model-switcher.js
 * Handles switching between different 3D models in a single viewer
 */

class ModelSwitcher {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modelController = null;
        this.currentModel = null;
        
        // Available models with their paths and metadata
        this.models = {
            'coke': {
                path: 'models/coke_can.glb',
                name: 'Coca-Cola',
                description: 'The iconic Coca-Cola can, recognized worldwide for its distinctive red design.',
                features: [
                    'Classic aluminum can design with iconic Coca-Cola branding',
                    'Distinctive red coloring recognized globally',
                    'Detailed aluminum texture and surface details',
                    'Authentic label with the signature Coca-Cola logo'
                ]
            },
            'sprite': {
                path: 'models/sprite_can.glb',
                name: 'Sprite',
                description: 'The refreshing lemon-lime soda with a clean, crisp taste in a vibrant blue-green can.',
                features: [
                    'Modern aluminum can design',
                    'Vibrant blue and green coloring symbolizing freshness',
                    'Dynamic label design with bubbles representing carbonation',
                    'Contemporary design with the Sprite logo'
                ]
            },
            'drpepper': {
                path: 'models/dr_pepper_can.glb',
                name: 'Dr Pepper',
                description: 'America\'s oldest major soft drink with a unique blend of 23 flavors in a classic maroon can.',
                features: [
                    'Classic aluminum can design',
                    'Rich maroon coloring representing the beverage\'s unique flavor',
                    'Standard 12 oz size with detailed surface texture',
                    'Historic label design with the famous Dr Pepper logo'
                ]
            }
        };
        
        // Available background colors
        this.backgroundColors = {
            '#f0f0f0': 'Light Grey',
            '#111111': 'Dark',
            'transparent': 'Transparent',
            '#87CEEB': 'Sky Blue',
            '#228B22': 'Forest Green',
            '#8B4513': 'Saddle Brown',
            '#4B0082': 'Indigo',
            '#FF6347': 'Tomato Red'
        };
        
        // Available lighting environments
        this.lightingEnvironments = [
            'studio',
            'outdoor',
            'warehouse',
            'sunset',
            'night'
        ];
        
        // Initialize controls
        this.initControls();
    }
    
    initControls() {
        // Get all tab buttons
        const tabButtons = document.querySelectorAll('.model-tab-btn');
        
        // Add click event to each tab button
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get model ID from button's data attribute
                const modelId = button.getAttribute('data-model');
                
                // Load the selected model
                this.loadModel(modelId);
                
                // Update model info
                this.updateModelInfo(modelId);
                
                // Update URL without reloading page
                this.updateURL(modelId);
            });
        });
        
        // Set up wireframe toggle
        const wireframeBtn = document.getElementById('wireframe-btn');
        if (wireframeBtn) {
            wireframeBtn.addEventListener('click', () => {
                if (this.modelController) {
                    const isWireframe = this.modelController.toggleWireframe();
                    wireframeBtn.innerHTML = isWireframe ? 
                        '<i class="fas fa-wind"></i> Normal View' : 
                        '<i class="fas fa-wind"></i> Wireframe View';
                }
            });
        }
        
        // Set up rotation toggle
        const rotateBtn = document.getElementById('rotate-btn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (this.modelController) {
                    const isRotating = this.modelController.toggleRotation();
                    rotateBtn.innerHTML = isRotating ? 
                        '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                        '<i class="fas fa-sync-alt"></i> Start Rotation';
                }
            });
        }
        
        // Set up speed control
        const speedControl = document.getElementById('speed-control');
        if (speedControl) {
            speedControl.addEventListener('input', () => {
                if (this.modelController) {
                    this.modelController.setRotationSpeed(speedControl.value);
                }
            });
        }
        
        // Set up animation controls
        this.setupAnimationControls();
        
        // Set up background color controls
        this.setupBackgroundControls();
        
        // Set up lighting environment controls
        this.setupLightingControls();
    }
    
    setupAnimationControls() {
        // Open can animation
        const openCanBtn = document.getElementById('open-can-btn');
        if (openCanBtn) {
            openCanBtn.addEventListener('click', () => {
                if (this.modelController) {
                    const success = this.modelController.playOpenAnimation();
                    if (success) {
                        openCanBtn.classList.add('animation-active');
                        setTimeout(() => {
                            openCanBtn.classList.remove('animation-active');
                        }, 1500);
                    }
                }
            });
        }
        
        // Crush can animation
        const crushCanBtn = document.getElementById('crush-can-btn');
        if (crushCanBtn) {
            crushCanBtn.addEventListener('click', () => {
                if (this.modelController) {
                    const success = this.modelController.playCrushAnimation();
                    if (success) {
                        crushCanBtn.classList.add('animation-active');
                        setTimeout(() => {
                            crushCanBtn.classList.remove('animation-active');
                        }, 1500);
                    }
                }
            });
        }
        
        // Reset view
        const resetViewBtn = document.getElementById('reset-view-btn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                if (this.modelController) {
                    this.modelController.resetView();
                    
                    // Reset camera view buttons
                    const cameraButtons = document.querySelectorAll('.camera-btn');
                    cameraButtons.forEach(button => {
                        if (button.getAttribute('data-view') === 'front') {
                            button.classList.add('active');
                        } else {
                            button.classList.remove('active');
                        }
                    });
                }
            });
        }
    }
    
    setupBackgroundControls() {
        // Get the color grid container
        const colorGrid = document.querySelector('.color-grid');
        if (colorGrid) {
            // Clear existing colors
            colorGrid.innerHTML = '';
            
            // Add color swatches for each background color
            Object.entries(this.backgroundColors).forEach(([color, name]) => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.setAttribute('data-color', color);
                swatch.setAttribute('title', name);
                
                // If it's not transparent, set the background color
                if (color !== 'transparent') {
                    swatch.style.backgroundColor = color;
                } else {
                    swatch.classList.add('transparent');
                }
                
                // Add click event
                swatch.addEventListener('click', () => {
                    if (this.modelController) {
                        // Remove active class from all swatches
                        document.querySelectorAll('.color-swatch').forEach(sw => {
                            sw.classList.remove('active');
                        });
                        
                        // Add active class to clicked swatch
                        swatch.classList.add('active');
                        
                        // Set background color
                        this.modelController.setBackgroundColor(color);
                    }
                });
                
                colorGrid.appendChild(swatch);
            });
            
            // Set the first swatch as active by default
            const firstSwatch = colorGrid.querySelector('.color-swatch');
            if (firstSwatch) {
                firstSwatch.classList.add('active');
            }
        }
        
        // Setup custom color picker
        const customColorInput = document.getElementById('custom-bg-color');
        const applyCustomColorBtn = document.getElementById('apply-custom-bg');
        
        if (customColorInput && applyCustomColorBtn) {
            applyCustomColorBtn.addEventListener('click', () => {
                if (this.modelController) {
                    const customColor = customColorInput.value;
                    
                    // Remove active class from all swatches
                    document.querySelectorAll('.color-swatch').forEach(sw => {
                        sw.classList.remove('active');
                    });
                    
                    // Set background color
                    this.modelController.setBackgroundColor(customColor);
                    
                    // Show a temporary toast message
                    this.showToast(`Custom color applied`);
                }
            });
        }
    }
    
    setupLightingControls() {
        // Environment descriptions
        const environmentDescriptions = {
            'studio': 'Studio lighting provides neutral, evenly distributed light for clear visualization.',
            'outdoor': 'Natural outdoor lighting with blue sky tones and directional sunlight.',
            'warehouse': 'Industrial lighting with overhead fixtures creating interesting shadows.',
            'sunset': 'Warm golden-orange light with blue shadows, simulating a sunset environment.',
            'night': 'Low ambient lighting with moonlight and accent lights creating dramatic contrast.'
        };
        
        // Get the lighting environment dropdown and description element
        const lightingSelect = document.getElementById('hdri-environment');
        const descriptionElement = document.querySelector('.environment-description');
        
        if (lightingSelect) {
            // Clear existing options
            lightingSelect.innerHTML = '';
            
            // Add options for each lighting environment
            this.lightingEnvironments.forEach(env => {
                const option = document.createElement('option');
                option.value = env;
                option.textContent = env.charAt(0).toUpperCase() + env.slice(1) + ' Light';
                lightingSelect.appendChild(option);
            });
            
            // Add change event
            lightingSelect.addEventListener('change', () => {
                if (this.modelController) {
                    const selectedEnvironment = lightingSelect.value;
                    this.modelController.setEnvironment(selectedEnvironment);
                    
                    // Update environment description
                    if (descriptionElement && environmentDescriptions[selectedEnvironment]) {
                        descriptionElement.textContent = environmentDescriptions[selectedEnvironment];
                    }
                }
            });
        }
    }
    
    // Utility method to show toast messages
    showToast(message, duration = 3000) {
        // Create a toast element if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create a new toast
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">Notification</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        // Initialize and show the toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            delay: duration
        });
        toast.show();
        
        // Remove toast from DOM after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
    
    loadModel(modelId) {
        if (!this.models[modelId]) {
            console.error(`Model '${modelId}' not found in available models`);
            return;
        }
        
        // Show loading spinner
        const loader = this.container.querySelector('.model-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
        
        // Save current model ID
        this.currentModel = modelId;
        
        // Define the custom color - RGB(1, 146, 218)
        const customBlueColor = '#0192da';
        
        // Save current state if we have an existing model controller
        let previousState = null;
        if (this.modelController) {
            previousState = {
                isRotating: this.modelController.isRotating,
                rotationSpeed: this.modelController.rotationSpeed,
                wireframe: this.modelController.wireframe,
                lightingEnvironment: document.getElementById('bottom-lighting-environment')?.value || 'studio',
                lightingIntensity: document.getElementById('lighting-intensity-slider')?.value || 50,
                backgroundColor: customBlueColor, // Always use our custom blue color
                
                // Custom lighting state
                customLightColor: this.modelController.customLight ? 
                    '#' + this.modelController.customLight.color.getHexString() : '#ffffff',
                customLightDistance: this.modelController.customLight ? 
                    Math.sqrt(
                        Math.pow(this.modelController.customLight.position.x, 2) + 
                        Math.pow(this.modelController.customLight.position.z, 2)
                    ) : 5,
                customLightAngle: this.modelController.customLight ? 
                    (Math.atan2(
                        this.modelController.customLight.position.z, 
                        this.modelController.customLight.position.x
                    ) * 180 / Math.PI) : 45,
                isLightOscillating: this.modelController.isLightOscillating || false,
                isLightHelperVisible: this.modelController.customLightHelper != null,
                oscillationSpeed: this.modelController.lightOscillationSpeed || 0.02,
                spotlightAngle: this.modelController.customLight && this.modelController.customLight.angle ? 
                    (this.modelController.customLight.angle * 180 / Math.PI) : 30
            };
            
            // Remove the old canvas
            const oldCanvas = this.container.querySelector('canvas');
            if (oldCanvas) {
                this.container.removeChild(oldCanvas);
            }
        }
        
        // Create a new model controller with the selected model
        this.modelController = new ModelController('model-container', this.models[modelId].path);
        
        // Always set the background color to our custom blue color
        this.modelController.setBackgroundColor(customBlueColor);
        
        // Update color picker to show the selected color
        const colorPicker = document.getElementById('dynamic-bg-color');
        if (colorPicker) {
            colorPicker.value = customBlueColor;
        }
        
        // Update color swatches to show the active state
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });
        
        // Restore previous state if it exists
        if (previousState) {
            // Restore wireframe state
            if (previousState.wireframe) {
                this.modelController.toggleWireframe();
                
                // Update wireframe button
                const wireframeBtn = document.getElementById('wireframe-toggle');
                if (wireframeBtn) {
                    wireframeBtn.innerHTML = '<i class="fas fa-wind"></i> Normal View';
                    wireframeBtn.classList.add('active');
                }
            }
            
            // Restore rotation state
            if (previousState.isRotating) {
                this.modelController.toggleRotation();
                
                // Update rotation button
                const rotateBtn = document.getElementById('rotation-toggle');
                if (rotateBtn) {
                    rotateBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation';
                    rotateBtn.classList.add('active');
                }
            }
            
            // Restore rotation speed
            this.modelController.setRotationSpeed(previousState.rotationSpeed * 100 / 0.05); // Convert back to slider range (0-100)
            
            // Update slider value
            const rotationSpeedSlider = document.getElementById('rotation-speed-slider');
            if (rotationSpeedSlider) {
                // Convert from internal rotation speed to slider value (0-100)
                rotationSpeedSlider.value = Math.round((previousState.rotationSpeed / 0.05) * 100);
            }
            
            // Restore lighting environment
            this.modelController.setEnvironment(previousState.lightingEnvironment);
            
            // Update environment dropdown
            const environmentSelect = document.getElementById('bottom-lighting-environment');
            if (environmentSelect) {
                environmentSelect.value = previousState.lightingEnvironment;
            }
            
            // Restore lighting intensity
            this.modelController.setLightingIntensity(previousState.lightingIntensity);
            
            // Update intensity slider
            const lightingIntensitySlider = document.getElementById('lighting-intensity-slider');
            if (lightingIntensitySlider) {
                lightingIntensitySlider.value = previousState.lightingIntensity;
            }
            
            // Restore custom lighting state
            if (document.getElementById('lighting-gui-panel')) {
                // Add custom light
                this.modelController.addCustomLight();
                
                // Restore color
                this.modelController.setLightColor(previousState.customLightColor);
                const lightColorInput = document.getElementById('light-color');
                if (lightColorInput) {
                    lightColorInput.value = previousState.customLightColor;
                }
                
                // Restore distance
                this.modelController.setLightDistance(previousState.customLightDistance);
                const lightDistanceInput = document.getElementById('light-distance');
                const lightDistanceValue = document.getElementById('light-distance-value');
                if (lightDistanceInput) {
                    lightDistanceInput.value = previousState.customLightDistance;
                }
                if (lightDistanceValue) {
                    lightDistanceValue.textContent = previousState.customLightDistance;
                }
                
                // Restore angle
                this.modelController.setLightAngle(previousState.customLightAngle);
                const lightAngleInput = document.getElementById('light-angle');
                const lightAngleValue = document.getElementById('light-angle-value');
                if (lightAngleInput) {
                    lightAngleInput.value = previousState.customLightAngle;
                }
                if (lightAngleValue) {
                    lightAngleValue.textContent = previousState.customLightAngle + '°';
                }
                
                // Restore oscillation
                if (previousState.isLightOscillating) {
                    this.modelController.toggleLightOscillation();
                    const toggleOscillateBtn = document.getElementById('toggle-oscillate');
                    if (toggleOscillateBtn) {
                        toggleOscillateBtn.classList.add('active');
                        toggleOscillateBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Stop Oscillation';
                    }
                    
                    // Show oscillation speed slider
                    const oscillationSpeedContainer = document.getElementById('oscillation-speed-container');
                    if (oscillationSpeedContainer) {
                        oscillationSpeedContainer.style.display = 'block';
                    }
                    
                    // Restore oscillation speed
                    this.modelController.lightOscillationSpeed = previousState.oscillationSpeed;
                    
                    // Update oscillation speed slider
                    const oscillationSpeedSlider = document.getElementById('oscillation-speed');
                    const oscillationSpeedValue = document.getElementById('oscillation-speed-value');
                    if (oscillationSpeedSlider) {
                        // Convert from internal speed (0.01-0.1) to slider value (0-100)
                        const sliderValue = Math.round(((previousState.oscillationSpeed - 0.01) / 0.09) * 100);
                        oscillationSpeedSlider.value = sliderValue;
                        
                        if (oscillationSpeedValue) {
                            oscillationSpeedValue.textContent = sliderValue + '%';
                        }
                    }
                }
                
                // Restore helper
                if (previousState.isLightHelperVisible) {
                    this.modelController.toggleLightHelper();
                    const toggleHelperBtn = document.getElementById('toggle-light-helper');
                    if (toggleHelperBtn) {
                        toggleHelperBtn.classList.add('active');
                    }
                }
                
                // Restore spotlight angle
                if (this.modelController.customLight) {
                    // Convert from degrees to radians
                    this.modelController.customLight.angle = (previousState.spotlightAngle * Math.PI) / 180;
                    
                    // Update spotlight angle slider
                    const spotlightAngleSlider = document.getElementById('spotlight-angle');
                    const spotlightAngleValue = document.getElementById('spotlight-angle-value');
                    
                    if (spotlightAngleSlider) {
                        // Convert from degrees (10-60) to slider value (0-100)
                        const sliderValue = ((previousState.spotlightAngle - 10) / 50) * 100;
                        spotlightAngleSlider.value = sliderValue;
                        
                        if (spotlightAngleValue) {
                            spotlightAngleValue.textContent = Math.round(previousState.spotlightAngle) + '°';
                        }
                    }
                }
            }
        } else {
            // Default state for first load
            
            // Ensure animation states are properly reset
            const crushCanBtn = document.querySelector('.animation-control-buttons #crush-can-btn');
            if (crushCanBtn) {
                crushCanBtn.disabled = true;
            }
            
            // Ensure speed control is reset to default
            const speedControl = document.getElementById('rotation-speed-slider');
            if (speedControl) {
                speedControl.value = 50;
            }
            
            // Ensure environment is set to default
            const environmentSelect = document.getElementById('bottom-lighting-environment');
            if (environmentSelect) {
                environmentSelect.value = 'studio';
            }
        }
    }
    
    updateModelInfo(modelId) {
        if (!this.models[modelId]) return;
        
        // Update model title
        const modelTitle = document.getElementById('model-title');
        if (modelTitle) {
            modelTitle.textContent = this.models[modelId].name;
        }
        
        // Update model description
        const modelDescription = document.getElementById('model-description');
        if (modelDescription) {
            modelDescription.textContent = this.models[modelId].description;
        }
        
        // Update model features
        const modelFeatures = document.getElementById('model-features');
        if (modelFeatures) {
            // Clear existing features
            modelFeatures.innerHTML = '';
            
            // Add new features
            this.models[modelId].features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                modelFeatures.appendChild(li);
            });
        }
    }
    
    // Update URL with model query parameter without reloading page
    updateURL(modelId) {
        const url = new URL(window.location.href);
        url.searchParams.set('model', modelId);
        window.history.replaceState({}, '', url);
    }
    
    // Get model ID from URL query parameter
    getModelFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('model') || 'coke'; // Default to 'coke' if no parameter
    }
    
    // Initialize with the model specified in URL or default
    init() {
        // Setup background color grid
        this.setupBackgroundControls();
        
        // Setup lighting environment controls
        this.setupLightingControls();
        
        // Setup advanced options collapse
        this.setupAdvancedOptions();
        
        const defaultModelId = this.getModelFromURL();
        
        // Find the tab button for the default model and click it
        const defaultButton = document.querySelector(`.model-tab-btn[data-model="${defaultModelId}"]`);
        if (defaultButton) {
            defaultButton.click();
        } else {
            // If default button not found, load the model directly
            this.loadModel(defaultModelId);
            this.updateModelInfo(defaultModelId);
            this.updateURL(defaultModelId);
        }
    }
    
    setupAdvancedOptions() {
        // Get the collapsible elements
        const collapsibleHeadings = document.querySelectorAll('.section-title.collapsible');
        
        collapsibleHeadings.forEach(heading => {
            heading.addEventListener('click', () => {
                const iconElement = heading.querySelector('i');
                if (iconElement) {
                    // Toggle the chevron icon
                    if (iconElement.classList.contains('fa-chevron-down')) {
                        iconElement.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        iconElement.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                }
            });
        });
    }
    
    toggleFullscreen() {
        const modelContainer = document.getElementById('model-container');
        
        if (!modelContainer) return;
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (modelContainer.requestFullscreen) {
                modelContainer.requestFullscreen();
            } else if (modelContainer.webkitRequestFullscreen) { /* Safari */
                modelContainer.webkitRequestFullscreen();
            } else if (modelContainer.msRequestFullscreen) { /* IE11 */
                modelContainer.msRequestFullscreen();
            }
            
            // Update icon
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            
            // Update icon
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.setAttribute('title', 'Toggle Fullscreen');
            }
        }
    }
    
    resetAllSettings() {
        if (!this.modelController) return;
        
        // Set background color to the Fizz Blue color
        const fizzBlueColor = '#0192da'; // RGB(1, 146, 218)
        this.modelController.setBackgroundColor(fizzBlueColor);
        
        // Update color swatches to show the Fizz Blue color as active
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if(swatch.getAttribute('data-color') === fizzBlueColor) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
        
        // Update color picker to show the Fizz Blue color
        const colorPicker = document.getElementById('dynamic-bg-color');
        if (colorPicker) {
            colorPicker.value = fizzBlueColor;
        }
        
        // Reset lighting environment to default
        this.modelController.setEnvironment('studio');
        
        // Reset wireframe mode
        if (this.modelController.wireframe) {
            this.modelController.toggleWireframe();
        }
        
        // Reset rotation
        if (this.modelController.isRotating) {
            this.modelController.toggleRotation();
        }
        
        // Reset rotation speed
        this.modelController.setRotationSpeed(50);
        
        // Reset lighting intensity
        this.modelController.setLightingIntensity(50);
        
        // Reset custom lighting if it exists
        if (this.modelController.customLight) {
            // Reset color to white
            this.modelController.setLightColor('#ffffff');
            const lightColorInput = document.getElementById('light-color');
            if (lightColorInput) {
                lightColorInput.value = '#ffffff';
            }
            
            // Reset distance to 5
            this.modelController.setLightDistance(5);
            const lightDistanceInput = document.getElementById('light-distance');
            const lightDistanceValue = document.getElementById('light-distance-value');
            if (lightDistanceInput) {
                lightDistanceInput.value = 5;
            }
            if (lightDistanceValue) {
                lightDistanceValue.textContent = '5';
            }
            
            // Reset angle to 45 degrees
            this.modelController.setLightAngle(45);
            const lightAngleInput = document.getElementById('light-angle');
            const lightAngleValue = document.getElementById('light-angle-value');
            if (lightAngleInput) {
                lightAngleInput.value = 45;
            }
            if (lightAngleValue) {
                lightAngleValue.textContent = '45°';
            }
            
            // Reset oscillation speed to 50%
            this.modelController.setOscillationSpeed(50);
            const oscillationSpeedInput = document.getElementById('oscillation-speed');
            const oscillationSpeedValue = document.getElementById('oscillation-speed-value');
            if (oscillationSpeedInput) {
                oscillationSpeedInput.value = 50;
            }
            if (oscillationSpeedValue) {
                oscillationSpeedValue.textContent = '50%';
            }
            
            // Reset spotlight angle to 10 degrees (20% on slider)
            this.modelController.setSpotlightAngle(20);
            const spotlightAngleInput = document.getElementById('spotlight-angle');
            const spotlightAngleValue = document.getElementById('spotlight-angle-value');
            if (spotlightAngleInput) {
                spotlightAngleInput.value = 20;
            }
            if (spotlightAngleValue) {
                spotlightAngleValue.textContent = '10°';
            }
            
            // Stop oscillation if it's on
            if (this.modelController.isLightOscillating) {
                this.modelController.toggleLightOscillation();
                const toggleOscillateBtn = document.getElementById('toggle-oscillate');
                if (toggleOscillateBtn) {
                    toggleOscillateBtn.classList.remove('active');
                    toggleOscillateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Oscillate Light';
                }
                
                // Hide oscillation speed slider
                const oscillationSpeedContainer = document.getElementById('oscillation-speed-container');
                if (oscillationSpeedContainer) {
                    oscillationSpeedContainer.style.display = 'none';
                }
            }
            
            // Remove helper if it's visible
            if (this.modelController.customLightHelper) {
                this.modelController.toggleLightHelper();
                const toggleHelperBtn = document.getElementById('toggle-light-helper');
                if (toggleHelperBtn) {
                    toggleHelperBtn.classList.remove('active');
                }
            }
        }
        
        // Provide feedback to the user
        this.showToast('All settings have been reset to defaults');
        
        return true;
    }
} 