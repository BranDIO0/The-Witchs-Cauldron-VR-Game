import * as THREE from 'three';
import { state } from './state.js';
import { createProceduralWallTexture, createProceduralOakTexture, createProceduralWoodTexture } from './textures.js';
import { buildBookshelf, buildReadingCorner, buildBed, buildKitchen, buildSideboardsAndPlants, buildRightSideFurniture } from './furniture.js';
import { buildCozyDetails } from './cozyDetails.js';

export function buildCabin() {
    // Room dimensions: 7m wide, 7m deep, 3.2m high
    const width = 7.0;
    const depth = 7.0;
    const height = 3.2;
    const xCenter = 0;
    const zCenter = -0.5; // Shift slightly forward to cover table/cauldron and player

    const wallTexture = createProceduralWallTexture();
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.95,
        metalness: 0.05
    });

    const oakTexture = createProceduralOakTexture();
    const beamMaterial = new THREE.MeshStandardMaterial({
        map: oakTexture,
        roughness: 0.85,
        metalness: 0.1
    });

    // 1. Cozy Plaster Walls (cast/receive shadows)
    const wallThickness = 0.1;
    const wallsGroup = new THREE.Group();
    wallsGroup.name = "CabinWalls";
    state.scene.add(wallsGroup);

    // Far Wall with 1 centered window opening (Z = -4.0)
    const wallH = height; // 3.2
    const wallW = width;   // 7.0
    const wallZ = zCenter - depth / 2; // -4.0
    const bottomH = 0.95;
    const topH = 0.95;
    const midH = wallH - bottomH - topH; // 1.3m (the window height)

    // A. Bottom Wall plate
    const farWallBottom = new THREE.Mesh(new THREE.BoxGeometry(wallW, bottomH, wallThickness), wallMaterial);
    farWallBottom.position.set(xCenter, bottomH / 2, wallZ);
    farWallBottom.receiveShadow = true;
    farWallBottom.castShadow = true;
    wallsGroup.add(farWallBottom);

    // B. Top Wall plate
    const farWallTop = new THREE.Mesh(new THREE.BoxGeometry(wallW, topH, wallThickness), wallMaterial);
    farWallTop.position.set(xCenter, wallH - topH / 2, wallZ);
    farWallTop.receiveShadow = true;
    farWallTop.castShadow = true;
    wallsGroup.add(farWallTop);

    // C. Middle Pillars flanking the centered window
    // Left pillar (from x = -3.5 to -0.55)
    const pillarWLeft = 2.95;
    const farWallMidLeft = new THREE.Mesh(new THREE.BoxGeometry(pillarWLeft, midH, wallThickness), wallMaterial);
    farWallMidLeft.position.set(xCenter - wallW / 2 + pillarWLeft / 2, bottomH + midH / 2, wallZ);
    farWallMidLeft.receiveShadow = true;
    farWallMidLeft.castShadow = true;
    wallsGroup.add(farWallMidLeft);

    // Right pillar (from x = 0.55 to 3.5)
    const pillarWRight = 2.95;
    const farWallMidRight = new THREE.Mesh(new THREE.BoxGeometry(pillarWRight, midH, wallThickness), wallMaterial);
    farWallMidRight.position.set(xCenter + wallW / 2 - pillarWRight / 2, bottomH + midH / 2, wallZ);
    farWallMidRight.receiveShadow = true;
    farWallMidRight.castShadow = true;
    wallsGroup.add(farWallMidRight);

    // Left Wall (X = -3.5)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, depth), wallMaterial);
    leftWall.position.set(xCenter - width / 2, height / 2, zCenter);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    wallsGroup.add(leftWall);

    // Right Wall (X = 3.5)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, depth), wallMaterial);
    rightWall.position.set(xCenter + width / 2, height / 2, zCenter);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    wallsGroup.add(rightWall);

    // Near Wall (Z = 3.0)
    const nearWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, wallThickness), wallMaterial);
    nearWall.position.set(xCenter, height / 2, zCenter + depth / 2);
    nearWall.receiveShadow = true;
    nearWall.castShadow = true;
    wallsGroup.add(nearWall);

    // 2. Wooden Plank Ceiling
    const ceilingMat = new THREE.MeshStandardMaterial({
        map: createProceduralWoodTexture(),
        roughness: 0.9,
        metalness: 0.1
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMat);
    ceiling.rotation.x = Math.PI / 2; // facing downwards
    ceiling.position.set(xCenter, height - 0.01, zCenter);
    ceiling.receiveShadow = true;
    state.scene.add(ceiling);

    // 3. Exposed Wooden Beams (Rafters) - Space across depth Z
    const beamCount = 6;
    const beamSpacing = depth / (beamCount - 1);
    for (let i = 0; i < beamCount; i++) {
        const zPos = (zCenter - depth / 2) + i * beamSpacing;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(width - 0.02, 0.18, 0.14), beamMaterial);
        beam.position.set(xCenter, height - 0.09, zPos);
        beam.castShadow = true;
        beam.receiveShadow = true;
        state.scene.add(beam);
    }

    // Vertical Support corner studs
    const corners = [
        [xCenter - width/2 + 0.06, zCenter - depth/2 + 0.06],
        [xCenter + width/2 - 0.06, zCenter - depth/2 + 0.06],
        [xCenter - width/2 + 0.06, zCenter + depth/2 - 0.06],
        [xCenter + width/2 - 0.06, zCenter + depth/2 - 0.06]
    ];
    corners.forEach(pos => {
        const cornerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, height, 0.14), beamMaterial);
        cornerBeam.position.set(pos[0], height / 2, pos[1]);
        cornerBeam.castShadow = true;
        cornerBeam.receiveShadow = true;
        state.scene.add(cornerBeam);
    });

    // 4. Half-Timbering Framing Elements along walls for added geometric depth
    // Bottom horizontal runner beams
    for (let yVal of [0.08, height / 2, height - 0.08]) {
        const horizStudLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, depth - 0.14), beamMaterial);
        horizStudLeft.position.set(xCenter - width / 2 + 0.025, yVal, zCenter);
        horizStudLeft.castShadow = true;
        horizStudLeft.receiveShadow = true;
        state.scene.add(horizStudLeft);

        const horizStudRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, depth - 0.14), beamMaterial);
        horizStudRight.position.set(xCenter + width / 2 - 0.025, yVal, zCenter);
        horizStudRight.castShadow = true;
        horizStudRight.receiveShadow = true;
        state.scene.add(horizStudRight);

        const horizStudFar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.14, 0.08, 0.03), beamMaterial);
        horizStudFar.position.set(xCenter, yVal, zCenter - depth / 2 + 0.025);
        horizStudFar.castShadow = true;
        horizStudFar.receiveShadow = true;
        state.scene.add(horizStudFar);
    }

    // Vertical wall struts (intermediate columns)
    const studCount = 4;
    const studSpacing = depth / (studCount - 1);
    for (let i = 1; i < studCount - 1; i++) {
        const zPos = (zCenter - depth / 2) + i * studSpacing;
        
        const leftStud = new THREE.Mesh(new THREE.BoxGeometry(0.03, height, 0.08), beamMaterial);
        leftStud.position.set(xCenter - width / 2 + 0.025, height / 2, zPos);
        leftStud.castShadow = true;
        leftStud.receiveShadow = true;
        state.scene.add(leftStud);

        const rightStud = new THREE.Mesh(new THREE.BoxGeometry(0.03, height, 0.08), beamMaterial);
        rightStud.position.set(xCenter + width / 2 - 0.025, height / 2, zPos);
        rightStud.castShadow = true;
        rightStud.receiveShadow = true;
        state.scene.add(rightStud);
    }

    // 5. Build One Cozy Centered Window on the Far wall showing starry night and forest silhouette
    buildWindow(0, height, zCenter, depth, beamMaterial);

    // 6. Build fireplace on the left wall
    buildFireplace(beamMaterial);

    // 7. Build bookshelf on the right wall
    buildBookshelf(beamMaterial);

    // 8. Build reading corner in back-right area
    buildReadingCorner(beamMaterial);

    // 9. Build decorative door on the near wall (behind player start)
    buildDoor(beamMaterial);

    // 10. Build cozy bed in back-left area
    buildBed(beamMaterial);

    // 11. Build simple kitchen counter/shelf next to fireplace on left wall
    buildKitchen(beamMaterial);

    // 12. Build cozy decorative details (sleeping cat, broom, hanging herbs, sheepskin rug)
    buildCozyDetails(beamMaterial);

    // 13. Build wooden sideboards with glass doors along far wall and potted plants/ivy
    buildSideboardsAndPlants(beamMaterial);

    // 14. Build right wall cozy furniture (writing desk, stool, quill, glowing crystal ball, and framed gallery paintings)
    buildRightSideFurniture(beamMaterial);
}

