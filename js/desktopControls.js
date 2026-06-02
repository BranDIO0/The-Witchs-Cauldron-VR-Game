import * as THREE from 'three';
import { state } from './state.js';
import { showFlashMessage } from './spells.js';
import { updateTomeDisplay } from './discovery.js';

// --- Desktop testing helpers ---
export function initDesktopInteractions() {
    const container = document.getElementById('canvas-container');

    container.addEventListener('mousedown', onDesktopMouseDown);
    container.addEventListener('mousemove', onDesktopMouseMove);
    container.addEventListener('mouseup', onDesktopMouseUp);
}

export function onDesktopMouseDown(event) {
    updateMouseCoordinates(event);

    state.raycasterDesktop.setFromCamera(state.mousePosition, state.camera);
    const intersects = state.raycasterDesktop.intersectObjects(state.ingredients, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.name) {
            obj = obj.parent;
        }

        if (obj && !obj.userData.inPot) {
            state.desktopGrabbedObject = obj;
            state.desktopGrabbedObject.userData.isGrabbed = true;
            state.desktopGrabbedObject.userData.velocity.set(0, 0, 0);

            // Deactivate camera orbit navigation to allow item drag
            state.controls.enabled = false;
            state.isOrbitingEnabled = false;

            // Calculate distance to camera to maintain drag depth
            const objWorldPos = new THREE.Vector3();
            state.desktopGrabbedObject.getWorldPosition(objWorldPos);
            state.desktopGrabDepth = state.camera.position.distanceTo(objWorldPos);

            // Clear drag position histories
            state.desktopPositionHistory.length = 0;
            state.desktopPositionHistory.push({
                pos: objWorldPos.clone(),
                time: performance.now()
            });
        }
    }
}

export function onDesktopMouseMove(event) {
    if (!state.desktopGrabbedObject) return;

    updateMouseCoordinates(event);
    
    // Re-project mouse coordinates to 3D world space at the recorded camera depth
    const ray = new THREE.Vector3(state.mousePosition.x, state.mousePosition.y, 0.5).unproject(state.camera);
    const dir = ray.sub(state.camera.position).normalize();
    const targetPos = new THREE.Vector3().copy(state.camera.position).addScaledVector(dir, state.desktopGrabDepth);
    
    // Apply coordinates to object
    state.desktopGrabbedObject.position.copy(targetPos);

    // Record track history for release throwing calculation
    state.desktopPositionHistory.push({
        pos: targetPos.clone(),
        time: performance.now()
    });
    if (state.desktopPositionHistory.length > 6) {
        state.desktopPositionHistory.shift();
    }
}

export function onDesktopMouseUp() {
    if (!state.desktopGrabbedObject) return;

    const obj = state.desktopGrabbedObject;
    obj.userData.isGrabbed = false;
    state.desktopGrabbedObject = null;

    // Re-enable camera orbit controls
    state.controls.enabled = true;
    state.isOrbitingEnabled = true;

    // Calculate mouse velocity vector throw force
    if (state.desktopPositionHistory.length >= 2) {
        const oldest = state.desktopPositionHistory[0];
        const newest = state.desktopPositionHistory[state.desktopPositionHistory.length - 1];
        const dt = (newest.time - oldest.time) / 1000;

        if (dt > 0.001) {
            const throwVelocity = new THREE.Vector3();
            throwVelocity.subVectors(newest.pos, oldest.pos).divideScalar(dt);
            
            // Scale mouse drag speed to realistic throwing velocity
            throwVelocity.multiplyScalar(0.45); 
            // Add minor forward throw boost in camera looking direction
            const camDir = new THREE.Vector3();
            state.camera.getWorldDirection(camDir);
            throwVelocity.addScaledVector(camDir, 0.5);

            throwVelocity.clampLength(0, 10); // cap speed
            obj.userData.velocity.copy(throwVelocity);
        }
    }
}

