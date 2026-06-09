import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { state } from './state.js';
import { buildEnvironment } from './environment.js';
import { spawnIngredients } from './ingredients.js';
import { DiscoveryManager } from './discovery.js';
import { initVRControllers, initGrabInteraction, checkCauldronCollision, drawTeleportArc, updateControllerVelocityTracker } from './vrControls.js';
import { initDesktopInteractions, initSimulatorButtons } from './desktopControls.js';
import { updatePhysics } from './physics.js';
import { updateFireplaceParticles } from './cabin.js';
import { updateAntigravityParticles, updateInfernoParticles, updateStarfieldParticles, updateSludgeParticles, updateLoveParticles } from './spells.js';

// Setup msgBanner and discoveryManager
state.msgBanner = document.getElementById('hud-message');
state.discoveryManager = new DiscoveryManager();

// --- Initializer ---
init();

function init() {
    // 1. Scene setup with mystical dark purple/green fog
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0e0813);
    state.scene.fog = new THREE.FogExp2(0x0e0813, 0.07);

    // 2. Camera Group Setup (Crucial for VR Teleportation offsets)
    state.cameraGroup = new THREE.Group();
    state.scene.add(state.cameraGroup);

    state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    state.camera.position.set(0, 1.6, 0.8); // standard eye height (1.6m) offset slightly backward
    state.cameraGroup.add(state.camera);

    // 3. WebGL Renderer with High-End Lighting Settings
    const container = document.getElementById('canvas-container');
    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.1;
    state.renderer.xr.enabled = true;
    container.appendChild(state.renderer.domElement);

    // 4. VR Entry Button Setup
    const vrButtonContainer = document.getElementById('vr-button-container');
    const vrBtn = VRButton.createButton(state.renderer);
    vrButtonContainer.appendChild(vrBtn);

    // 5. Desktop Orbit Controls
    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.target.set(0, 0.8, -1.2); // look at the table/cauldron area
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;
    state.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent clipping through floor
    state.controls.minDistance = 0.5;
    state.controls.maxDistance = 5.0;

    // 6. Build the Witch's Hut Environment
    buildEnvironment();

    // 7. Initialize Interactive Ingredients
    spawnIngredients();

    // 8. VR Controllers & Interaction listeners
    initVRControllers();
    initGrabInteraction();

    // 9. Attach Event Listeners
    window.addEventListener('resize', onWindowResize);
    initDesktopInteractions();
    initSimulatorButtons();

    // 10. Start the main animation frame loop (WebXR compatible)
    state.renderer.setAnimationLoop(animate);
}

// --- Render Loop (WebXR Compatible) ---
function animate(timestamp, frame) {
    const realDt = Math.min(state.clock.getDelta(), 0.1);
    const dt = realDt * state.timeScale; // Time dilated delta time

    // 1. Process VR Controller tracking positions
    if (state.renderer.xr.isPresenting) {
        state.controllerTrackers.forEach(updateControllerVelocityTracker);

        state.controllers.forEach(controller => {
            if (controller.userData.isTeleporting) {
                drawTeleportArc(controller);
            }
        });
    }

    // 2. Perform Custom Physics kinematics
    updatePhysics(dt);

    // 3. Perform Cauldron Collision verification
    checkCauldronCollision();

    // 4. Update Cauldron Fluid and Active Spell States
    if (state.activeSpell) {
        state.spellProgress = Math.min(state.spellProgress + realDt * 0.8, 1.0);
        
        let targetColor = new THREE.Color(0x4a0e80);
        let targetEmissive = new THREE.Color(0x240046);
        
        if (state.activeSpell === "ANTIGRAVITY") {
            targetColor.setHex(0x39ff14);
            targetEmissive.setHex(0x19a008);
            updateAntigravityParticles(dt);
        } else if (state.activeSpell === "TIME_DILATION") {
            targetColor.setHex(0x8a2be2);
            targetEmissive.setHex(0x3c096c);
        } else if (state.activeSpell === "SHRINKING") {
            targetColor.setHex(0x00ffff);
            targetEmissive.setHex(0x005577);
        } else if (state.activeSpell === "INFERNO_VORTEX") {
            targetColor.setHex(0xff4500);
            targetEmissive.setHex(0x8b0000);
            updateInfernoParticles(dt);
        } else if (state.activeSpell === "COSMIC_STARFIELD") {
            targetColor.setHex(0x000000);
            targetEmissive.setHex(0x111111);
            updateStarfieldParticles(dt);
        } else if (state.activeSpell === "WIREFRAME_MATRIX") {
            targetColor.setHex(0x00ff00);
            targetEmissive.setHex(0x00aa00);
        } else if (state.activeSpell === "SLUDGE") {
            targetColor.setHex(0x8b5a2b);
            targetEmissive.setHex(0x3c2a1a);
            updateSludgeParticles(dt);
        } else if (state.activeSpell === "LOVE_MIX") {
            targetColor.setHex(0xff1493);
            targetEmissive.setHex(0x4b0026);
            updateLoveParticles(dt);
        } else if (state.activeSpell === "EXPLOSION_MIX") {
            targetColor.setHex(0x111111);
            targetEmissive.setHex(0x000000);
        }
        
        state.fluidMaterial.color.lerpColors(new THREE.Color(0x4a0e80), targetColor, state.spellProgress);
        state.fluidMaterial.emissive.lerpColors(new THREE.Color(0x240046), targetEmissive, state.spellProgress);
        
        // Pulsing light intensity animation
        if (state.cauldron && state.cauldron.userData.light) {
            state.cauldron.userData.light.intensity = 15.0 + Math.sin(performance.now() * 0.008) * 5.0;
        }

        // Animate floating bubbling cauldron liquid plane slightly
        state.cauldronFluid.position.y = (state.CAULDRON_HEIGHT - 0.05) + Math.sin(performance.now() * 0.003) * 0.008;
    } else {
        // Idle purple cauldron fluid animation
        state.cauldronFluid.position.y = (state.CAULDRON_HEIGHT - 0.05) + Math.sin(performance.now() * 0.002) * 0.005;
        if (state.cauldron && state.cauldron.userData.light) {
            state.cauldron.userData.light.intensity = 8.0 + Math.sin(performance.now() * 0.004) * 2.0;
        }
    }

    // Animate crystal ball soft glowing light pulse
    if (state.crystalBallLight) {
        state.crystalBallLight.intensity = 1.2 + Math.sin(performance.now() * 0.0035) * 0.35;
    }

    // 5. Smoothly interpolate cameraGroup scale and Y height
    state.cameraGroup.scale.lerp(state.targetCameraGroupScale, 5 * realDt);
    state.cameraGroup.position.y = THREE.MathUtils.lerp(state.cameraGroup.position.y, state.targetCameraGroupY, 5 * realDt);

    // 6. Orbit Controls Update for Desktop fallback
    if (!state.renderer.xr.isPresenting) {
        state.controls.update();
    }

    // 6.5. Apply Explosion Screen Shake
    if (state.explosionShake > 0.01) {
        state.explosionShake *= 0.92; // decay over time
        const shakePower = state.explosionShake * 0.12;
        state.camera.position.x += (Math.random() - 0.5) * shakePower;
        state.camera.position.y += (Math.random() - 0.5) * shakePower;
        state.camera.position.z += (Math.random() - 0.5) * shakePower;
    }

    // Update Fireplace particles
    updateFireplaceParticles(realDt);

    // 7. Output to display screen
    state.renderer.render(state.scene, state.camera);
}

// --- Window Resize Handler ---
function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}
