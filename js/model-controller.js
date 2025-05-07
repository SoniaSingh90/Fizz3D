/**
 * model-controller.js
 * Handles loading and controlling 3D models using Three.js
 */

class ModelController {
    constructor(containerId, modelPath) {
        this.container = document.getElementById(containerId);
        this.modelPath = modelPath;
        this.originalModelPath = modelPath;
        
        // Get the loading spinner
        this.loader = this.container.querySelector('.model-loader');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.initialCameraPosition = { x: 0, y: 0, z: 6 };
        this.camera.position.set(
            this.initialCameraPosition.x,
            this.initialCameraPosition.y,
            this.initialCameraPosition.z
        );
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor(0xf0f0f0);
        this.container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Lighting
        this.setupLights('studio');
        
        // Custom directional light for GUI control
        this.customLight = null;
        this.customLightHelper = null;
        this.isLightOscillating = false;
        this.lightOscillationAngle = 0;
        this.lightOscillationSpeed = 0.03; // Slightly faster default speed
        this.lightOscillationRange = Math.PI / 3; // 60 degrees - wider range for more visible movement
        
        // Model
        this.model = null;
        this.wireframe = false;
        this.isRotating = false;
        this.rotationSpeed = 0.01;
        
        // Animation
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animationActions = {
            openAnimations: [],
            crushAnimations: []
        };
        this.allAnimations = [];
        this.isAnimating = false;
        this.modelOpened = false;
        this.modelCrushed = false;
        
        // Audio setup
        this.sounds = {};
        this.setupAudio();
        
        // Load the model
        this.loadModel();
        
        // Add event listener for window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
    }
    