export function updateMouseCoordinates(event) {
    state.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Setup HTML Panel simulator trigger interactions
export function initSimulatorButtons() {
    // Drop Toad Egg
    document.getElementById('btn-drop-toad').addEventListener('click', () => {
        if (state.toadEgg.userData.inPot) return;
        
        state.toadEgg.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.toadEgg.userData.velocity.set(0, -2, 0);
        state.toadEgg.userData.isGrabbed = false;
        state.toadEgg.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Drop Fly Amanita
    document.getElementById('btn-drop-mushroom').addEventListener('click', () => {
        if (state.flyAmanita.userData.inPot) return;

        state.flyAmanita.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.flyAmanita.userData.velocity.set(0, -2, 0);
        state.flyAmanita.userData.isGrabbed = false;
        state.flyAmanita.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Drop Bat Wing
    document.getElementById('btn-drop-wing').addEventListener('click', () => {
        if (state.batWing.userData.inPot) return;

        state.batWing.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.batWing.userData.velocity.set(0, -2, 0);
        state.batWing.userData.isGrabbed = false;
        state.batWing.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Drop Swamp Slime
    document.getElementById('btn-drop-slime').addEventListener('click', () => {
        if (state.swampSlime.userData.inPot) return;

        state.swampSlime.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.swampSlime.userData.velocity.set(0, -2, 0);
        state.swampSlime.userData.isGrabbed = false;
        state.swampSlime.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Drop Phoenix Ash
    document.getElementById('btn-drop-ash').addEventListener('click', () => {
        if (state.phoenixAsh.userData.inPot) return;

        state.phoenixAsh.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.phoenixAsh.userData.velocity.set(0, -2, 0);
        state.phoenixAsh.userData.isGrabbed = false;
        state.phoenixAsh.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Drop Mandrake Root
    document.getElementById('btn-drop-root').addEventListener('click', () => {
        if (state.mandrakeRoot.userData.inPot) return;

        state.mandrakeRoot.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.mandrakeRoot.userData.velocity.set(0, -2, 0);
        state.mandrakeRoot.userData.isGrabbed = false;
        state.mandrakeRoot.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Reset simulation states
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
}

export function resetSimulation() {
    state.activeSpell = null;
    state.gravityActive = true;
    state.timeScale = 1.0;
    state.targetCameraGroupScale.set(1, 1, 1);
    state.targetCameraGroupY = 0;
    state.ingredientsInPot.length = 0;

    // Reset all 6 ingredients
    state.ingredients.forEach(item => {
        item.visible = true;
        item.scale.set(1, 1, 1);
        item.position.copy(item.userData.initialPos);
        item.userData.velocity.set(0, 0, 0);
        item.userData.inPot = false;
        item.userData.onTable = true;
        item.rotation.set(0, 0, 0);
    });

    // Restore original materials if meshes are in wireframe mode
    state.scene.traverse(child => {
        if (child.isMesh && child.userData.originalMaterial) {
            child.material = child.userData.originalMaterial;
            child.userData.originalMaterial = null;
        }
    });

    // Clean up existing alchemical particles
    if (state.particleSystem) {
        state.scene.remove(state.particleSystem);
        state.particleSystem = null;
    }

    // Clean up cosmic space particles
    if (state.starfieldSystem) {
        state.scene.remove(state.starfieldSystem);
        state.starfieldSystem = null;
    }
    state.scene.background = new THREE.Color(0x0e0813);

    // Restore HUD values
    const badges = [
        { id: "status-toad", label: "Missing" },
        { id: "status-mushroom", label: "Missing" },
        { id: "status-wing", label: "Missing" },
        { id: "status-slime", label: "Missing" },
        { id: "status-ash", label: "Missing" },
        { id: "status-root", label: "Missing" }
    ];
    badges.forEach(b => {
        const el = document.getElementById(b.id);
        if (el) {
            el.innerText = b.label;
            el.className = "hud-value status-badge status-missing";
        }
    });

    const cauldronHUD = document.getElementById("status-cauldron");
    if (cauldronHUD) {
        cauldronHUD.innerText = "Inactive";
        cauldronHUD.className = "hud-value";
        cauldronHUD.style.color = "#ff6347";
    }

    // Restore fluid color
    state.fluidMaterial.color.setHex(0x4a0e80);
    state.fluidMaterial.emissive.setHex(0x240046);
    if (state.cauldron && state.cauldron.userData.light) {
        state.cauldron.userData.light.color.setHex(0x7b2cbf);
    }

    showFlashMessage("Witch's Cauldron reset successfully.");
    state.controls.target.set(0, 0.8, -1.2);
}
