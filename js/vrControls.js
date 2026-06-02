import * as THREE from 'three';
import { state } from './state.js';
import { showFlashMessage, activateSpell } from './spells.js';
import { updateTomeDisplay } from './discovery.js';

// --- 1. VR Setup & Controller Initialization ---
export function initVRControllers() {
    // Setup two WebXR Controllers for laser interaction
    for (let i = 0; i < 2; i++) {
        const controller = state.renderer.xr.getController(i);
        
        // Add event listeners for grab actions (Trigger button mappings)
        controller.addEventListener('selectstart', onSelectStart);
        controller.addEventListener('selectend', onSelectEnd);

        // Add event listeners for teleport actions (Squeeze button mappings)
        controller.addEventListener('squeezestart', onSqueezeStart);
        controller.addEventListener('squeezeend', onSqueezeEnd);

        state.cameraGroup.add(controller);
        state.controllers.push(controller);

        // Add a simple laser pointer visual ray
        const pointerGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1) // extends 1m straight ahead
        ]);
        const pointerMat = new THREE.LineBasicMaterial({
            color: 0x8a2be2,
            transparent: true,
            opacity: 0.5
        });
        const pointer = new THREE.Line(pointerGeo, pointerMat);
        pointer.name = "laser";
        pointer.scale.z = 5.0; // scale to 5 meters range visualizer
        controller.add(pointer);

        // Create a controller velocity tracker instance
        const tracker = {
            controller: controller,
            history: [] // stores { position: Vector3, time: number }
        };
        state.controllerTrackers.push(tracker);

        // Create teleport visualizer line and target marker ring for this controller
        const arcGeo = new THREE.BufferGeometry();
        const arcMat = new THREE.LineBasicMaterial({ color: 0x39ff14, linewidth: 2 });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        arcLine.visible = false;
        state.scene.add(arcLine);
        state.teleportArcs.push(arcLine);

        const ringGeo = new THREE.RingGeometry(0.25, 0.3, 32);
        ringGeo.rotateX(-Math.PI / 2); // align flat on the floor
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x39ff14, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.visible = false;
        state.scene.add(ringMesh);
        state.teleportMarkers.push(ringMesh);
    }
}

// --- 2. Interaction 1: Grab and Throw Functionality ---
export function initGrabInteraction() {
    console.log("Grab and Throw Interaction Initialized.");
}

export function checkGrabSelection(controller) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).normalize();
    raycaster.far = 0.8;

    const intersects = raycaster.intersectObjects(state.ingredients, true);
    if (intersects.length > 0) {
        let selected = intersects[0].object;
        while (selected.parent && !selected.userData.name) {
            selected = selected.parent;
        }
        return selected;
    }
    return null;
}

export function grabObject(controller, object) {
    if (object.userData.isGrabbed) {
        const prevController = object.userData.grabbedBy;
        if (prevController) {
            releaseObject(prevController, object, false); // force quiet release
        }
    }

    object.userData.isGrabbed = true;
    object.userData.grabbedBy = controller;
    object.userData.velocity.set(0, 0, 0); // clear velocities

    controller.attach(object);

    const laser = controller.getObjectByName("laser");
    if (laser) laser.material.color.setHex(0xff00ff);
}

export function releaseObject(controller, object, applyVelocity = true) {
    state.scene.attach(object);

    object.userData.isGrabbed = false;
    object.userData.grabbedBy = null;

    if (applyVelocity) {
        const trackerIndex = state.controllers.indexOf(controller);
        if (trackerIndex !== -1) {
            const velocity = getControllerVelocity(state.controllerTrackers[trackerIndex]);
            velocity.clampLength(0, 15);
            object.userData.velocity.copy(velocity);
        }
    } else {
        object.userData.velocity.set(0, 0, 0);
    }

    const laser = controller.getObjectByName("laser");
    if (laser) laser.material.color.setHex(0x8a2be2);
}

export function updateControllerVelocityTracker(tracker) {
    const currentPosition = new THREE.Vector3();
    currentPosition.setFromMatrixPosition(tracker.controller.matrixWorld);
    
    tracker.history.push({
        position: currentPosition,
        time: performance.now()
    });

    if (tracker.history.length > 8) {
        tracker.history.shift();
    }
}

export function getControllerVelocity(tracker) {
    if (tracker.history.length < 2) return new THREE.Vector3();

    const oldest = tracker.history[0];
    const newest = tracker.history[tracker.history.length - 1];
    
    const dt = (newest.time - oldest.time) / 1000;
    if (dt <= 0.001) return new THREE.Vector3();

    const velocity = new THREE.Vector3();
    velocity.subVectors(newest.position, oldest.position).divideScalar(dt);
    
    velocity.y += 0.5;

    return velocity;
}

export function onSelectStart(event) {
    const controller = event.target;
    const targetObject = checkGrabSelection(controller);
    if (targetObject && !targetObject.userData.inPot) {
        grabObject(controller, targetObject);
    }
}

export function onSelectEnd(event) {
    const controller = event.target;
    state.ingredients.forEach(item => {
        if (item.userData.grabbedBy === controller) {
            releaseObject(controller, item);
        }
    });
}

// --- 3. Interaction 2: Arc Teleportation Navigation ---
export function onSqueezeStart(event) {
    const controller = event.target;
    if (!state.activeTeleportController) {
        state.activeTeleportController = controller;
        controller.userData.isTeleporting = true;
    }
}