// --- Window Structure Constructor ---
export function buildWindow(xOffset, height, zCenter, depth, beamMaterial) {
    const winW = 1.1;
    const winH = 1.3;
    const winY = 1.6;
    const winZ = zCenter - depth / 2; // -4.0

    // A. Starry Night & Forest Silhouette Backdrop Plane
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#030206');
    grad.addColorStop(0.5, '#0a0618');
    grad.addColorStop(0.9, '#1a1030');
    grad.addColorStop(1, '#080512');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
        const sx = Math.random() * 256;
        const sy = Math.random() * 256;
        const r = 0.4 + Math.random() * 0.7;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Moon
    ctx.fillStyle = '#fffdec';
    ctx.shadowColor = '#ffd085';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(70, 60, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw very subtle dark pine forest silhouette at the bottom (y = 256)
    ctx.fillStyle = '#040208'; // extremely dark, almost black-indigo
    ctx.beginPath();
    ctx.moveTo(0, 256);
    for (let px = 0; px <= 256; px += 16) {
        const py = 236 + Math.sin(px * 0.05) * 5;
        ctx.lineTo(px, py);
    }
    ctx.lineTo(256, 256);
    ctx.closePath();
    ctx.fill();

    // Draw procedural pine trees overlapping along the horizon
    for (let tx = -8; tx < 264; tx += 12) {
        const treeH = 35 + Math.random() * 45; // tree height in pixels
        const treeW = 10 + Math.random() * 8;  // tree width in pixels
        
        // Draw trunk
        ctx.fillStyle = '#010103'; // darkest charcoal
        ctx.fillRect(tx + treeW / 2 - 1, 236 - 6, 2, 6);
        
        // Draw pine foliage levels
        ctx.fillStyle = '#030206'; // barely distinguishable green-black
        const levels = 3;
        const startY = 238;
        
        for (let l = 0; l < levels; l++) {
            const levelY = startY - 4 - l * (treeH / levels);
            const levelW = treeW * (1.0 - l * 0.22);
            const levelH = (treeH / levels) * 1.4;
            
            ctx.beginPath();
            ctx.moveTo(tx + treeW / 2 - levelW / 2, levelY);
            ctx.lineTo(tx + treeW / 2 + levelW / 2, levelY);
            ctx.lineTo(tx + treeW / 2, levelY - levelH);
            ctx.closePath();
            ctx.fill();
        }
    }

    const backdropTexture = new THREE.CanvasTexture(canvas);
    const backdropMat = new THREE.MeshBasicMaterial({
        map: backdropTexture,
        side: THREE.DoubleSide
    });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(winW * 1.6, winH * 1.6), backdropMat);
    backdrop.position.set(xOffset, winY, winZ - 0.06);
    state.scene.add(backdrop);

    // B. Window Glass Pane
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x90ccff,
        transparent: true,
        opacity: 0.12,
        roughness: 0.1,
        metalness: 0.95
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), glassMat);
    glass.position.set(xOffset, winY, winZ - 0.015);
    state.scene.add(glass);

    // C. Heavy timber window frame border
    const fT = 0.08;
    const fD = 0.12;

    const horizFrame = new THREE.BoxGeometry(winW + fT, fT, fD);
    const frameTop = new THREE.Mesh(horizFrame, beamMaterial);
    frameTop.position.set(xOffset, winY + winH / 2, winZ);
    frameTop.castShadow = true;
    frameTop.receiveShadow = true;
    state.scene.add(frameTop);

    const frameBottom = new THREE.Mesh(horizFrame, beamMaterial);
    frameBottom.position.set(xOffset, winY - winH / 2, winZ);
    frameBottom.castShadow = true;
    frameBottom.receiveShadow = true;
    state.scene.add(frameBottom);

    const vertFrame = new THREE.BoxGeometry(fT, winH - fT, fD);
    const frameLeft = new THREE.Mesh(vertFrame, beamMaterial);
    frameLeft.position.set(xOffset - winW / 2, winY, winZ);
    frameLeft.castShadow = true;
    frameLeft.receiveShadow = true;
    state.scene.add(frameLeft);

    const frameRight = new THREE.Mesh(vertFrame, beamMaterial);
    frameRight.position.set(xOffset + winW / 2, winY, winZ);
    frameRight.castShadow = true;
    frameRight.receiveShadow = true;
    state.scene.add(frameRight);

    // D. Window Grid Cross
    const gridV = new THREE.Mesh(new THREE.BoxGeometry(0.02, winH, 0.03), beamMaterial);
    gridV.position.set(xOffset, winY, winZ - 0.005);
    gridV.castShadow = true;
    state.scene.add(gridV);

    const gridH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.02, 0.03), beamMaterial);
    gridH.position.set(xOffset, winY, winZ - 0.005);
    gridH.castShadow = true;
    state.scene.add(gridH);
}

