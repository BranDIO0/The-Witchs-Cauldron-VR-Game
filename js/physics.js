import * as THREE from 'three';
import { state } from './state.js';

// --- Custom Physics Simulation Engine ---
export function updatePhysics(dt) {
    // Apply simple custom kinematics to objects not currently grabbed
    state.ingredients.forEach(item => {
        if (item.userData.inPot) return;

        if (item.userData.isGrabbed) {
            item.userData.onTable = false;
            return; // skip physics calculation if controller has ownership
        }

        const pos = item.position;
        const vel = item.userData.velocity;

        if (state.gravityActive) {
            // --- Normal Gravity Physics ---
            // Apply downward gravity acceleration
            vel.y += state.gravity * dt;

            // Update translation vectors
            pos.addScaledVector(vel, dt);

            // Floor Collision boundary
            const itemFloorLimit = state.FLOOR_LEVEL + item.userData.radius;
            if (pos.y < itemFloorLimit) {
                pos.y = itemFloorLimit;
                vel.y = -vel.y * 0.4; // Bounce restitution
                vel.x *= 0.7; // Friction damping
                vel.z *= 0.7;
            }

            // Table Collision boundary (Table surface bounds calculation)
            const tableTop = state.TABLE_HEIGHT;
            const halfW = state.TABLE_WIDTH / 2;
            const halfD = state.TABLE_DEPTH / 2;

            // Check bounds alignment relative to Table position
            const withinTableX = pos.x >= state.TABLE_POS.x - halfW && pos.x <= state.TABLE_POS.x + halfW;
            const withinTableZ = pos.z >= state.TABLE_POS.z - halfD && pos.z <= state.TABLE_POS.z + halfD;

            if (withinTableX && withinTableZ) {
                const tableSurfaceY = tableTop + item.userData.radius - 0.05; // slight mesh anchor offset
                
                // If item is falling down and hits the table top
                if (pos.y <= tableSurfaceY && vel.y < 0) {
                    pos.y = tableSurfaceY;
                    vel.y = -vel.y * 0.3; // bounce
                    vel.x *= 0.6; // friction damping
                    vel.z *= 0.6;
                    item.userData.onTable = true;
                }
            } else {
                item.userData.onTable = false;
            }

            // Cauldron outer shell collision (basic cylinder boundary push)
            const distToCauldronXZ = Math.sqrt(
                Math.pow(pos.x - state.CAULDRON_POS.x, 2) +
                Math.pow(pos.z - state.CAULDRON_POS.z, 2)
            );
            
            const cauldronTopY = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT;
            // Only collide and bounce off the outer shell if we are outside the inner radius
            // This allows items falling down into the middle to bypass this outward bounce!
            if (distToCauldronXZ < state.CAULDRON_RADIUS + item.userData.radius && 
                distToCauldronXZ > state.CAULDRON_RADIUS * 0.8 && 
                pos.y < cauldronTopY) {
                
                // calculate normal vector pushing out
                const pushNormal = new THREE.Vector3(pos.x - state.CAULDRON_POS.x, 0, pos.z - state.CAULDRON_POS.z).normalize();
                pos.x = state.CAULDRON_POS.x + pushNormal.x * (state.CAULDRON_RADIUS + item.userData.radius);
                pos.z = state.CAULDRON_POS.z + pushNormal.z * (state.CAULDRON_RADIUS + item.userData.radius);
                
                // Bounce velocities outwards
                const speed = Math.sqrt(vel.x*vel.x + vel.z*vel.z);
                vel.x = pushNormal.x * speed * 0.5;
                vel.z = pushNormal.z * speed * 0.5;
            }

        } else {
            // --- Showstopper Antigravity Physics Mode ---
            // Decelerate initial velocities to complete weightlessness drift
            vel.multiplyScalar(0.95);
            pos.addScaledVector(vel, dt);

            // Progressive upward float translation with the requested formula
            pos.y += 0.003 * state.timeScale;
            pos.y += Math.sin(Date.now() * 0.002) * 0.005 * state.timeScale;

            // Gentle circular floating rotation wobble for premium magic visual feel
            const floatWobbleTime = performance.now() * 0.001;
            pos.x += Math.sin(floatWobbleTime + item.id) * 0.0015 * state.timeScale;
            pos.z += Math.cos(floatWobbleTime + item.id) * 0.0015 * state.timeScale;
            
            item.rotation.x += 0.002 * state.timeScale;
            item.rotation.y += 0.004 * state.timeScale;

            // If items float above room ceiling (3.2m), wrap them back to the table level
            if (pos.y > 3.2 || pos.y < 0.1) {
                pos.y = state.TABLE_HEIGHT + 0.1;
                pos.x = item.userData.initialPos.x + (Math.random() - 0.5) * 0.2;
                pos.z = item.userData.initialPos.z + (Math.random() - 0.5) * 0.2;
                vel.set(0,0,0);
            }
        }
    });

    // 2. Float environment props during Antigravity
    state.floatingProps.forEach(item => {
        if (!state.gravityActive) {
            // Update float progress
            item.userData.currentFloat = Math.min(item.userData.currentFloat + dt * 0.4, item.userData.maxFloat);
            const time = performance.now() * 0.001 * item.userData.floatSpeed + item.userData.floatOffset;
            
            // Floating translation
            item.position.y = item.userData.originalPosition.y + item.userData.currentFloat + Math.sin(time * 1.5) * 0.06 * state.timeScale;
            item.position.x = item.userData.originalPosition.x + Math.sin(time * 0.8) * 0.04 * state.timeScale;
            item.position.z = item.userData.originalPosition.z + Math.cos(time * 0.7) * 0.04 * state.timeScale;
            
            // Wobble rotation
            item.rotation.x = item.userData.originalRotation.x + Math.sin(time * 0.5) * 0.12 * state.timeScale;
            item.rotation.y = item.userData.originalRotation.y + Math.cos(time * 0.6) * 0.12 * state.timeScale;
            item.rotation.z = item.userData.originalRotation.z + Math.sin(time * 0.4) * 0.12 * state.timeScale;
        } else {
            // Return back to original position
            if (item.userData.currentFloat > 0.0) {
                item.userData.currentFloat = Math.max(item.userData.currentFloat - dt * 1.5, 0.0);
                
                // Lerp back to base
                item.position.y = THREE.MathUtils.lerp(item.position.y, item.userData.originalPosition.y, 6 * dt);
                item.position.x = THREE.MathUtils.lerp(item.position.x, item.userData.originalPosition.x, 6 * dt);
                item.position.z = THREE.MathUtils.lerp(item.position.z, item.userData.originalPosition.z, 6 * dt);
                
                item.rotation.x = THREE.MathUtils.lerp(item.rotation.x, item.userData.originalRotation.x, 6 * dt);
                item.rotation.y = THREE.MathUtils.lerp(item.rotation.y, item.userData.originalRotation.y, 6 * dt);
                item.rotation.z = THREE.MathUtils.lerp(item.rotation.z, item.userData.originalRotation.z, 6 * dt);
            } else {
                // Snap exactly to prevent tiny drift accumulation
                item.position.copy(item.userData.originalPosition);
                item.rotation.copy(item.userData.originalRotation);
            }
        }
    });
}