export function onSqueezeEnd(event) {
    const controller = event.target;
    if (state.activeTeleportController === controller) {
        controller.userData.isTeleporting = false;
        
        const idx = state.controllers.indexOf(controller);
        const marker = state.teleportMarkers[idx];
        
        if (marker.visible) {
            const destination = new THREE.Vector3();
            destination.copy(marker.position);
            teleportPlayer(destination);
        }

        state.teleportArcs[idx].visible = false;
        marker.visible = false;
        state.activeTeleportController = null;
    }
}

export function drawTeleportArc(controller) {
    const idx = state.controllers.indexOf(controller);
    const arcLine = state.teleportArcs[idx];
    const marker = state.teleportMarkers[idx];

    const p0 = new THREE.Vector3();
    p0.setFromMatrixPosition(controller.matrixWorld);

    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    const dir = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix).normalize();

    const initialVelocity = 6.5; 
    const v0 = dir.multiplyScalar(initialVelocity);

    const points = [];
    const pos = new THREE.Vector3().copy(p0);
    const velocity = new THREE.Vector3().copy(v0);
    const dt = 0.035; 
    const arcGravity = -9.8;

    let hitPoint = null;

    for (let i = 0; i < 40; i++) {
        points.push(pos.clone());

        pos.addScaledVector(velocity, dt);
        velocity.y += arcGravity * dt;

        if (pos.y <= state.FLOOR_LEVEL) {
            const prevPos = points[points.length - 1];
            const t = (state.FLOOR_LEVEL - prevPos.y) / (pos.y - prevPos.y);
            const exactHit = new THREE.Vector3().lerpVectors(prevPos, pos, t);
            exactHit.y = state.FLOOR_LEVEL;
            
            points.push(exactHit);
            hitPoint = exactHit;
            break;
        }
    }

    arcLine.geometry.dispose();
    arcLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    arcLine.visible = true;

    if (hitPoint) {
        marker.position.copy(hitPoint).y += 0.01; 
        marker.visible = true;
    } else {
        marker.visible = false;
    }
}

export function teleportPlayer(targetVector) {
    const cameraWorldPos = new THREE.Vector3();
    state.camera.getWorldPosition(cameraWorldPos);
    
    const cameraOffset = new THREE.Vector3();
    cameraOffset.subVectors(cameraWorldPos, state.cameraGroup.position);
    cameraOffset.y = 0;
    state.cameraGroup.position.copy(targetVector).sub(cameraOffset);
    
    showFlashMessage("Teleported!");
}

// --- 4. Game Logic & Trigger Functions ---
export function checkCauldronCollision() {
    state.ingredients.forEach(item => {
        if (item.userData.inPot || item.userData.isGrabbed) return;

        const cauldronTopY = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT;
        
        const itemPos = new THREE.Vector3();
        item.getWorldPosition(itemPos);

        const horizontalDist = Math.sqrt(
            Math.pow(itemPos.x - state.CAULDRON_POS.x, 2) +
            Math.pow(itemPos.z - state.CAULDRON_POS.z, 2)
        );

        if (itemPos.y <= cauldronTopY + 0.05 && itemPos.y >= state.CAULDRON_POS.y && horizontalDist <= state.CAULDRON_RADIUS * 0.85) {
            addIngredientToPot(item.userData.name);
        }
    });
}

export function addIngredientToPot(ingredientName) {
    if (state.ingredientsInPot.includes(ingredientName)) return; 
    state.ingredientsInPot.push(ingredientName);
    
    const item = state.ingredients.find(i => i.userData.name === ingredientName);
    if (item) {
        item.userData.inPot = true;
        item.userData.velocity.set(0, 0, 0);
        fadeOutIngredientIntoLiquid(item);
    }

    let badgeId = "";
    if (ingredientName === "Toad Egg") badgeId = "status-toad";
    else if (ingredientName === "Fly Amanita") badgeId = "status-mushroom";
    else if (ingredientName === "Bat Wing") badgeId = "status-wing";
    else if (ingredientName === "Swamp Slime") badgeId = "status-slime";
    else if (ingredientName === "Phoenix Ash") badgeId = "status-ash";
    else if (ingredientName === "Mandrake Root") badgeId = "status-root";

    if (badgeId) {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.innerText = "Added";
            badge.className = "hud-value status-badge status-added";
        }
    }

    showFlashMessage(`${ingredientName} added to the pot!`);

    if (state.cauldron && state.cauldron.userData.light) {
        state.cauldron.userData.light.intensity = 20.0;
        state.cauldron.userData.light.color.setHex(0x9d4edd);
    }

    checkRecipe();
}

export function checkRecipe() {
    const uniqueItems = Array.from(new Set(state.ingredientsInPot));
    if (uniqueItems.length === 2) {
        const itemA = uniqueItems[0];
        const itemB = uniqueItems[1];
        if (state.discoveryManager) {
            const recipe = state.discoveryManager.evaluateCombination(itemA, itemB);
            if (recipe) {
                updateTomeDisplay();
                activateSpell(recipe);
            }
        }
    } else {
        const activeCount = state.ingredientsInPot.length;
        const cauldronHUD = document.getElementById("status-cauldron");
        if (cauldronHUD) {
            cauldronHUD.innerText = `${activeCount} / 2 Ingredients`;
            cauldronHUD.style.color = "#d8bfd8";
            cauldronHUD.className = "hud-value";
        }
    }
}

export function fadeOutIngredientIntoLiquid(mesh) {
    const duration = 800; 
    const startScale = mesh.scale.clone();
    const startTime = performance.now();

    function shrinkLoop() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        
        mesh.scale.copy(startScale).multiplyScalar(1.0 - progress);
        mesh.position.y -= 0.003;

        if (progress < 1.0) {
            requestAnimationFrame(shrinkLoop);
        } else {
            mesh.visible = false; 
        }
    }
    shrinkLoop();
}
