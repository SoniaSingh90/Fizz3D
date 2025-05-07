/**
 * model-interactions.js
 * Handles interactions with model control buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    // Reference to the ModelSwitcher instance
    let modelSwitcher = null;
    
    // Wait for ModelSwitcher to be initialized
    setTimeout(function() {
        // Try to find the ModelSwitcher instance
        if (window.modelSwitcher) {
            modelSwitcher = window.modelSwitcher;
            setupModelInteractions();
            setupLightingGUI();
        }
    }, 500);
    
    function setupModelInteractions() {
        // Connect the bottom panel buttons to functionality
        setupBottomPanelControls();
        
        // Enable all animation buttons by default
        const crushCanBtn = document.getElementById('crush-can-btn');
        if (crushCanBtn) {
            crushCanBtn.disabled = false;
        }
        
        // Enable fullscreen crush button if it exists
        const fullscreenCrushBtn = document.getElementById('fullscreen-crush-can-btn');
        if (fullscreenCrushBtn) {
            fullscreenCrushBtn.disabled = false;
        }
        
        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                const modelContainer = document.getElementById('model-container');
                
                if (!document.fullscreenElement) {
                    // Enter fullscreen
                    if (modelContainer.requestFullscreen) {
                        modelContainer.requestFullscreen();
                    } else if (modelContainer.webkitRequestFullscreen) { /* Safari */
                        modelContainer.webkitRequestFullscreen();
                    } else if (modelContainer.msRequestFullscreen) { /* IE11 */
                        modelContainer.msRequestFullscreen();
                    }
                    
                    // Setup fullscreen controls
                    setupFullscreenControls(modelContainer);
                    
                    // Handle lighting GUI in fullscreen
                    const lightingPanel = document.getElementById('lighting-gui-panel');
                    if (lightingPanel) {
                        lightingPanel.classList.add('fullscreen-lighting-panel');
                    }
                    
                    // Update icon
                    this.innerHTML = '<i class="fas fa-compress"></i>';
                    this.setAttribute('title', 'Exit Fullscreen');
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
                    this.innerHTML = '<i class="fas fa-expand"></i>';
                    this.setAttribute('title', 'Toggle Fullscreen');
                    
                    // Remove fullscreen controls
                    const fullscreenControls = document.getElementById('fullscreen-controls');
                    if (fullscreenControls) {
                        fullscreenControls.remove();
                    }
                    
                    // Handle lighting GUI exiting fullscreen
                    const lightingPanel = document.getElementById('lighting-gui-panel');
                    if (lightingPanel) {
                        lightingPanel.classList.remove('fullscreen-lighting-panel');
                        
                        // Hide the panel when exiting fullscreen
                        lightingPanel.style.display = 'none';
                    }
                }
            });
            
            // Listen for fullscreen change events
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) {
                    // Update icon when exiting fullscreen
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    fullscreenBtn.setAttribute('title', 'Toggle Fullscreen');
                    
                    // Remove fullscreen controls
                    const fullscreenControls = document.getElementById('fullscreen-controls');
                    if (fullscreenControls) {
                        fullscreenControls.remove();
                    }
                    
                    // Handle lighting GUI exiting fullscreen
                    const lightingPanel = document.getElementById('lighting-gui-panel');
                    if (lightingPanel) {
                        lightingPanel.classList.remove('fullscreen-lighting-panel');
                        
                        // Hide the panel when exiting fullscreen
                        lightingPanel.style.display = 'none';
                    }
                }
            });
        }
    }
    
    // Create and setup controls for fullscreen mode
    function setupFullscreenControls(container) {
        // Create a cloned controls panel for fullscreen mode
        const originalControls = document.querySelector('.model-interaction-panel');
        if (!originalControls) return;
        
        // Check if fullscreen controls already exist and remove them
        const existingControls = document.getElementById('fullscreen-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Create container for fullscreen controls
        const fullscreenControls = document.createElement('div');
        fullscreenControls.id = 'fullscreen-controls';
        fullscreenControls.className = 'fullscreen-controls';
        fullscreenControls.innerHTML = `
            <div class="fullscreen-controls-header">
                <button class="btn btn-sm btn-light minimize-controls">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <span>Controls</span>
            </div>
            <div class="fullscreen-controls-body">
                ${originalControls.innerHTML}
            </div>
        `;
        
        // Add styles for fullscreen controls
        const style = document.createElement('style');
        style.textContent = `
            .fullscreen-controls {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background-color: rgba(33, 37, 41, 0.7);
                border-radius: 8px;
                color: white;
                z-index: 1000;
                max-width: 800px;
                margin: 0 auto;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease;
            }
            
            .fullscreen-controls.minimized {
                transform: translateY(calc(100% - 38px));
            }
            
            .fullscreen-controls-header {
                padding: 8px 16px;
                display: flex;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                cursor: pointer;
            }
            
            .fullscreen-controls-header span {
                margin-left: 10px;
                font-weight: 500;
            }
            
            .fullscreen-controls-body {
                padding: 16px;
            }
            
            .fullscreen-controls .btn-light {
                background-color: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .fullscreen-controls .btn-light:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }
            
            .fullscreen-controls .btn-primary {
                background-color: rgba(13, 110, 253, 0.8);
            }
            
            .fullscreen-controls .btn-success {
                background-color: rgba(25, 135, 84, 0.8);
            }
            
            .fullscreen-controls .btn-danger {
                background-color: rgba(220, 53, 69, 0.8);
            }
            
            .fullscreen-controls .text-muted {
                color: rgba(255, 255, 255, 0.6) !important;
            }
            
            .fullscreen-controls .form-select, 
            .fullscreen-controls .form-range {
                background-color: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .fullscreen-controls .color-swatch {
                flex: 1;
                height: 30px;
                border-radius: 4px;
                cursor: pointer;
                border: 2px solid transparent;
            }
            
            .fullscreen-controls .color-swatch.active {
                border: 2px solid #fff;
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.8);
            }
            
            .fullscreen-controls .color-swatch.transparent {
                background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                linear-gradient(-45deg, transparent 75%, #ccc 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
            }
        `;
        
        container.appendChild(style);
        container.appendChild(fullscreenControls);
        
        // Make the Fizz Blue color swatch active
        const fullscreenColorSwatches = fullscreenControls.querySelectorAll('.color-swatch');
        fullscreenColorSwatches.forEach(swatch => {
            if(swatch.getAttribute('data-color') === '#0192da') {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
        
        // Set the color picker initial value
        const fullscreenColorPicker = fullscreenControls.querySelector('#dynamic-bg-color');
        if (fullscreenColorPicker) {
            fullscreenColorPicker.value = '#0192da';  // Set to the Fizz Blue color
        }
        
        // Toggle minimize/maximize
        const header = fullscreenControls.querySelector('.fullscreen-controls-header');
        const minimizeBtn = fullscreenControls.querySelector('.minimize-controls');
        
        header.addEventListener('click', function(e) {
            if (e.target !== minimizeBtn && e.target !== minimizeBtn.querySelector('i')) {
                fullscreenControls.classList.toggle('minimized');
                const icon = minimizeBtn.querySelector('i');
                if (fullscreenControls.classList.contains('minimized')) {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            }
        });
        
        minimizeBtn.addEventListener('click', function() {
            fullscreenControls.classList.toggle('minimized');
            const icon = this.querySelector('i');
            if (fullscreenControls.classList.contains('minimized')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });
        
        // Set up event handlers for the cloned controls
        setupClonedControlEvents(fullscreenControls);
    }
    
    // Set up event handlers for the cloned controls in fullscreen mode
    function setupClonedControlEvents(fullscreenControls) {
        // Wireframe toggle
        const wireframeToggle = fullscreenControls.querySelector('#wireframe-toggle');
        if (wireframeToggle) {
            wireframeToggle.id = 'fullscreen-wireframe-toggle';
            wireframeToggle.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    const isWireframe = modelSwitcher.modelController.toggleWireframe();
                    
                    // Update both buttons
                    this.innerHTML = isWireframe ? 
                        '<i class="fas fa-wind"></i> Normal View' : 
                        '<i class="fas fa-wind"></i> Wireframe View';
                    this.classList.toggle('active');
                    
                    const mainWireframeBtn = document.getElementById('wireframe-toggle');
                    if (mainWireframeBtn) {
                        mainWireframeBtn.innerHTML = this.innerHTML;
                        mainWireframeBtn.classList.toggle('active', this.classList.contains('active'));
                    }
                }
            });
        }
        
        // Rotation toggle
        const rotationToggle = fullscreenControls.querySelector('#rotation-toggle');
        if (rotationToggle) {
            rotationToggle.id = 'fullscreen-rotation-toggle';
            rotationToggle.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    const isRotating = modelSwitcher.modelController.toggleRotation();
                    
                    // Update both buttons
                    this.innerHTML = isRotating ? 
                        '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                        '<i class="fas fa-sync-alt"></i> Start Rotation';
                    this.classList.toggle('active');
                    
                    const mainRotationBtn = document.getElementById('rotation-toggle');
                    if (mainRotationBtn) {
                        mainRotationBtn.innerHTML = this.innerHTML;
                        mainRotationBtn.classList.toggle('active', this.classList.contains('active'));
                    }
                }
            });
        }
        
        // Reset button
        const resetAllBtn = fullscreenControls.querySelector('#reset-all');
        if (resetAllBtn) {
            resetAllBtn.id = 'fullscreen-reset-all';
            resetAllBtn.addEventListener('click', function() {
                if (modelSwitcher) {
                    performFullReset();
                }
            });
        }
        
        // Rotation speed slider
        const rotationSpeedSlider = fullscreenControls.querySelector('#rotation-speed-slider');
        if (rotationSpeedSlider) {
            rotationSpeedSlider.id = 'fullscreen-rotation-speed-slider';
            rotationSpeedSlider.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setRotationSpeed(this.value);
                    
                    // Sync with main slider
                    const mainSlider = document.getElementById('rotation-speed-slider');
                    if (mainSlider) {
                        mainSlider.value = this.value;
                    }
                }
            });
        }
        
        // Lighting environment dropdown
        const lightingDropdown = fullscreenControls.querySelector('#bottom-lighting-environment');
        if (lightingDropdown) {
            lightingDropdown.id = 'fullscreen-lighting-environment';
            lightingDropdown.addEventListener('change', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setEnvironment(this.value);
                    
                    // Sync with main dropdown
                    const mainDropdown = document.getElementById('bottom-lighting-environment');
                    if (mainDropdown) {
                        mainDropdown.value = this.value;
                    }
                }
            });
        }
        
        // Lighting intensity slider
        const lightingIntensitySlider = fullscreenControls.querySelector('#lighting-intensity-slider');
        if (lightingIntensitySlider) {
            lightingIntensitySlider.id = 'fullscreen-lighting-intensity-slider';
            lightingIntensitySlider.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setLightingIntensity(this.value);
                    
                    // Sync with main slider
                    const mainSlider = document.getElementById('lighting-intensity-slider');
                    if (mainSlider) {
                        mainSlider.value = this.value;
                    }
                }
            });
        }
        
        // Color swatches
        const colorSwatches = fullscreenControls.querySelectorAll('.background-controls .color-swatch');
        colorSwatches.forEach((swatch, index) => {
            swatch.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setBackgroundColor(color);
                    
                    // Update active states in both places
                    colorSwatches.forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                    
                    const mainSwatches = document.querySelectorAll('.model-interaction-panel .color-swatch');
                    mainSwatches.forEach((s, i) => {
                        if (i === index) {
                            s.classList.add('active');
                        } else {
                            s.classList.remove('active');
                        }
                    });
                    
                    // Update color picker to match if it's not transparent
                    if (color !== 'transparent') {
                        document.getElementById('dynamic-bg-color').value = color;
                        const fullscreenColorPicker = fullscreenControls.querySelector('#dynamic-bg-color');
                        if (fullscreenColorPicker) {
                            fullscreenColorPicker.value = color;
                        }
                    }
                }
            });
        });
        
        // Dynamic color picker
        const dynamicBgColor = fullscreenControls.querySelector('#dynamic-bg-color');
        if (dynamicBgColor) {
            dynamicBgColor.id = 'fullscreen-dynamic-bg-color';
            dynamicBgColor.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setBackgroundColor(this.value);
                    
                    // Remove active class from all swatches in both UIs
                    colorSwatches.forEach(s => s.classList.remove('active'));
                    
                    const mainSwatches = document.querySelectorAll('.model-interaction-panel .color-swatch');
                    mainSwatches.forEach(s => s.classList.remove('active'));
                    
                    // Sync with main color picker
                    const mainColorPicker = document.getElementById('dynamic-bg-color');
                    if (mainColorPicker) {
                        mainColorPicker.value = this.value;
                    }
                }
            });
        }
        
        // Camera angle buttons
        const cameraAngleBtns = fullscreenControls.querySelectorAll('.camera-angle-btn');
        cameraAngleBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const viewType = this.getAttribute('data-view');
                
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setCameraAngle(viewType);
                    
                    // Update both sets of buttons
                    cameraAngleBtns.forEach(b => {
                        b.classList.remove('active', 'btn-primary');
                        b.classList.add('btn-light');
                    });
                    
                    this.classList.add('active', 'btn-primary');
                    this.classList.remove('btn-light');
                    
                    const mainCameraBtns = document.querySelectorAll('.model-interaction-panel .camera-angle-btn');
                    mainCameraBtns.forEach((b, i) => {
                        b.classList.remove('active', 'btn-primary');
                        b.classList.add('btn-light');
                        
                        if (i === index) {
                            b.classList.add('active', 'btn-primary');
                            b.classList.remove('btn-light');
                        }
                    });
                }
            });
        });
        
        // Animation buttons
        const openCanBtn = fullscreenControls.querySelector('#open-can-btn');
        if (openCanBtn) {
            openCanBtn.id = 'fullscreen-open-can-btn';
            openCanBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    const success = modelSwitcher.modelController.playOpenAnimation();
                    
                    if (success) {
                        // Enable crush button when can is open
                        const fullscreenCrushBtn = fullscreenControls.querySelector('#crush-can-btn');
                        if (fullscreenCrushBtn) {
                            fullscreenCrushBtn.disabled = false;
                        }
                        
                        // Also enable main crush button
                        const mainCrushBtn = document.querySelector('.model-interaction-panel #crush-can-btn');
                        if (mainCrushBtn) {
                            mainCrushBtn.disabled = false;
                        }
                    }
                }
            });
        }
        
        // Crush button
        const crushCanBtn = fullscreenControls.querySelector('#crush-can-btn');
        if (crushCanBtn) {
            crushCanBtn.id = 'fullscreen-crush-can-btn';
            crushCanBtn.disabled = false;
            crushCanBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.playCrushAnimation();
                }
            });
        }
    }
    
    // Setup the bottom panel controls
    function setupBottomPanelControls() {
        // Wireframe View button in bottom panel
        const wireframeViewBtn = document.getElementById('wireframe-toggle');
        if (wireframeViewBtn) {
            wireframeViewBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    const isWireframe = modelSwitcher.modelController.toggleWireframe();
                    // Update button text based on state
                    this.innerHTML = isWireframe ? 
                        '<i class="fas fa-wind"></i> Normal View' : 
                        '<i class="fas fa-wind"></i> Wireframe View';
                    this.classList.toggle('active');
                }
            });
        }
        
        // Start Rotation button in bottom panel
        const startRotationBtn = document.getElementById('rotation-toggle');
        if (startRotationBtn) {
            startRotationBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    const isRotating = modelSwitcher.modelController.toggleRotation();
                    // Update button text based on state
                    this.innerHTML = isRotating ? 
                        '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                        '<i class="fas fa-sync-alt"></i> Start Rotation';
                    this.classList.toggle('active');
                }
            });
        }
        
        // Reset button in bottom panel
        const resetAllSettingsBtn = document.getElementById('reset-all');
        if (resetAllSettingsBtn) {
            resetAllSettingsBtn.addEventListener('click', function() {
                if (modelSwitcher) {
                    // Reset everything
                    performFullReset();
                }
            });
        }
        
        // Rotation speed slider in bottom panel
        const rotationSpeedSlider = document.getElementById('rotation-speed-slider');
        if (rotationSpeedSlider) {
            rotationSpeedSlider.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setRotationSpeed(this.value);
                }
            });
        }
        
        // Lighting intensity slider in bottom panel
        const lightingIntensitySlider = document.getElementById('lighting-intensity-slider');
        if (lightingIntensitySlider) {
            lightingIntensitySlider.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setLightingIntensity(this.value);
                    
                    // Also update the modal slider if it exists
                    const modalSlider = document.getElementById('lighting-intensity-control');
                    if (modalSlider) {
                        modalSlider.value = this.value;
                    }
                }
            });
        }
        
        // Bottom panel lighting environment dropdown
        const bottomLightingEnvironment = document.getElementById('bottom-lighting-environment');
        if (bottomLightingEnvironment) {
            bottomLightingEnvironment.addEventListener('change', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setEnvironment(this.value);
                    
                    // Also update the modal dropdown if it exists
                    const modalDropdown = document.getElementById('lighting-environment');
                    if (modalDropdown) {
                        modalDropdown.value = this.value;
                    }
                }
            });
        }
        
        // Background color swatches in bottom panel
        const colorSwatches = document.querySelectorAll('.background-controls .color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setBackgroundColor(color);
                    
                    // Update active state
                    colorSwatches.forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update color picker to match if it's not transparent
                    if (color !== 'transparent') {
                        document.getElementById('dynamic-bg-color').value = color;
                    }
                }
            });
        });
        
        // Dynamic color picker in bottom panel
        const dynamicBgColor = document.getElementById('dynamic-bg-color');
        if (dynamicBgColor) {
            dynamicBgColor.addEventListener('input', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setBackgroundColor(this.value);
                    
                    // Remove active class from other swatches
                    colorSwatches.forEach(s => s.classList.remove('active'));
                }
            });
        }
        
        // Camera angle buttons in bottom panel
        const cameraAngleBtns = document.querySelectorAll('.camera-angle-btn');
        cameraAngleBtns.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all camera buttons
                cameraAngleBtns.forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-light');
                });
                
                // Add active class to the clicked button
                this.classList.add('active');
                this.classList.remove('btn-light');
                this.classList.add('btn-primary');
                
                // Get the view type from data-view attribute
                const viewType = this.getAttribute('data-view');
                
                // Set camera angle if ModelSwitcher is available
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setCameraAngle(viewType);
                }
            });
        });
        
        // Bottom Panel: Open Can button
        const openCanBottomBtn = document.querySelector('.animation-control-buttons #open-can-btn');
        if (openCanBottomBtn) {
            openCanBottomBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    // Play open animation
                    const success = modelSwitcher.modelController.playOpenAnimation();
                    
                    if (success) {
                        // Enable crush button when can is open
                        const crushCanBottomBtn = document.querySelector('.animation-control-buttons #crush-can-btn');
                        if (crushCanBottomBtn) {
                            crushCanBottomBtn.disabled = false;
                        }
                    }
                }
            });
        }
        
        // Bottom Panel: Crush Can button
        const crushCanBottomBtn = document.querySelector('.animation-control-buttons #crush-can-btn');
        if (crushCanBottomBtn) {
            crushCanBottomBtn.addEventListener('click', function() {
                if (modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.playCrushAnimation();
                }
            });
        }
        
        // Direct bottom actions for Front, Top, Side, 3D views
        document.querySelectorAll('.camera-control-buttons .btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                if (view && modelSwitcher && modelSwitcher.modelController) {
                    modelSwitcher.modelController.setCameraAngle(view);
                }
            });
        });
    }
    
    // Centralizing reset functionality 
    function performFullReset() {
        if (!modelSwitcher || !modelSwitcher.modelController) return;
        
        // Check if model is crushed (need to force reset)
        const isCrushed = modelSwitcher.modelController.modelCrushed;
        
        // Force reset view (camera position and model state)
        modelSwitcher.modelController.resetView(true);
        
        // If model was crushed, show message
        if (isCrushed) {
            console.log('Forced reset of crushed model');
            
            // Show toast message if available
            if (modelSwitcher.showToast) {
                modelSwitcher.showToast('Model has been reset to its original state');
            }
        }
        
        // Reset model state and settings
        if (modelSwitcher.resetAllSettings) {
            modelSwitcher.resetAllSettings();
        }
        
        // Update UI to reflect reset state
        resetUIElements();
    }
    
    function resetUIElements() {
        // Reset bottom panel UI elements
        const wireframeToggle = document.getElementById('wireframe-toggle');
        if (wireframeToggle) {
            wireframeToggle.innerHTML = '<i class="fas fa-wind"></i> Wireframe View';
            wireframeToggle.classList.remove('active');
        }
        
        const rotationToggle = document.getElementById('rotation-toggle');
        if (rotationToggle) {
            rotationToggle.innerHTML = '<i class="fas fa-sync-alt"></i> Start Rotation';
            rotationToggle.classList.remove('active');
        }
        
        const rotationSpeedSlider = document.getElementById('rotation-speed-slider');
        if (rotationSpeedSlider) {
            rotationSpeedSlider.value = 50;
        }
        
        const lightingIntensitySlider = document.getElementById('lighting-intensity-slider');
        if (lightingIntensitySlider) {
            lightingIntensitySlider.value = 50;
        }
        
        // Reset background color swatches in main panel
        const colorSwatches = document.querySelectorAll('.background-controls .color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.classList.remove('active');
            if (swatch.getAttribute('data-color') === '#f0f0f0') {
                swatch.classList.add('active');
            }
        });
        
        // Reset color picker in main panel
        const dynamicBgColor = document.getElementById('dynamic-bg-color');
        if (dynamicBgColor) {
            dynamicBgColor.value = '#f0f0f0';
        }
        
        // Reset bottom lighting environment dropdown
        const bottomLightingEnvironment = document.getElementById('bottom-lighting-environment');
        if (bottomLightingEnvironment) {
            bottomLightingEnvironment.value = 'studio';
        }
        
        // Keep crush can button enabled
        const bottomCrushCanBtn = document.querySelector('.animation-control-buttons #crush-can-btn');
        if (bottomCrushCanBtn) {
            bottomCrushCanBtn.disabled = false;
        }
        
        // Reset camera buttons
        resetCameraButtons();
    }
    
    function resetCameraButtons() {
        // Reset camera buttons in bottom panel
        const bottomCameraButtons = document.querySelectorAll('.camera-angle-btn');
        bottomCameraButtons.forEach(btn => {
            const isDefault = btn.getAttribute('data-view') === 'front';
            
            // Remove active classes
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-light');
            
            // Set front view as active
            if (isDefault) {
                btn.classList.add('active');
                btn.classList.remove('btn-light');
                btn.classList.add('btn-primary');
            }
        });
    }

    // Setup lighting GUI
    function setupLightingGUI() {
        const lightingBtn = document.getElementById('lighting-gui-btn');
        if (!lightingBtn) return;
        
        // Create lighting GUI panel
        const lightingPanel = document.createElement('div');
        lightingPanel.id = 'lighting-gui-panel';
        lightingPanel.className = 'lighting-gui-panel';
        
        lightingPanel.innerHTML = `
            <div class="lighting-gui-header">
                <h6>Lighting Configuration</h6>
                <button class="btn btn-sm btn-close close-lighting-panel"></button>
            </div>
            <div class="lighting-gui-body">
                <div class="form-group mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="toggle-custom-light">
                        <label class="form-check-label" for="toggle-custom-light">Enable Custom Light</label>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label for="light-color" class="form-label">Light Color</label>
                    <input type="color" id="light-color" class="form-control form-control-color" value="#ffffff">
                </div>
                <div class="form-group mb-3">
                    <label for="light-distance" class="form-label">Light Distance <span id="light-distance-value">2</span></label>
                    <input type="range" id="light-distance" class="form-range" min="1" max="10" value="2">
                </div>
                <div class="form-group mb-3">
                    <label for="light-angle" class="form-label">Light Angle <span id="light-angle-value">0°</span></label>
                    <input type="range" id="light-angle" class="form-range" min="0" max="360" value="0">
                </div>
                <div class="form-group mb-3">
                    <label for="spotlight-angle" class="form-label">Spotlight Cone <span id="spotlight-angle-value">10°</span></label>
                    <input type="range" id="spotlight-angle" class="form-range" min="0" max="100" value="20">
                </div>
                <div class="form-group mb-3">
                    <div class="d-flex justify-content-between">
                        <button id="toggle-oscillate" class="btn btn-sm btn-outline-primary" style="width: 48%;">
                            <i class="fas fa-sync-alt"></i> Oscillate Light
                        </button>
                        <button id="toggle-light-helper" class="btn btn-sm btn-outline-secondary" style="width: 48%;">
                            <i class="fas fa-vector-square"></i> Show Helper
                        </button>
                    </div>
                </div>
                <div id="oscillation-speed-container" class="form-group mb-3" style="display: none;">
                    <label for="oscillation-speed" class="form-label">Oscillation Speed <span id="oscillation-speed-value">50%</span></label>
                    <input type="range" id="oscillation-speed" class="form-range" min="0" max="100" value="50">
                </div>
            </div>
        `;
        
        // Add CSS for the lighting GUI
        const style = document.createElement('style');
        style.textContent = `
            .lighting-gui-btn {
                position: absolute;
                bottom: 60px;
                right: 10px;
                z-index: 100;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }
            
            .lighting-gui-btn:hover {
                transform: scale(1.1);
            }
            
            .lighting-gui-panel {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 280px;
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 101;
                display: none;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .lighting-gui-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .lighting-gui-header h6 {
                margin: 0;
                font-weight: 600;
            }
            
            .lighting-gui-body {
                padding: 15px;
            }
            
            body.dark-mode .lighting-gui-panel {
                background-color: rgba(33, 37, 41, 0.95);
                color: white;
            }
            
            body.dark-mode .lighting-gui-header {
                border-bottom-color: rgba(255, 255, 255, 0.1);
            }
            
            body.dark-mode .form-label {
                color: rgba(255, 255, 255, 0.85);
            }
            
            body.dark-mode .btn-close {
                filter: invert(1);
            }
            
            .fullscreen-lighting-panel,
            .model-container:fullscreen .lighting-gui-panel,
            .model-container:-webkit-full-screen .lighting-gui-panel,
            .model-container:-moz-full-screen .lighting-gui-panel {
                background-color: rgba(33, 37, 41, 0.85);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .fullscreen-lighting-panel .form-label,
            .model-container:fullscreen .lighting-gui-panel .form-label,
            .model-container:-webkit-full-screen .lighting-gui-panel .form-label,
            .model-container:-moz-full-screen .lighting-gui-panel .form-label {
                color: rgba(255, 255, 255, 0.85);
            }
            
            .fullscreen-lighting-panel .btn-close,
            .model-container:fullscreen .lighting-gui-panel .btn-close,
            .model-container:-webkit-full-screen .lighting-gui-panel .btn-close,
            .model-container:-moz-full-screen .lighting-gui-panel .btn-close {
                filter: invert(1);
            }
            
            .fullscreen-lighting-panel .btn-outline-primary,
            .model-container:fullscreen .lighting-gui-panel .btn-outline-primary,
            .model-container:-webkit-full-screen .lighting-gui-panel .btn-outline-primary,
            .model-container:-moz-full-screen .lighting-gui-panel .btn-outline-primary {
                color: #ffffff;
                border-color: rgba(13, 110, 253, 0.5);
            }
            
            .fullscreen-lighting-panel .btn-outline-secondary,
            .model-container:fullscreen .lighting-gui-panel .btn-outline-secondary,
            .model-container:-webkit-full-screen .lighting-gui-panel .btn-outline-secondary,
            .model-container:-moz-full-screen .lighting-gui-panel .btn-outline-secondary {
                color: #ffffff;
                border-color: rgba(108, 117, 125, 0.5);
            }
            
            .fullscreen-lighting-panel .btn-outline-primary:hover,
            .model-container:fullscreen .lighting-gui-panel .btn-outline-primary:hover,
            .model-container:-webkit-full-screen .lighting-gui-panel .btn-outline-primary:hover,
            .model-container:-moz-full-screen .lighting-gui-panel .btn-outline-primary:hover {
                background-color: rgba(13, 110, 253, 0.2);
            }
            
            .fullscreen-lighting-panel .btn-outline-secondary:hover,
            .model-container:fullscreen .lighting-gui-panel .btn-outline-secondary:hover,
            .model-container:-webkit-full-screen .lighting-gui-panel .btn-outline-secondary:hover,
            .model-container:-moz-full-screen .lighting-gui-panel .btn-outline-secondary:hover {
                background-color: rgba(108, 117, 125, 0.2);
            }
            
            .fullscreen-lighting-panel .active,
            .model-container:fullscreen .lighting-gui-panel .active,
            .model-container:-webkit-full-screen .lighting-gui-panel .active,
            .model-container:-moz-full-screen .lighting-gui-panel .active {
                background-color: rgba(255, 255, 255, 0.2);
                color: #ffffff;
            }
        `;
        
        // Add to DOM
        document.head.appendChild(style);
        document.getElementById('model-container').appendChild(lightingPanel);
        
        // Toggle panel visibility
        lightingBtn.addEventListener('click', function() {
            const panel = document.getElementById('lighting-gui-panel');
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
            } else {
                panel.style.display = 'block';
            }
        });
        
        // Close panel button
        const closeBtn = lightingPanel.querySelector('.close-lighting-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                lightingPanel.style.display = 'none';
            });
        }
        
        // Setup lighting controls
        setupLightingControls();
    }

    function setupLightingControls() {
        if (!modelSwitcher || !modelSwitcher.modelController) return;
        
        // Get control elements
        const lightColor = document.getElementById('light-color');
        const lightDistance = document.getElementById('light-distance');
        const lightAngle = document.getElementById('light-angle');
        const lightDistanceValue = document.getElementById('light-distance-value');
        const lightAngleValue = document.getElementById('light-angle-value');
        const spotlightAngle = document.getElementById('spotlight-angle');
        const spotlightAngleValue = document.getElementById('spotlight-angle-value');
        const toggleOscillate = document.getElementById('toggle-oscillate');
        const toggleLightHelper = document.getElementById('toggle-light-helper');
        const oscillationSpeedContainer = document.getElementById('oscillation-speed-container');
        const oscillationSpeed = document.getElementById('oscillation-speed');
        const oscillationSpeedValue = document.getElementById('oscillation-speed-value');
        const toggleCustomLight = document.getElementById('toggle-custom-light');
        
        // Ensure custom light is OFF by default
        let customLightEnabled = false;
        // Remove any existing custom light
        if (modelSwitcher.modelController.customLight) {
            modelSwitcher.modelController.scene.remove(modelSwitcher.modelController.customLight);
            if (modelSwitcher.modelController.customLightHelper) {
                modelSwitcher.modelController.scene.remove(modelSwitcher.modelController.customLightHelper);
                modelSwitcher.modelController.customLightHelper = null;
            }
            modelSwitcher.modelController.customLight = null;
        }
        if (toggleCustomLight) {
            toggleCustomLight.checked = false;
            toggleCustomLight.addEventListener('change', function() {
                if (this.checked) {
                    modelSwitcher.modelController.addCustomLight();
                    customLightEnabled = true;
                } else {
                    // Remove custom light and helper if present
                    if (modelSwitcher.modelController.customLight) {
                        modelSwitcher.modelController.scene.remove(modelSwitcher.modelController.customLight);
                        if (modelSwitcher.modelController.customLightHelper) {
                            modelSwitcher.modelController.scene.remove(modelSwitcher.modelController.customLightHelper);
                            modelSwitcher.modelController.customLightHelper = null;
                        }
                        // Remove the target as well
                        if (modelSwitcher.modelController.customLight.target) {
                            modelSwitcher.modelController.scene.remove(modelSwitcher.modelController.customLight.target);
                        }
                        modelSwitcher.modelController.customLight = null;
                    }
                    customLightEnabled = false;
                }
            });
        }
        
        if (lightColor) {
            lightColor.addEventListener('input', function() {
                modelSwitcher.modelController.setLightColor(this.value);
            });
        }
        
        if (lightDistance) {
            lightDistance.addEventListener('input', function() {
                modelSwitcher.modelController.setLightDistance(this.value);
                if (lightDistanceValue) {
                    lightDistanceValue.textContent = this.value;
                }
            });
        }
        
        if (lightAngle) {
            lightAngle.addEventListener('input', function() {
                modelSwitcher.modelController.setLightAngle(this.value);
                if (lightAngleValue) {
                    lightAngleValue.textContent = this.value + '°';
                }
            });
        }
        
        if (spotlightAngle) {
            // Set initial value
            modelSwitcher.modelController.setSpotlightAngle(spotlightAngle.value);
            
            spotlightAngle.addEventListener('input', function() {
                modelSwitcher.modelController.setSpotlightAngle(this.value);
                if (spotlightAngleValue) {
                    // Calculate actual degrees for display
                    const degrees = 5 + (parseFloat(this.value) / 100) * 25;
                    spotlightAngleValue.textContent = Math.round(degrees) + '°';
                }
            });
        }
        
        if (toggleOscillate) {
            toggleOscillate.addEventListener('click', function() {
                const isOscillating = modelSwitcher.modelController.toggleLightOscillation();
                this.classList.toggle('active', isOscillating);
                
                // Show/hide oscillation speed slider
                if (oscillationSpeedContainer) {
                    oscillationSpeedContainer.style.display = isOscillating ? 'block' : 'none';
                }
                
                if (isOscillating) {
                    this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Stop Oscillation';
                    
                    // Set initial oscillation speed
                    if (oscillationSpeed) {
                        modelSwitcher.modelController.setOscillationSpeed(oscillationSpeed.value);
                    }
                } else {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Oscillate Light';
                }
            });
        }
        
        if (oscillationSpeed) {
            oscillationSpeed.addEventListener('input', function() {
                modelSwitcher.modelController.setOscillationSpeed(this.value);
                if (oscillationSpeedValue) {
                    oscillationSpeedValue.textContent = this.value + '%';
                }
            });
        }
        
        if (toggleLightHelper) {
            toggleLightHelper.addEventListener('click', function() {
                const isHelperVisible = modelSwitcher.modelController.toggleLightHelper();
                this.classList.toggle('active', isHelperVisible);
            });
        }
    }
}); 