import * as THREE from 'three';
import { state } from './state.js';
import { showFlashMessage, activateSpell, triggerHapticFeedback, resetSimulation } from './spells.js';
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

        // Setup connected/disconnected event listeners to add/remove procedural witch hands
        controller.addEventListener('connected', (event) => {
            const inputSource = event.data;
            if (inputSource.targetRayMode === 'tracked-pointer') {
                const handedness = inputSource.handedness || 'right';
                // Remove existing if any
                if (controller.userData.handMesh) {
                    controller.remove(controller.userData.handMesh);
                }
                const hand = createHandMesh(handedness);
                controller.add(hand.mesh);
                controller.userData.handMesh = hand.mesh;
                controller.userData.handPivots = hand.pivots;
                controller.userData.thumbPivot = hand.thumbPivot;
                controller.userData.handedness = handedness;
                controller.userData.isGrabbing = false;
            }
        });

        controller.addEventListener('disconnected', () => {
            if (controller.userData.handMesh) {
                controller.remove(controller.userData.handMesh);
                controller.userData.handMesh = null;
                controller.userData.handPivots = null;
                controller.userData.thumbPivot = null;
            }
        });

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
            prevController.userData.isGrabbing = false; // Reset the other hand's visual state
        }
    }

    object.userData.isGrabbed = true;
    object.userData.grabbedBy = controller;
    object.userData.velocity.set(0, 0, 0); // clear velocities

    controller.attach(object);
    controller.userData.isGrabbing = true; // Visual grab trigger

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

export function checkResetRuneSelection(controller) {
    if (!state.resetRune) return false;
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).normalize();
    raycaster.far = 3.0; // allow comfortable distance to point and click from standing position!

    const intersects = raycaster.intersectObject(state.resetRune, true);
    return intersects.length > 0;
}

export function onSelectStart(event) {
    const controller = event.target;
    controller.userData.isGrabbing = true; // Visual grab feedback start
    
    // Check if player triggered the Reset Rune in VR
    if (checkResetRuneSelection(controller)) {
        resetSimulation();
        showFlashMessage("Cauldron Cleared!");
        triggerHapticFeedback(150, 0.8);
        return;
    }

    const targetObject = checkGrabSelection(controller);
    if (targetObject && !targetObject.userData.inPot) {
        grabObject(controller, targetObject);
    }
}

export function onSelectEnd(event) {
    const controller = event.target;
    controller.userData.isGrabbing = false; // Visual grab feedback end
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
        // Clamp targeted teleport location inside the hut walls
        hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, -3.3, 3.3);
        hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, -3.8, 2.8);
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

    // Clamp cameraGroup position inside the hut walls
    const clampedTarget = targetVector.clone();
    clampedTarget.x = THREE.MathUtils.clamp(clampedTarget.x, -3.3, 3.3);
    clampedTarget.z = THREE.MathUtils.clamp(clampedTarget.z, -3.8, 2.8);

    state.cameraGroup.position.copy(clampedTarget).sub(cameraOffset);
    
    showFlashMessage("Teleported!");
}

// --- 4. Game Logic & Trigger Functions ---
export function checkCauldronCollision() {
    state.ingredients.forEach(item => {
        if (item.userData.inPot || item.userData.isGrabbed) return;
        if (item.name === "MagicTome") return;

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
    }

    let badgeId = "";
    if (ingredientName === "Toad Egg") badgeId = "status-toad";
    else if (ingredientName === "Fly Amanita") badgeId = "status-mushroom";
    else if (ingredientName === "Bat Wing") badgeId = "status-wing";
    else if (ingredientName === "Swamp Slime") badgeId = "status-slime";
    else if (ingredientName === "Phoenix Ash") badgeId = "status-ash";
    else if (ingredientName === "Mandrake Root") badgeId = "status-root";
    else if (ingredientName === "Moonflower") badgeId = "status-moonflower";

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

// Legacy fadeOut removed, handled inside ingredients.js frame-rate independently

// --- Procedural Witch Hand Model Generator ---
function createHandMesh(handedness) {
    const group = new THREE.Group();
    group.name = "handModel";

    // Witch-green semi-transparent glow material
    const handMaterial = new THREE.MeshStandardMaterial({
        color: 0x2bf060, // witch green
        emissive: 0x092b12, // dark green emissive glow
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
    });

    // Palm
    const palmGeo = new THREE.BoxGeometry(0.04, 0.012, 0.045);
    const palm = new THREE.Mesh(palmGeo, handMaterial);
    palm.position.set(0, -0.005, -0.0225);
    group.add(palm);

    // Fingers
    const pivots = [];
    // 4 fingers (index, middle, ring, pinky)
    for (let i = 0; i < 4; i++) {
        const pivot = new THREE.Group();
        const xPos = -0.015 + i * 0.01;
        pivot.position.set(xPos, -0.002, -0.045);
        
        // Vary finger lengths for realism
        const fingerLength = (i === 1) ? 0.03 : (i === 2 ? 0.028 : (i === 0 ? 0.026 : 0.022));
        const fingerGeo = new THREE.BoxGeometry(0.007, 0.007, fingerLength);
        const fingerMesh = new THREE.Mesh(fingerGeo, handMaterial);
        fingerMesh.position.set(0, 0, -fingerLength / 2);
        
        pivot.add(fingerMesh);
        group.add(pivot);
        pivots.push(pivot);
    }

    // Thumb
    const thumbPivot = new THREE.Group();
    const isLeft = (handedness === 'left');
    thumbPivot.position.set(isLeft ? 0.022 : -0.022, -0.002, -0.015);
    thumbPivot.rotation.y = isLeft ? -Math.PI / 4 : Math.PI / 4;
    
    const thumbGeo = new THREE.BoxGeometry(0.007, 0.007, 0.02);
    const thumbMesh = new THREE.Mesh(thumbGeo, handMaterial);
    thumbMesh.position.set(0, 0, -0.01);
    
    thumbPivot.add(thumbMesh);
    group.add(thumbPivot);

    // Position hand group slightly offset from controller tracking origin
    group.position.set(0, -0.015, 0.01);

    return {
        mesh: group,
        pivots: pivots,
        thumbPivot: thumbPivot
    };
}

// --- Smooth Hand Animation Update Loop ---
export function updateVRHands(dt) {
    state.controllers.forEach(controller => {
        if (!controller.userData.handMesh || !controller.userData.handPivots) return;

        const isGrabbing = !!controller.userData.isGrabbing;
        const handedness = controller.userData.handedness;
        const pivots = controller.userData.handPivots;
        const thumbPivot = controller.userData.thumbPivot;

        // Target rotations:
        // Relaxed state has a tiny curl.
        // Grabbed state curled in ~1.2 rad.
        const targetFingerRotX = isGrabbing ? 1.2 : 0.1;
        const targetThumbRotX = isGrabbing ? 0.8 : 0.1;
        const targetThumbRotY = isGrabbing 
            ? (handedness === 'left' ? 0.4 : -0.4) 
            : (handedness === 'left' ? -Math.PI / 4 : Math.PI / 4);

        // Smoothly lerp towards target rotations
        pivots.forEach((pivot, idx) => {
            const individualOffset = isGrabbing ? (idx * 0.05) : 0;
            pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, targetFingerRotX + individualOffset, 12 * dt);
        });

        if (thumbPivot) {
            thumbPivot.rotation.x = THREE.MathUtils.lerp(thumbPivot.rotation.x, targetThumbRotX, 12 * dt);
            thumbPivot.rotation.y = THREE.MathUtils.lerp(thumbPivot.rotation.y, targetThumbRotY, 12 * dt);
        }
    });
}