// --- Stone Fireplace Constructor ---
export function buildFireplace(beamMaterial) {
    const fpGroup = new THREE.Group();
    fpGroup.position.set(-3.3, 0, -1.1); // Placed on Left Wall (X = -3.5)
    fpGroup.rotation.y = Math.PI / 2;    // Face inwards (+X)
    state.scene.add(fpGroup);

    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x3d3935, // Rustic charcoal grey
        roughness: 0.9,
        metalness: 0.05
    });

    const backMat = new THREE.MeshStandardMaterial({
        color: 0x121212, // Smutty firebox backing
        roughness: 0.95
    });

    // 1. Hearth Stone Platform
    const hearthBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), stoneMat);
    hearthBase.position.y = 0.04;
    hearthBase.receiveShadow = true;
    hearthBase.castShadow = true;
    fpGroup.add(hearthBase);

    // 2. Pillars left and right
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.55), stoneMat);
    pillarL.position.set(-0.625, 0.59, 0.1);
    pillarL.castShadow = true;
    pillarL.receiveShadow = true;
    fpGroup.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.55), stoneMat);
    pillarR.position.set(0.625, 0.59, 0.1);
    pillarR.castShadow = true;
    pillarR.receiveShadow = true;
    fpGroup.add(pillarR);

    // 3. Firebox recess back panel
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.08), backMat);
    backWall.position.set(0, 0.59, -0.12);
    backWall.receiveShadow = true;
    fpGroup.add(backWall);

    // 4. Heavy wood mantel board
    const mantel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.65), beamMaterial);
    mantel.position.set(0, 1.17, 0.1);
    mantel.castShadow = true;
    mantel.receiveShadow = true;
    fpGroup.add(mantel);

    // 5. Chimney breast going to rafters
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.45), stoneMat);
    chimney.position.set(0, 2.19, 0.05);
    chimney.castShadow = true;
    chimney.receiveShadow = true;
    fpGroup.add(chimney);

    // 6. Glowing logs
    const logMat = new THREE.MeshStandardMaterial({
        color: 0x1f1208,
        roughness: 0.95
    });
    const emberMat = new THREE.MeshStandardMaterial({
        color: 0xff3c00,
        emissive: 0xff3c00,
        emissiveIntensity: 3.5,
        roughness: 0.2
    });

    // Glowing hot coals stack
    for (let i = 0; i < 6; i++) {
        const coal = new THREE.Mesh(new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 8, 8), emberMat);
        coal.position.set(
            (Math.random() - 0.5) * 0.35,
            0.09,
            (Math.random() - 0.5) * 0.25
        );
        fpGroup.add(coal);
    }

    // Pile of logs crossing
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.48, 8), logMat);
    log1.rotation.z = Math.PI / 2 - 0.25;
    log1.rotation.y = 0.2;
    log1.position.set(-0.08, 0.14, 0.04);
    log1.castShadow = true;
    fpGroup.add(log1);

    const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.48, 8), logMat);
    log2.rotation.z = -Math.PI / 2 + 0.25;
    log2.rotation.y = -0.2;
    log2.position.set(0.08, 0.14, 0.01);
    log2.castShadow = true;
    fpGroup.add(log2);

    const log3 = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.42, 8), logMat);
    log3.rotation.x = Math.PI / 2;
    log3.rotation.z = 0.15;
    log3.position.set(0.0, 0.2, -0.01);
    log3.castShadow = true;
    fpGroup.add(log3);

    // 7. Dynamic warm fireplace point light
    state.fireplaceLight = new THREE.PointLight(0xff5000, 11.0, 9.0);
    state.fireplaceLight.position.set(0, 0.3, 0.22);
    state.fireplaceLight.castShadow = true;
    state.fireplaceLight.shadow.mapSize.width = 1024;
    state.fireplaceLight.shadow.mapSize.height = 1024;
    state.fireplaceLight.shadow.bias = -0.002;
    fpGroup.add(state.fireplaceLight);

    // 8. Fire flame particle system
    createFireplaceParticles(fpGroup);
}