    setupLights(environment = 'studio') {
        // Remove existing lights
        this.scene.children.forEach(child => {
            if (child.isLight) {
                this.scene.remove(child);
            }
        });
        
        // Add environment-specific lighting
        switch (environment) {
            case 'studio':
                // Ambient light
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
                this.scene.add(ambientLight);
                
                // Directional light (simulates studio lighting)
                const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
                dirLight.position.set(1, 1, 1);
                this.scene.add(dirLight);
                
                // Add point lights for better illumination
                const pointLight1 = new THREE.PointLight(0xffffff, 0.3);
                pointLight1.position.set(2, 2, 2);
                this.scene.add(pointLight1);
                
                const pointLight2 = new THREE.PointLight(0xffffff, 0.3);
                pointLight2.position.set(-2, 2, -2);
                this.scene.add(pointLight2);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightStudio = new THREE.DirectionalLight(0xffffff, 0.5);
                bottomDirLightStudio.position.set(0, -3, 0);
                bottomDirLightStudio.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightStudio);
                this.scene.add(bottomDirLightStudio.target);
                break;
                
            case 'outdoor':
                // Ambient light (sky)
                const outdoorAmbient = new THREE.AmbientLight(0xc2d9ff, 0.5);
                this.scene.add(outdoorAmbient);
                
                // Directional light (sun)
                const sunLight = new THREE.DirectionalLight(0xffeeb1, 0.8);
                sunLight.position.set(5, 10, 5);
                this.scene.add(sunLight);
                
                // Hemisphere light (ground/sky)
                const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.4);
                this.scene.add(hemiLight);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightOutdoor = new THREE.DirectionalLight(0x87ceeb, 0.3);
                bottomDirLightOutdoor.position.set(0, -3, 0);
                bottomDirLightOutdoor.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightOutdoor);
                this.scene.add(bottomDirLightOutdoor.target);
                break;
                
            case 'warehouse':
                // Ambient light (low light environment)
                const warehouseAmbient = new THREE.AmbientLight(0x555555, 0.2);
                this.scene.add(warehouseAmbient);
                
                // Point lights (industrial lighting)
                const ceiling1 = new THREE.PointLight(0xffffcc, 0.3);
                ceiling1.position.set(0, 5, 0);
                this.scene.add(ceiling1);
                
                const ceiling2 = new THREE.PointLight(0xffffee, 0.3);
                ceiling2.position.set(-3, 5, -3);
                this.scene.add(ceiling2);
                
                const ceiling3 = new THREE.PointLight(0xffffee, 0.3);
                ceiling3.position.set(3, 5, 3);
                this.scene.add(ceiling3);
                
                // Spot light (directed light)
                const spotLight = new THREE.SpotLight(0xffffff, 0.3);
                spotLight.position.set(3, 3, 3);
                spotLight.angle = Math.PI / 6;
                spotLight.penumbra = 0.2;
                this.scene.add(spotLight);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightWarehouse = new THREE.DirectionalLight(0xfff2cc, 0.2);
                bottomDirLightWarehouse.position.set(0, -3, 0);
                bottomDirLightWarehouse.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightWarehouse);
                this.scene.add(bottomDirLightWarehouse.target);
                break;
                
            case 'sunset':
                // Ambient light (warm evening glow)
                const sunsetAmbient = new THREE.AmbientLight(0xff8c66, 0.2);
                this.scene.add(sunsetAmbient);
                
                // Main sunset directional light
                const sunsetLight = new THREE.DirectionalLight(0xff7e47, 0.5);
                sunsetLight.position.set(10, 2, 10);
                this.scene.add(sunsetLight);
                
                // Blue-ish fill light from opposite direction
                const blueLight = new THREE.DirectionalLight(0x6e8eff, 0.2);
                blueLight.position.set(-5, 1, -5);
                this.scene.add(blueLight);
                
                // Hemisphere light (sunset sky to ground)
                const sunsetHemi = new THREE.HemisphereLight(0xffa585, 0x552e33, 0.3);
                this.scene.add(sunsetHemi);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightSunset = new THREE.DirectionalLight(0xffa585, 0.2);
                bottomDirLightSunset.position.set(0, -3, 0);
                bottomDirLightSunset.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightSunset);
                this.scene.add(bottomDirLightSunset.target);
                break;
                
            case 'night':
                // Very low ambient light
                const nightAmbient = new THREE.AmbientLight(0x0a1a2a, 0.1);
                this.scene.add(nightAmbient);
                
                // Moonlight (directional, bluish)
                const moonLight = new THREE.DirectionalLight(0xc2d9ff, 0.15);
                moonLight.position.set(0, 10, 0);
                this.scene.add(moonLight);
                
                // Distant streetlight (orange point light)
                const streetLight = new THREE.PointLight(0xffaa44, 0.2);
                streetLight.position.set(8, 2, 8);
                streetLight.distance = 20;
                streetLight.decay = 2;
                this.scene.add(streetLight);
                
                // Blue highlight from another direction
                const blueSpot = new THREE.SpotLight(0x4466ff, 0.1);
                blueSpot.position.set(-5, 3, -5);
                blueSpot.angle = Math.PI / 6;
                blueSpot.penumbra = 0.5;
                this.scene.add(blueSpot);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightNight = new THREE.DirectionalLight(0x6e8eff, 0.1);
                bottomDirLightNight.position.set(0, -3, 0);
                bottomDirLightNight.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightNight);
                this.scene.add(bottomDirLightNight.target);
                break;
                
            default:
                // Default studio lighting
                const defaultAmbient = new THREE.AmbientLight(0xffffff, 0.3);
                this.scene.add(defaultAmbient);
                
                const defaultDir = new THREE.DirectionalLight(0xffffff, 0.7);
                defaultDir.position.set(1, 1, 1);
                this.scene.add(defaultDir);
                
                // Add a directional light from below to illuminate the bottom
                const bottomDirLightDefault = new THREE.DirectionalLight(0xffffff, 0.3);
                bottomDirLightDefault.position.set(0, -3, 0);
                bottomDirLightDefault.target.position.set(0, 0, 0);
                this.scene.add(bottomDirLightDefault);
                this.scene.add(bottomDirLightDefault.target);
                break;
        }
    }
    
    loadModel() {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            this.modelPath,
            (gltf) => {
                // Remove previous model if it exists
                if (this.model) {
                    this.scene.remove(this.model);
                    
                    // Dispose of geometries and materials
                    this.model.traverse(child => {
                        if (child.isMesh) {
                            child.geometry.dispose();
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
                
                this.model = gltf.scene;
                
                // Center the model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Normalize and center model - increased scale from 2 to 3.5 for larger models
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3.5 / maxDim; // Increased from 2 to 3.5 to make models larger
                this.model.scale.multiplyScalar(scale);
                
                // Reset position
                this.model.position.sub(center.multiplyScalar(scale));
                
                // Setup animations
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    
                    // Store all animations
                    this.allAnimations = [];
                    
                    // Log all animation names for debugging
                    console.log('Available animations:', gltf.animations.map(a => a.name).join(', '));
                    
                    // Find and store named animations
                    gltf.animations.forEach(clip => {
                        const action = this.mixer.clipAction(clip);
                        action.loop = THREE.LoopOnce;
                        action.clampWhenFinished = true;
                        
                        // Store all actions in array for easy access
                        this.allAnimations.push({
                            name: clip.name,
                            action: action
                        });
                        
                        // Log each animation clip name for debugging
                        console.log('Found animation:', clip.name);
                        
                        // Check if it's an open animation - be more explicit with the naming
                        const isOpen = clip.name === "Open" || 
                                      clip.name === "Open.001" || 
                                      clip.name.toLowerCase().includes('open');
                                      
                        // Check if it's a crush animation - be more explicit with the naming
                        const isCrush = clip.name === "Crush" || 
                                       clip.name === "Crush.001" || 
                                       clip.name.toLowerCase().includes('crush');
                        
                        // Store actions by name for backwards compatibility
                        if (isOpen) {
                            // If multiple open animations, store the first one as the main one
                            if (!this.animationActions.open) {
                                this.animationActions.open = action;
                            }
                            
                            // Store all open animations in an array
                            if (!this.animationActions.openAnimations) {
                                this.animationActions.openAnimations = [];
                            }
                            this.animationActions.openAnimations.push(action);
                            console.log('Added open animation:', clip.name);
                        } else if (isCrush) {
                            // If multiple crush animations, store the first one as the main one
                            if (!this.animationActions.crush) {
                                this.animationActions.crush = action;
                            }
                            
                            // Store all crush animations in an array
                            if (!this.animationActions.crushAnimations) {
                                this.animationActions.crushAnimations = [];
                            }
                            this.animationActions.crushAnimations.push(action);
                            console.log('Added crush animation:', clip.name);
                        }
                    });
                    
                    // Debug animation names if not found
                    if (!this.animationActions.open || !this.animationActions.crush) {
                        console.warn('Expected animations not found. Available animations:', 
                            gltf.animations.map(a => a.name).join(', '));
                    }
                }
                
                // Add model to scene
                this.scene.add(this.model);
                
                // Apply wireframe if it was enabled
                if (this.wireframe) {
                    this.model.traverse(child => {
                        if (child.isMesh) {
                            child.material.wireframe = true;
                        }
                    });
                }
                
                // Hide the loading spinner when model is loaded
                if (this.loader) {
                    this.loader.style.display = 'none';
                }
            },
            (xhr) => {
                // Loading progress
                const progress = (xhr.loaded / xhr.total * 100);
                console.log(`Model loading: ${progress.toFixed(2)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
                // Show error message in place of spinner
                if (this.loader) {
                    this.loader.innerHTML = '<div class="alert alert-danger">Error loading model</div>';
                }
            }
        );
    }
    
    playOpenAnimation() {
        if (!this.mixer || (!this.animationActions.open && !this.animationActions.openAnimations) || this.isAnimating) {
            console.warn('Cannot play open animation: mixer not ready or already animating');
            return false;
        }
        
        // Don't allow opening if the model is already crushed
        if (this.modelCrushed) {
            console.warn('Cannot open a crushed model');
            return false;
        }
        
        // Play the can opening sound
        this.playSound('open');
        
        // We no longer need to stop or restore rotation - let it continue during animation
        
        // Specify the starting frame if needed (0 means start from beginning)
        const startFrame = 0;
        
        // Play all open animations
        this.isAnimating = true;
        
        // Check if we have multiple open animations stored in the array
        if (this.animationActions.openAnimations && this.animationActions.openAnimations.length > 0) {
            console.log('Playing multiple open animations:', this.animationActions.openAnimations.length);
            console.log('Animation names:', this.animationActions.openAnimations.map(action => action._clip.name));
            
            // Play all open animations from the specified frame
            this.animationActions.openAnimations.forEach(action => {
                // Get the clip duration if starting from a specific frame
                if (startFrame > 0) {
                    const clipDuration = action._clip.duration;
                    const startTime = this.getTimeForFrame(action, startFrame);
                    
                    console.log(`Starting animation from frame ${startFrame} at time ${startTime}s of ${clipDuration}s`);
                    
                    // Check if the start frame is too close to the end
                    if (startTime / clipDuration > 0.9) {
                        console.warn('Start frame is too close to the end of animation, starting from beginning instead');
                        action.reset();
                    } else {
                        action.reset();
                        action.time = startTime;
                    }
                    
                    // Force mixer to update once to apply the time change
                    this.mixer.update(0);
                } else {
                    // Start from the beginning
                    action.reset();
                }
                
                // Set to keep final position
                action.clampWhenFinished = true;
                
                // Play the animation
                action.play();
            });
            
            // For completion tracking, use the first animation
            const primaryAction = this.animationActions.openAnimations[0];
            
            // Calculate remaining time if starting from a specific frame
            let remainingTime = primaryAction._clip.duration * 1000; // Full duration in ms by default
            
            if (startFrame > 0) {
                const clipDuration = primaryAction._clip.duration;
                const startTime = this.getTimeForFrame(primaryAction, startFrame);
                remainingTime = (clipDuration - startTime) * 1000; // Convert to milliseconds
            }
            
            console.log(`Animation will complete in approximately ${remainingTime}ms`);
            
            // Use both event listener and timeout to handle completion
            const onAnimationFinished = (e) => {
                if (e.action === primaryAction) {
                    this.mixer.removeEventListener('finished', onAnimationFinished);
                    clearTimeout(completionTimeout);
                    this.isAnimating = false;
                    this.modelOpened = true;
                    
                    // Enable the crush button
                    const crushBtn = document.getElementById('crush-can-btn');
                    if (crushBtn) {
                        crushBtn.disabled = false;
                    }
                    
                    console.log('Open animation completed via event - model kept at opened state');
                }
            };
            
            // Set a backup timeout in case the finished event doesn't fire
            const completionTimeout = setTimeout(() => {
                this.mixer.removeEventListener('finished', onAnimationFinished);
                this.isAnimating = false;
                this.modelOpened = true;
                
                // Enable the crush button
                const crushBtn = document.getElementById('crush-can-btn');
                if (crushBtn) {
                    crushBtn.disabled = false;
                }
                
                console.log('Open animation completed via timeout - model kept at opened state');
            }, remainingTime + 500); // Add a small buffer
            
            this.mixer.addEventListener('finished', onAnimationFinished);
        } else {
            // Legacy support for single animation
            const action = this.animationActions.open;
            
            // Start from specific frame if needed
            if (startFrame > 0) {
                const clipDuration = action._clip.duration;
                const startTime = this.getTimeForFrame(action, startFrame);
                
                console.log(`Starting animation from frame ${startFrame} at time ${startTime}s of ${clipDuration}s`);
                
                // Check if the start frame is too close to the end
                if (startTime / clipDuration > 0.9) {
                    console.warn('Start frame is too close to the end of animation, starting from beginning instead');
                    action.reset();
                } else {
                    action.reset();
                    action.time = startTime;
                }
                
                // Force mixer to update once to apply the time change
                this.mixer.update(0);
            } else {
                // Start from the beginning
                action.reset();
            }
            
            // Set to keep final position
            action.clampWhenFinished = true;
            
            // Play the animation
            action.play();
            
            // Calculate remaining time if starting from a specific frame
            let remainingTime = action._clip.duration * 1000; // Full duration in ms by default
            
            if (startFrame > 0) {
                const clipDuration = action._clip.duration;
                const startTime = this.getTimeForFrame(action, startFrame);
                remainingTime = (clipDuration - startTime) * 1000; // Convert to milliseconds
            }
            
            console.log(`Animation will complete in approximately ${remainingTime}ms`);
            
            // Use both event listener and timeout to handle completion
            const onAnimationFinished = (e) => {
                if (e.action === action) {
                    this.mixer.removeEventListener('finished', onAnimationFinished);
                    clearTimeout(completionTimeout);
                    this.isAnimating = false;
                    this.modelOpened = true;
                    
                    // Enable the crush button
                    const crushBtn = document.getElementById('crush-can-btn');
                    if (crushBtn) {
                        crushBtn.disabled = false;
                    }
                    
                    console.log('Open animation completed via event - model kept at opened state');
                }
            };
            
            // Set a backup timeout in case the finished event doesn't fire
            const completionTimeout = setTimeout(() => {
                this.mixer.removeEventListener('finished', onAnimationFinished);
                this.isAnimating = false;
                this.modelOpened = true;
                
                // Enable the crush button
                const crushBtn = document.getElementById('crush-can-btn');
                if (crushBtn) {
                    crushBtn.disabled = false;
                }
                
                console.log('Open animation completed via timeout - model kept at opened state');
            }, remainingTime + 500); // Add a small buffer
            
            this.mixer.addEventListener('finished', onAnimationFinished);
        }
        
        return true;
    }
    
    // Helper method to convert frame number to animation time
    getTimeForFrame(action, frameNumber) {
        if (!action || !action._clip) return 0;
        
        // Get the clip duration
        const clipDuration = action._clip.duration;
        
        // Get the total number of frames in the animation
        // Most animations are at 30 FPS, but we'll calculate it to be sure
        const totalFrames = Math.round(clipDuration * 30); // Assuming 30 FPS
        
        console.log(`Animation duration: ${clipDuration}s, total frames: ${totalFrames}`);
        
        // Make sure the requested frame is within bounds
        const clampedFrame = Math.min(Math.max(frameNumber, 0), totalFrames);
        
        // Calculate time based on the frame number
        const time = (clampedFrame / totalFrames) * clipDuration;
        
        return time;
    }
    
    playCrushAnimation() {
        if (!this.mixer || 
            (!this.animationActions.crush && !this.animationActions.crushAnimations) || 
            this.isAnimating) {
            // No requirement to check if the can is opened
            console.warn('Cannot play crush animation: mixer not ready or already animating');
            return false;
        }
        
        // Play the can crushing sound
        this.playSound('crush');
        
        // We no longer need to stop or restore rotation - let it continue during animation
        
        // Start frame for the crush animation
        const startFrame = 180;
        
        // Play all crush animations
        this.isAnimating = true;
        
        // Check if we have multiple crush animations stored in the array
        if (this.animationActions.crushAnimations && this.animationActions.crushAnimations.length > 0) {
            console.log('Playing multiple crush animations:', this.animationActions.crushAnimations.length);
            
            // Reset and play all crush animations
            this.animationActions.crushAnimations.forEach(action => {
                // Get the clip duration to check if we're starting near the end
                const clipDuration = action._clip.duration;
                const startTime = this.getTimeForFrame(action, startFrame);
                
                console.log(`Starting animation from frame ${startFrame} at time ${startTime}s of ${clipDuration}s`);
                
                // Check if we're starting near the end of the animation
                // If more than 90% through, we'll just use the beginning
                if (startTime / clipDuration > 0.9) {
                    console.warn('Start frame is too close to the end of animation, starting from beginning instead');
                    action.reset();
                } else {
                    action.reset();
                    action.time = startTime;
                }
                
                // Set to keep final position
                action.clampWhenFinished = true;
                
                // Force mixer to update once to apply the time change
                this.mixer.update(0);
                
                // Play the animation
                action.play();
            });
            
            // For completion tracking, use the first animation
            const primaryAction = this.animationActions.crushAnimations[0];
            
            // Set a timeout for completion based on remaining animation time
            const clipDuration = primaryAction._clip.duration;
            const startTime = this.getTimeForFrame(primaryAction, startFrame);
            const remainingTime = (clipDuration - startTime) * 1000; // Convert to milliseconds
            
            console.log(`Animation will complete in approximately ${remainingTime}ms`);
            
            // Use both event listener and timeout to handle completion
            const onAnimationFinished = (e) => {
                if (e.action === primaryAction) {
                    this.mixer.removeEventListener('finished', onAnimationFinished);
                    clearTimeout(completionTimeout);
                    this.isAnimating = false;
                    
                    // Mark as crushed - can't go back
                    this.modelCrushed = true;
                    
                    console.log('Animation completed via event - model kept at final pose');
                }
            };
            
            // Set a backup timeout in case the finished event doesn't fire
            // (which can happen when starting from a later frame)
            const completionTimeout = setTimeout(() => {
                this.mixer.removeEventListener('finished', onAnimationFinished);
                this.isAnimating = false;
                
                // Mark as crushed - can't go back
                this.modelCrushed = true;
                
                console.log('Animation completed via timeout - model kept at final pose');
            }, remainingTime + 500); // Add a small buffer
            
            this.mixer.addEventListener('finished', onAnimationFinished);
        } else {
            // Legacy support for single animation
            const action = this.animationActions.crush;
            
            // Get the clip duration to check if we're starting near the end
            const clipDuration = action._clip.duration;
            const startTime = this.getTimeForFrame(action, startFrame);
            
            console.log(`Starting animation from frame ${startFrame} at time ${startTime}s of ${clipDuration}s`);
            
            // Check if we're starting near the end of the animation
            // If more than 90% through, we'll just use the beginning
            if (startTime / clipDuration > 0.9) {
                console.warn('Start frame is too close to the end of animation, starting from beginning instead');
                action.reset();
            } else {
                action.reset();
                action.time = startTime;
            }
            
            // Set to keep final position
            action.clampWhenFinished = true;
            
            // Force mixer to update once to apply the time change
            this.mixer.update(0);
            
            // Play the animation
            action.play();
            
            // Set a timeout for completion based on remaining animation time
            const remainingTime = (clipDuration - startTime) * 1000; // Convert to milliseconds
            
            console.log(`Animation will complete in approximately ${remainingTime}ms`);
            
            // Use both event listener and timeout to handle completion
            const onAnimationFinished = (e) => {
                if (e.action === action) {
                    this.mixer.removeEventListener('finished', onAnimationFinished);
                    clearTimeout(completionTimeout);
                    this.isAnimating = false;
                    
                    // Mark as crushed - can't go back
                    this.modelCrushed = true;
                    
                    console.log('Animation completed via event - model kept at final pose');
                }
            };
            
            // Set a backup timeout in case the finished event doesn't fire
            // (which can happen when starting from a later frame)
            const completionTimeout = setTimeout(() => {
                this.mixer.removeEventListener('finished', onAnimationFinished);
                this.isAnimating = false;
                
                // Mark as crushed - can't go back
                this.modelCrushed = true;
                
                console.log('Animation completed via timeout - model kept at final pose');
            }, remainingTime + 500); // Add a small buffer
            
            this.mixer.addEventListener('finished', onAnimationFinished);
        }
        
        return true;
    }
    
    resetView(forceReset = false) {
        // If the model is crushed, don't reset unless forced
        if (this.modelCrushed && !forceReset) {
            console.warn('Model is crushed and cannot be reset. Use forceReset=true to force a reset.');
            return false;
        }
        
        // Stop any animations
        this.isAnimating = false;
        this.modelOpened = false;
        this.modelCrushed = false;
        
        // Stop rotation
        this.isRotating = false;
        this.updateRotationButtonState();
        
        // Reload the model
        this.loadModel();
        
        // Reset camera position
        this.camera.position.set(
            this.initialCameraPosition.x,
            this.initialCameraPosition.y,
            this.initialCameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);
        
        // Reset controls
        this.controls.reset();
        
        // Keep the crush button enabled so it can be used immediately after reset
        
        // Reset rotation button if necessary
        const rotateBtn = document.getElementById('rotate-btn');
        if (rotateBtn) {
            rotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Start Rotation';
        }
        
        return true;
    }
    
    setBackgroundColor(color) {
        if (color === 'transparent') {
            // Make background transparent
            this.scene.background = null;
            this.renderer.setClearColor(0x000000, 0);
        } else {
            // Set to specified color
            this.scene.background = new THREE.Color(color);
            this.renderer.setClearColor(color, 1);
        }
        return true;
    }
    
    setEnvironment(environment) {
        // Save custom light properties before changing environment
        let customLightState = null;
        if (this.customLight) {
            customLightState = {
                color: this.customLight.color.getHexString(),
                position: this.customLight.position.clone(),
                helper: this.customLightHelper !== null,
                isOscillating: this.isLightOscillating,
                oscillationAngle: this.lightOscillationAngle
            };
        }
        
        // Setup the environment lights
        this.setupLights(environment);
        
        // Restore custom light if it existed
        if (customLightState) {
            // Re-add custom light
            this.addCustomLight();
            
            // Restore color
            this.setLightColor('#' + customLightState.color);
            
            // Restore position
            this.customLight.position.copy(customLightState.position);
            
            // Restore helper if it was visible
            if (customLightState.helper && !this.customLightHelper) {
                this.toggleLightHelper();
            }
            
            // Restore oscillation if it was active
            if (customLightState.isOscillating && !this.isLightOscillating) {
                this.isLightOscillating = false; // Reset first
                this.lightOscillationAngle = customLightState.oscillationAngle;
                this.toggleLightOscillation();
            }
        }
        
        return true;
    }
    
    toggleWireframe() {
        this.wireframe = !this.wireframe;
        
        if (this.model) {
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.material.wireframe = this.wireframe;
                }
            });
        }
        
        return this.wireframe;
    }
    
    toggleRotation() {
        // Don't allow rotation during animation
        if (this.isAnimating) {
            return false;
        }
        
        this.isRotating = !this.isRotating;
        this.updateRotationButtonState();
        return this.isRotating;
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = (speed / 100) * 0.05; // Scale from 0 to 0.05
        return true;
    }
    
    setLightingIntensity(intensity) {
        // Scale the intensity from 0-100 to 0-2 (0 = off, 1 = normal, 2 = bright)
        const scaledIntensity = (intensity / 100) * 2;
        
        // Adjust all lights in the scene
        this.scene.children.forEach(child => {
            if (child.isLight) {
                // Store original intensity if not already stored
                if (child.userData.originalIntensity === undefined) {
                    child.userData.originalIntensity = child.intensity;
                }
                
                // Set intensity as a proportion of the original
                child.intensity = child.userData.originalIntensity * scaledIntensity;
            }
        });
        
        return true;
    }
    
    setCameraAngle(preset) {
        switch (preset) {
            case 'front':
                this.camera.position.set(0, 0, 6);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'side':
                this.camera.position.set(6, 0, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'top':
                this.camera.position.set(0, 6, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'isometric':
                this.camera.position.set(4, 4, 4);
                this.camera.lookAt(0, 0, 0);
                break;
            default:
                break;
        }
        
        this.controls.update();
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }
        
        // Rotate model if enabled (allow rotation even during animation)
        if (this.isRotating && this.model) {
            this.model.rotation.y += this.rotationSpeed;
        }
        
        // Update light oscillation if enabled
        if (this.isLightOscillating) {
            this.updateLightOscillation();
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Add a custom directional light for GUI control
    addCustomLight() {
        // Remove existing custom light if it exists
        if (this.customLight) {
            this.scene.remove(this.customLight);
            if (this.customLightHelper) {
                this.scene.remove(this.customLightHelper);
                this.customLightHelper = null;
            }
        }
        
        // Create a spot light instead of directional light
        this.customLight = new THREE.SpotLight(0xffffff, 1.5);
        // Position the light closer to be visible and illuminate more of the model
        this.customLight.position.set(0, 3, 3);
        this.customLight.castShadow = true;
        this.customLight.angle = Math.PI / 6; // 30 degrees - wider for better coverage
        this.customLight.penumbra = 0.2; // Softer edge for more natural illumination
        this.customLight.decay = 0.5; // Less decay for better reach
        this.customLight.intensity = 2; // Increased intensity
        
        // Add target for the spot light
        this.customLight.target.position.set(0, 0, 0);
        this.scene.add(this.customLight.target);
        
        // Improve shadow quality
        this.customLight.shadow.mapSize.width = 1024;
        this.customLight.shadow.mapSize.height = 1024;
        this.customLight.shadow.camera.near = 0.5;
        this.customLight.shadow.camera.far = 50;
        
        this.scene.add(this.customLight);
        
        return this.customLight;
    }
    
    // Set the color of the custom light
    setLightColor(color) {
        if (!this.customLight) return false;
        
        this.customLight.color.set(color);
        return true;
    }
    
    // Set the distance of the custom light
    setLightDistance(distance) {
        if (!this.customLight) return false;
        
        const normalizedDistance = parseFloat(distance);
        
        // Calculate position based on current angle and new distance
        const angle = Math.atan2(this.customLight.position.z, this.customLight.position.x);
        const y = this.customLight.position.y;
        
        this.customLight.position.x = normalizedDistance * Math.cos(angle);
        this.customLight.position.z = normalizedDistance * Math.sin(angle);
        this.customLight.position.y = y;
        
        // Update helper if it exists
        if (this.customLightHelper) {
            this.customLightHelper.update();
        }
        
        return true;
    }
    
    // Set the angle of the custom light around the model
    setLightAngle(angle) {
        if (!this.customLight) return false;
        
        const radians = (parseFloat(angle) * Math.PI) / 180;
        const distance = Math.sqrt(
            this.customLight.position.x * this.customLight.position.x + 
            this.customLight.position.z * this.customLight.position.z
        );
        
        this.customLight.position.x = distance * Math.cos(radians);
        this.customLight.position.z = distance * Math.sin(radians);
        
        // Update helper if it exists
        if (this.customLightHelper) {
            this.customLightHelper.update();
        }
        
        return true;
    }
    
    // Toggle light oscillation (pendulum-like movement)
    toggleLightOscillation() {
        this.isLightOscillating = !this.isLightOscillating;
        
        // If starting oscillation, store the current angle as the center point
        if (this.isLightOscillating) {
            this.lightOscillationAngle = Math.atan2(
                this.customLight.position.z,
                this.customLight.position.x
            );
        }
        
        return this.isLightOscillating;
    }
    
    // Set the oscillation speed
    setOscillationSpeed(speed) {
        if (!this.customLight) return false;
        
        // Convert from 0-100 range to 0.01-0.1 (slower to faster)
        this.lightOscillationSpeed = 0.01 + (parseFloat(speed) / 100) * 0.09;
        return true;
    }
    
    // Set the spotlight cone angle
    setSpotlightAngle(angle) {
        if (!this.customLight) return false;
        
        // Convert from 0-100 range to 10-60 degrees (wider range for better illumination)
        const degrees = 10 + (parseFloat(angle) / 100) * 50;
        this.customLight.angle = (degrees * Math.PI) / 180;
        
        // Update helper if it exists
        if (this.customLightHelper) {
            this.customLightHelper.update();
        }
        
        return true;
    }
    
    // Toggle light helper to visualize direction
    toggleLightHelper() {
        if (!this.customLight) return false;
        
        if (this.customLightHelper) {
            // Remove helper if it exists
            this.scene.remove(this.customLightHelper);
            this.customLightHelper = null;
            return false;
        } else {
            // Ensure the light target is in the scene
            if (!this.scene.children.includes(this.customLight.target)) {
                this.scene.add(this.customLight.target);
            }
            
            // Create a SpotLight helper with enhanced visibility
            this.customLightHelper = new THREE.SpotLightHelper(this.customLight, 0xff0000);
            
            // Make helper lines more visible by making them red
            if (this.customLightHelper.cone) {
                this.customLightHelper.cone.material.color.set(0xff0000);
                this.customLightHelper.cone.material.opacity = 0.7;
                this.customLightHelper.cone.material.transparent = true;
            }
            
            this.scene.add(this.customLightHelper);
            
            // Force initial update
            this.customLightHelper.update();
            return true;
        }
    }
    
    // Update the light oscillation
    updateLightOscillation() {
        if (!this.isLightOscillating || !this.customLight) return;
        
        // Get current distance from center
        const distance = Math.sqrt(
            this.customLight.position.x * this.customLight.position.x + 
            this.customLight.position.z * this.customLight.position.z
        );
        
        // Calculate new angle with sinusoidal oscillation
        const time = this.clock.getElapsedTime();
        const newAngle = this.lightOscillationAngle + 
                        Math.sin(time * this.lightOscillationSpeed * Math.PI * 2) * 
                        this.lightOscillationRange;
        
        // Update light position - adjust height slightly to add interesting movement
        this.customLight.position.x = distance * Math.cos(newAngle);
        this.customLight.position.z = distance * Math.sin(newAngle);
        this.customLight.position.y = 2 + Math.sin(time * this.lightOscillationSpeed * Math.PI) * 0.2;
        
        // Force the light to point at the origin (center of model)
        this.customLight.target.position.set(0, 0, 0);
        
        // Update helper if it exists
        if (this.customLightHelper) {
            // Force update of the helper
            this.customLightHelper.update();
        }
    }

    // Helper method to update rotation button state based on the current isRotating property
    updateRotationButtonState() {
        const rotateBtn = document.getElementById('rotate-btn');
        const fullscreenRotateBtn = document.getElementById('fullscreen-rotation-toggle');
        
        // Update main rotation button
        if (rotateBtn) {
            rotateBtn.innerHTML = this.isRotating ? 
                '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                '<i class="fas fa-sync-alt"></i> Start Rotation';
            
            // Update active class
            if (this.isRotating) {
                rotateBtn.classList.add('active');
            } else {
                rotateBtn.classList.remove('active');
            }
        }
        
        // Update fullscreen rotation button if it exists
        if (fullscreenRotateBtn) {
            fullscreenRotateBtn.innerHTML = this.isRotating ? 
                '<i class="fas fa-sync-alt fa-spin"></i> Stop Rotation' : 
                '<i class="fas fa-sync-alt"></i> Start Rotation';
            
            // Update active class
            if (this.isRotating) {
                fullscreenRotateBtn.classList.add('active');
            } else {
                fullscreenRotateBtn.classList.remove('active');
            }
        }
    }

    // Set up audio for can opening and crushing sounds
    setupAudio() {
        // Create audio objects for can opening and crushing
        this.sounds.open = new Audio('sounds/can-open.mp3');
        this.sounds.crush = new Audio('sounds/can-crush.mp3');
        
        // Preload the sounds
        this.sounds.open.load();
        this.sounds.crush.load();
    }
    
    // Play a sound by name
    playSound(soundName) {
        if (this.sounds[soundName]) {
            // Reset the audio to start from beginning if it was already playing
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
            
            // Play the sound
            this.sounds[soundName].play().catch(error => {
                console.warn(`Error playing sound ${soundName}:`, error);
            });
        } else {
            console.warn(`Sound "${soundName}" not found`);
        }
    }
} 