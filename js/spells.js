import * as THREE from 'three';
import { state } from './state.js';

export function showFlashMessage(text) {
    if (state.msgBanner) {
        state.msgBanner.innerText = text;
        state.msgBanner.style.opacity = 1;
        
        // Auto-fade after 4.5 seconds
        if (state.msgBanner.timeoutId) {
            clearTimeout(state.msgBanner.timeoutId);
        }
        state.msgBanner.timeoutId = setTimeout(() => {
            state.msgBanner.style.opacity = 0;
        }, 4500);
    }
}

export function triggerHapticFeedback(duration = 150, intensity = 1.0) {
    if (!state.renderer || !state.renderer.xr.isPresenting) return;
    const session = state.renderer.xr.getSession();
    if (!session) return;
    for (const source of session.inputSources) {
        if (source.gamepad && source.gamepad.hapticActuators && source.gamepad.hapticActuators.length > 0) {
            source.gamepad.hapticActuators[0].pulse(intensity, duration);
        }
    }
}

export function activateSpell(recipe) {
    state.activeSpell = recipe.effect;
    state.spellProgress = 0;

    const cauldronHUD = document.getElementById("status-cauldron");
    if (cauldronHUD) {
        cauldronHUD.innerText = recipe.potionName;
        cauldronHUD.className = "hud-value status-badge status-complete";
        cauldronHUD.style.color = "#39ff14";
    }

    showFlashMessage(`Spell Unleashed: ${recipe.potionName}!`);

    // Light & Color transition targets
    if (state.cauldron && state.cauldron.userData.light) {
        state.cauldron.userData.light.intensity = 25;
        state.cauldron.userData.light.color.setHex(recipe.color);
    }

    // Clean up existing particle systems
    if (state.particleSystem) {
        state.scene.remove(state.particleSystem);
        state.particleSystem = null;
    }

    // Restore original materials if exiting wireframe matrix mode
    state.scene.traverse(child => {
        if (child.isMesh && child.userData.originalMaterial) {
            child.material = child.userData.originalMaterial;
            child.userData.originalMaterial = null;
        }
    });

    // Restore cosmic starfield defaults if active
    if (state.starfieldSystem) {
        state.scene.remove(state.starfieldSystem);
        state.starfieldSystem = null;
    }
    state.scene.background = new THREE.Color(0x0e0813);

    // Vibration pulse
    triggerHapticFeedback(200, 1.0);

    // Re-apply alchemical states (clear defaults first)
    state.gravityActive = true;
    state.timeScale = 1.0;
    state.targetCameraGroupScale.set(1, 1, 1);
    state.targetCameraGroupY = 0.0;

    // Reset love filter overlay
    const loveFilter = document.getElementById('love-filter');
    if (loveFilter) {
        loveFilter.style.opacity = 0;
    }

    if (recipe.effect === "ANTIGRAVITY") {
        state.gravityActive = false;
        createAntigravityParticles();
    } else if (recipe.effect === "TIME_DILATION") {
        state.timeScale = 0.15;
    } else if (recipe.effect === "SHRINKING") {
        state.targetCameraGroupScale.set(3, 3, 3);
        state.targetCameraGroupY = -3.2; // Lower to keep eyes near table
    } else if (recipe.effect === "INFERNO_VORTEX") {
        createInfernoParticles();
    } else if (recipe.effect === "COSMIC_STARFIELD") {
        state.scene.background = new THREE.Color(0x000000);
        createStarfieldParticles();
    } else if (recipe.effect === "WIREFRAME_MATRIX") {
        state.scene.traverse(child => {
            // Traverse all meshes in the scene, skip Tome plane UI and Controller pointer rays
            if (child.isMesh && child.name !== "MagicTome" && child.name !== "laser") {
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material;
                }
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true
                });
            }
        });
    } else if (recipe.effect === "SLUDGE") {
        createSludgeParticles();
    } else if (recipe.effect === "LOVE_MIX") {
        if (loveFilter) {
            loveFilter.style.opacity = 1;
        }
        createLoveParticles();
    } else if (recipe.effect === "EXPLOSION_MIX") {
        // Trigger haptics
        triggerHapticFeedback(600, 1.0);
        
        // Start screen shake
        state.explosionShake = 1.0;

        // Flash screen orange-red
        const flash = document.getElementById('flash-overlay');
        if (flash) {
            flash.style.transition = 'none';
            flash.style.backgroundColor = '#ff3300';
            flash.style.opacity = 0.95;
            setTimeout(() => {
                flash.style.transition = 'opacity 1.2s ease-out';
                flash.style.opacity = 0;
            }, 60);
        }

        // Burnt fluid look
        state.fluidMaterial.color.setHex(0x111111);
        state.fluidMaterial.emissive.setHex(0x000000);
        if (state.cauldron && state.cauldron.userData.light) {
            state.cauldron.userData.light.intensity = 0.0;
        }

        // Explode ingredients
        state.ingredients.forEach(item => {
            item.visible = true;
            item.scale.set(1, 1, 1);
            item.position.copy(state.CAULDRON_POS).y += state.CAULDRON_HEIGHT + 0.1;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 3.5;
            item.userData.velocity.set(
                Math.cos(angle) * speed,
                3.5 + Math.random() * 4.0,
                Math.sin(angle) * speed
            );
            item.userData.inPot = false;
            item.userData.onTable = false;
        });
        state.ingredientsInPot.length = 0;

        // Clear HUD status badges
        const badgeIds = ["status-toad", "status-mushroom", "status-wing", "status-slime", "status-ash", "status-root", "status-moonflower"];
        badgeIds.forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                badge.innerText = "Missing";
                badge.className = "hud-value status-badge status-missing";
            }
        });
    }
}