// --- Fireplace Particles Emitter ---
export function createFireplaceParticles(parentGroup) {
    const count = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    state.fireplaceParticleData = [];

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 0.38;
        const y = 0.16 + Math.random() * 0.35;
        const z = (Math.random() - 0.5) * 0.28;

        positions.push(x, y, z);

        state.fireplaceParticleData.push({
            x: x,
            y: y,
            z: z,
            speedY: 0.32 + Math.random() * 0.45,
            speedX: (Math.random() - 0.5) * 0.18,
            life: Math.random(),
            decay: 0.55 + Math.random() * 0.75
        });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 210, 60, 1)');
    grad.addColorStop(0.35, 'rgba(255, 60, 0, 0.85)');
    grad.addColorStop(1, 'rgba(230, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.15,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    state.fireplaceParticles = new THREE.Points(geometry, material);
    parentGroup.add(state.fireplaceParticles);
}

export function updateFireplaceParticles(dt) {
    if (!state.fireplaceParticles) return;

    const pos = state.fireplaceParticles.geometry.attributes.position.array;

    for (let i = 0; i < state.fireplaceParticleData.length; i++) {
        const data = state.fireplaceParticleData[i];

        data.life -= data.decay * dt;
        data.y += data.speedY * dt;
        data.x += data.speedX * dt;

        // Respawn particle
        if (data.life <= 0 || data.y > 0.85) {
            data.life = 1.0;
            data.y = 0.16 + Math.random() * 0.08;
            data.x = (Math.random() - 0.5) * 0.32;
            data.z = (Math.random() - 0.5) * 0.22;
            data.speedY = 0.35 + Math.random() * 0.45;
            data.speedX = (Math.random() - 0.5) * 0.14;
        }

        pos[i * 3] = data.x;
        pos[i * 3 + 1] = data.y;
        pos[i * 3 + 2] = data.z;
    }

    state.fireplaceParticles.geometry.attributes.position.needsUpdate = true;

    // Animate dynamic fireplace lighting flicker
    if (state.fireplaceLight) {
        const noise = Math.sin(performance.now() * 0.018) * 1.6 + Math.sin(performance.now() * 0.0085) * 0.85;
        state.fireplaceLight.intensity = 11.5 + noise;
    }
}

