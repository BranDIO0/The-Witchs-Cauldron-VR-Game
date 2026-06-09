import * as THREE from 'three';
import { state } from './state.js';
import { showFlashMessage, resetSimulation } from './spells.js';
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

    // Check if player clicked the 3D reset button on the table
    if (state.resetRune) {
        const resetIntersects = state.raycasterDesktop.intersectObject(state.resetRune, true);
        if (resetIntersects.length > 0) {
            resetSimulation();
            return;
        }
    }

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

    // Drop Moonflower
    document.getElementById('btn-drop-moonflower').addEventListener('click', () => {
        if (state.moonflower.userData.inPot) return;

        state.moonflower.position.set(state.CAULDRON_POS.x, state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 0.6, state.CAULDRON_POS.z);
        state.moonflower.userData.velocity.set(0, -2, 0);
        state.moonflower.userData.isGrabbed = false;
        state.moonflower.userData.onTable = false;
        state.controls.target.copy(state.CAULDRON_POS);
    });

    // Reset simulation states
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
}