export function createAntigravityParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (state.CAULDRON_RADIUS * 0.8);
        const x = state.CAULDRON_POS.x + Math.cos(angle) * radius;
        const y = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
        const z = state.CAULDRON_POS.z + Math.sin(angle) * radius;

        positions.push(x, y, z);
        
        velocities.push(
            (Math.random() - 0.5) * 0.15, // vx
            0.3 + Math.random() * 0.4,    // vy
            (Math.random() - 0.5) * 0.15  // vz
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(57,255,20,0.8)');
    grad.addColorStop(1, 'rgba(57,255,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.1,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    state.particleSystem = new THREE.Points(geometry, material);
    state.scene.add(state.particleSystem);
    state.particleSystem.userData = { velocities: velocities };
}

export function updateAntigravityParticles(dt) {
    if (!state.particleSystem) return;

    const posArr = state.particleSystem.geometry.attributes.position.array;
    const vel = state.particleSystem.userData.velocities;
    
    for (let i = 0; i < posArr.length; i += 3) {
        posArr[i] += vel[i] * dt;
        posArr[i+1] += vel[i+1] * dt;
        posArr[i+2] += vel[i+2] * dt;

        posArr[i] += Math.sin(performance.now() * 0.005 + i) * 0.002;

        if (posArr[i+1] > 3.0) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (state.CAULDRON_RADIUS * 0.8);
            posArr[i] = state.CAULDRON_POS.x + Math.cos(angle) * radius;
            posArr[i+1] = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
            posArr[i+2] = state.CAULDRON_POS.z + Math.sin(angle) * radius;
        }
    }

    state.particleSystem.geometry.attributes.position.needsUpdate = true;
}

export function createInfernoParticles() {
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    state.particleData = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * state.CAULDRON_RADIUS * 0.7;
        const y = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;

        positions.push(
            state.CAULDRON_POS.x + Math.sin(angle) * radius,
            y,
            state.CAULDRON_POS.z + Math.cos(angle) * radius
        );

        state.particleData.push({
            angle: angle,
            radius: radius,
            y: y,
            speedY: 0.6 + Math.random() * 0.8,
            speedAngle: 3.0 + Math.random() * 4.0,
            initialRadius: radius
        });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 230, 150, 1)');
    grad.addColorStop(0.3, 'rgba(255, 69, 0, 0.8)');
    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.12,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    state.particleSystem = new THREE.Points(geometry, material);
    state.scene.add(state.particleSystem);
}

export function updateInfernoParticles(dt) {
    if (!state.particleSystem) return;

    const posArr = state.particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < state.particleData.length; i++) {
        const data = state.particleData[i];

        data.angle += data.speedAngle * dt;
        data.y += data.speedY * dt;

        const progress = (data.y - (state.CAULDRON_POS.y + state.CAULDRON_HEIGHT)) / 2.0;
        const currentRadius = data.initialRadius * (1.0 + progress * 1.5);

        const x = state.CAULDRON_POS.x + Math.sin(data.angle) * currentRadius;
        const z = state.CAULDRON_POS.z + Math.cos(data.angle) * currentRadius;

        posArr[i*3] = x;
        posArr[i*3+1] = data.y;
        posArr[i*3+2] = z;

        if (data.y > state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 2.0) {
            data.y = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
            data.angle = Math.random() * Math.PI * 2;
            data.initialRadius = Math.random() * state.CAULDRON_RADIUS * 0.7;
        }
    }

    state.particleSystem.geometry.attributes.position.needsUpdate = true;
}