// --- Decorative Door Constructor ---
export function buildDoor(beamMaterial) {
    const doorGroup = new THREE.Group();
    // Place it on the near wall (Z = 3.0), centered at X = 0, facing inwards (-Z)
    doorGroup.position.set(0, 0, 2.95);
    doorGroup.rotation.y = Math.PI; // face inwards (-Z)
    state.scene.add(doorGroup);

    // Door frame (dark wood rafters style)
    const frameW = 1.15;
    const frameH = 2.15;
    const frameThickness = 0.08;
    const frameDepth = 0.12;

    const frameMat = beamMaterial;

    // Frame vertical sides
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameH, frameDepth), frameMat);
    frameL.position.set(-frameW / 2, frameH / 2, 0);
    frameL.castShadow = true;
    frameL.receiveShadow = true;
    doorGroup.add(frameL);

    const frameR = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameH, frameDepth), frameMat);
    frameR.position.set(frameW / 2, frameH / 2, 0);
    frameR.castShadow = true;
    frameR.receiveShadow = true;
    doorGroup.add(frameR);

    // Frame top horizontal board
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(frameW + frameThickness, frameThickness, frameDepth), frameMat);
    frameTop.position.set(0, frameH, 0);
    frameTop.castShadow = true;
    frameTop.receiveShadow = true;
    doorGroup.add(frameTop);

    // Door panel itself (textured wood planks)
    const doorPlankMat = new THREE.MeshStandardMaterial({
        color: 0x472814, // warm rustic oak
        roughness: 0.9,
        metalness: 0.05
    });

    const panelW = frameW - frameThickness;
    const panelH = frameH - frameThickness / 2;
    const panelD = 0.05;

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(panelW, panelH, panelD), doorPlankMat);
    doorPanel.position.set(0, panelH / 2, -0.01);
    doorPanel.castShadow = true;
    doorPanel.receiveShadow = true;
    doorGroup.add(doorPanel);

    // Vertical wooden plank divisions details
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x221208, roughness: 0.92 });
    const plankCount = 5;
    const plankSpacing = panelW / plankCount;
    for (let i = 1; i < plankCount; i++) {
        const plankLine = new THREE.Mesh(new THREE.BoxGeometry(0.008, panelH - 0.02, 0.008), lineMat);
        plankLine.position.set(-panelW / 2 + i * plankSpacing, panelH / 2, 0.016);
        doorGroup.add(plankLine);
    }

    // Diagonal Z-brace medieval frame
    const braceMat = new THREE.MeshStandardMaterial({
        color: 0x3d1f0f,
        roughness: 0.9
    });

    // Top/bottom horizontal boards on the door panel
    const boardTop = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.04, 0.16, 0.015), braceMat);
    boardTop.position.set(0, panelH - 0.18, 0.018);
    boardTop.castShadow = true;
    doorGroup.add(boardTop);

    const boardBottom = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.04, 0.16, 0.015), braceMat);
    boardBottom.position.set(0, 0.18, 0.018);
    boardBottom.castShadow = true;
    doorGroup.add(boardBottom);

    // Diagonal brace board
    const boardDiag = new THREE.Mesh(new THREE.BoxGeometry(0.14, panelH - 0.5, 0.012), braceMat);
    boardDiag.position.set(0, panelH / 2, 0.018);
    boardDiag.rotation.z = -Math.PI / 4.6;
    boardDiag.castShadow = true;
    doorGroup.add(boardDiag);

    // Iron strap hinges
    const ironMat = new THREE.MeshStandardMaterial({
        color: 0x1e1e1e,
        roughness: 0.65,
        metalness: 0.8
    });

    for (let yVal of [0.4, panelH - 0.4]) {
        const hingeStrap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.008), ironMat);
        hingeStrap.position.set(-panelW / 2 + 0.16, yVal, 0.028);
        hingeStrap.castShadow = true;
        doorGroup.add(hingeStrap);

        const hingeBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.01), ironMat);
        hingeBase.position.set(-frameW / 2, yVal, 0.028);
        hingeBase.castShadow = true;
        doorGroup.add(hingeBase);
    }
}