export function createStarfieldParticles() {
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const speeds = [];

    // Spawn particles in a big zone surrounding the room
    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 8.0, // x
            Math.random() * 4.0,         // y
            (Math.random() - 0.5) * 8.0  // z
        );
        speeds.push(0.2 + Math.random() * 0.3); // speed Z
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(230, 240, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.05,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    state.starfieldSystem = new THREE.Points(geometry, material);
    state.scene.add(state.starfieldSystem);
    state.starfieldSystem.userData = { speeds: speeds };
}

export function updateStarfieldParticles(dt) {
    if (!state.starfieldSystem) return;

    const posArr = state.starfieldSystem.geometry.attributes.position.array;
    const speeds = state.starfieldSystem.userData.speeds;

    for (let i = 0; i < posArr.length; i += 3) {
        // drift stars forward on Z
        posArr[i + 2] += speeds[i / 3] * dt;

        // Wrap if they go past player
        if (posArr[i + 2] > 2.5) {
            posArr[i + 2] = -5.0; // reset far behind cauldron
            posArr[i] = (Math.random() - 0.5) * 8.0;
            posArr[i + 1] = Math.random() * 4.0;
        }
    }

    state.starfieldSystem.geometry.attributes.position.needsUpdate = true;
}

export function createSludgeParticles() {
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * state.CAULDRON_RADIUS * 0.7;
        const x = state.CAULDRON_POS.x + Math.cos(angle) * radius;
        const y = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
        const z = state.CAULDRON_POS.z + Math.sin(angle) * radius;

        positions.push(x, y, z);
        velocities.push(
            (Math.random() - 0.5) * 0.05, // vx
            0.1 + Math.random() * 0.2,    // vy
            (Math.random() - 0.5) * 0.05  // vz
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(120, 90, 70, 0.6)');
    grad.addColorStop(0.5, 'rgba(80, 70, 60, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.15,
        map: texture,
        transparent: true,
        depthWrite: false
    });

    state.particleSystem = new THREE.Points(geometry, material);
    state.scene.add(state.particleSystem);
    state.particleSystem.userData = { velocities: velocities };
}

export function updateSludgeParticles(dt) {
    if (!state.particleSystem) return;

    const posArr = state.particleSystem.geometry.attributes.position.array;
    const vel = state.particleSystem.userData.velocities;

    for (let i = 0; i < posArr.length; i += 3) {
        posArr[i] += vel[i] * dt;
        posArr[i+1] += vel[i+1] * dt;
        posArr[i+2] += vel[i+2] * dt;

        posArr[i] += Math.sin(performance.now() * 0.003 + i) * 0.001;

        if (posArr[i+1] > state.CAULDRON_POS.y + state.CAULDRON_HEIGHT + 1.2) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * state.CAULDRON_RADIUS * 0.7;
            posArr[i] = state.CAULDRON_POS.x + Math.cos(angle) * radius;
            posArr[i+1] = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
            posArr[i+2] = state.CAULDRON_POS.z + Math.sin(angle) * radius;
        }
    }

    state.particleSystem.geometry.attributes.position.needsUpdate = true;
}

export function drawHeart(ctx, x, y, width, height) {
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
}

export function createLoveParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (state.CAULDRON_RADIUS * 0.8);
        const x = state.CAULDRON_POS.x + Math.cos(angle) * radius;
        const y = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
        const z = state.CAULDRON_POS.z + Math.sin(angle) * radius;

        positions.push(x, y, z);
        
        velocities.push(
            (Math.random() - 0.5) * 0.12, // vx
            0.2 + Math.random() * 0.35,   // vy
            (Math.random() - 0.5) * 0.12  // vz
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(255, 20, 147, 1.0)'; // hot pink
    drawHeart(ctx, 16, 4, 20, 24);
    
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.15,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    state.particleSystem = new THREE.Points(geometry, material);
    state.scene.add(state.particleSystem);
    state.particleSystem.userData = { velocities: velocities };
}

export function updateLoveParticles(dt) {
    if (!state.particleSystem) return;

    const posArr = state.particleSystem.geometry.attributes.position.array;
    const vel = state.particleSystem.userData.velocities;
    
    for (let i = 0; i < posArr.length; i += 3) {
        posArr[i] += vel[i] * dt;
        posArr[i+1] += vel[i+1] * dt;
        posArr[i+2] += vel[i+2] * dt;

        posArr[i] += Math.sin(performance.now() * 0.004 + i) * 0.0015;

        if (posArr[i+1] > 3.0) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (state.CAULDRON_RADIUS * 0.8);
            posArr[i] = state.CAULDRON_POS.x + Math.cos(angle) * radius;
            posArr[i+1] = state.CAULDRON_POS.y + state.CAULDRON_HEIGHT - 0.02;
            posArr[i+2] = state.CAULDRON_POS.z + Math.sin(angle) * radius;
        }
    }

    state.particleSystem.geometry.attributes.position.needsUpdate = true;
}
