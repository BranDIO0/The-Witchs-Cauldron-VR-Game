import * as THREE from 'three';
import { state } from './state.js';
import { createScrollTexture, createPaintingTexture } from './textures.js';

export function buildBookshelf(beamMaterial) {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(3.3, 0, -2.0); // Placed on Right Wall (X = 3.5) between study desk and sideboards
    shelfGroup.rotation.y = -Math.PI / 2;  // Face inwards (-X)
    state.scene.add(shelfGroup);

    const woodMat = beamMaterial; // Oak
    const backMat = new THREE.MeshStandardMaterial({
        color: 0x251508, // Slightly darker oak backing
        roughness: 0.95
    });

    const sW = 1.6;
    const sH = 2.4;
    const sD = 0.32;
    const th = 0.05;

    // Frame sides
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(th, sH, sD), woodMat);
    sideL.position.set(-sW / 2 + th / 2, sH / 2, 0);
    sideL.castShadow = true;
    sideL.receiveShadow = true;
    shelfGroup.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(th, sH, sD), woodMat);
    sideR.position.set(sW / 2 - th / 2, sH / 2, 0);
    sideR.castShadow = true;
    sideR.receiveShadow = true;
    shelfGroup.add(sideR);

    // Top board
    const topBoard = new THREE.Mesh(new THREE.BoxGeometry(sW, th, sD), woodMat);
    topBoard.position.set(0, sH - th / 2, 0);
    topBoard.castShadow = true;
    topBoard.receiveShadow = true;
    shelfGroup.add(topBoard);

    // Bottom heavy kick board
    const bottomBoard = new THREE.Mesh(new THREE.BoxGeometry(sW, 0.12, sD), woodMat);
    bottomBoard.position.set(0, 0.06, 0);
    bottomBoard.castShadow = true;
    bottomBoard.receiveShadow = true;
    shelfGroup.add(bottomBoard);

    // Thin back wall
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(sW - th * 2, sH - th, 0.02), backMat);
    backPanel.position.set(0, sH / 2 + 0.03, -sD / 2 + 0.01);
    backPanel.receiveShadow = true;
    shelfGroup.add(backPanel);

    // Horizontal dividers
    const levels = [0.6, 1.1, 1.6, 2.0];
    levels.forEach(lvl => {
        const divider = new THREE.Mesh(new THREE.BoxGeometry(sW - th * 2, 0.04, sD - 0.02), woodMat);
        divider.position.set(0, lvl, 0);
        divider.castShadow = true;
        divider.receiveShadow = true;
        shelfGroup.add(divider);
    });

    // Procedural book & vials stack
    const spellbookColors = [
        0x70001a, // Crimson
        0x152c54, // Wizard Blue
        0x183b2a, // Moss Green
        0x473426, // Leather Brown
        0xb39150, // Antique Gold
        0xece2d0, // Ancient Parchment
        0x612975  // Mystical Violet
    ];

    // Book builder
    function spawnBook(x, y, z, height, width, depth, color, lean = 0) {
        const bkGroup = new THREE.Group();
        bkGroup.position.set(x, y, z);

        const coverMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.72,
            metalness: 0.15
        });
        const pageMat = new THREE.MeshStandardMaterial({
            color: 0xfaedd6,
            roughness: 0.9
        });

        const cover = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), coverMat);
        cover.castShadow = true;
        cover.receiveShadow = true;
        bkGroup.add(cover);

        // Page bunch showing on front/side
        const pages = new THREE.Mesh(new THREE.BoxGeometry(width - 0.005, height - 0.012, depth - 0.01), pageMat);
        pages.position.set(0.001, 0, 0.005);
        bkGroup.add(pages);

        if (lean !== 0) {
            bkGroup.rotation.z = lean;
        }

        shelfGroup.add(bkGroup);
        state.registerFloatingProp(bkGroup, 0.35); // Add to floating props
    }

    // Flask builder
    function spawnFlask(x, y, z, fluidColor) {
        const flaskGroup = new THREE.Group();
        flaskGroup.position.set(x, y, z);

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.15,
            metalness: 0.9,
            transparent: true,
            opacity: 0.3
        });
        const fluidMat = new THREE.MeshStandardMaterial({
            color: fluidColor,
            emissive: fluidColor,
            emissiveIntensity: 1.3,
            roughness: 0.15
        });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), glassMat);
        base.castShadow = true;
        flaskGroup.add(base);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), glassMat);
        neck.position.y = 0.07;
        flaskGroup.add(neck);

        const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.025, 8), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
        cork.position.y = 0.1;
        flaskGroup.add(cork);

        const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.048, 12), fluidMat);
        fluid.position.y = -0.014;
        flaskGroup.add(fluid);

        shelfGroup.add(flaskGroup);
        state.registerFloatingProp(flaskGroup, 0.4); // Add to floating props
    }

    const yOffsets = [0.12, 0.62, 1.12, 1.62];
    yOffsets.forEach((yBase, shelfIndex) => {
        let xCur = -sW / 2 + 0.12;
        const xEnd = sW / 2 - 0.12;

        while (xCur < xEnd) {
            const roll = Math.random();

            if (roll < 0.68) {
                const count = 2 + Math.floor(Math.random() * 4);
                const canLean = Math.random() > 0.72;
                const lDir = Math.random() > 0.5 ? 1 : -1;

                for (let k = 0; k < count; k++) {
                    if (xCur >= xEnd - 0.08) break;
                    const w = 0.025 + Math.random() * 0.024;
                    const h = 0.17 + Math.random() * 0.075;
                    const d = 0.14 + Math.random() * 0.045;
                    const color = spellbookColors[Math.floor(Math.random() * spellbookColors.length)];

                    const lean = (canLean && k === count - 1) ? 0.24 * lDir : 0;
                    const yOff = Math.cos(lean) * (h / 2) + 0.01;

                    spawnBook(xCur + w/2, yBase + yOff, 0.02, h, w, d, color, lean);
                    xCur += w + (lean !== 0 ? 0.065 : 0.005);
                }
            } else if (roll < 0.88) {
                const vials = 1 + Math.floor(Math.random() * 2);
                for (let k = 0; k < vials; k++) {
                    if (xCur >= xEnd - 0.08) break;
                    const color = spellbookColors[Math.floor(Math.random() * spellbookColors.length)];
                    spawnFlask(xCur + 0.04, yBase + 0.04, 0.05, color);
                    xCur += 0.12;
                }
            } else {
                xCur += 0.14 + Math.random() * 0.14;
            }
        }
    });
}

export function buildReadingCorner(beamMaterial) {
    const rcGroup = new THREE.Group();
    rcGroup.position.set(2.0, 0, 1.8); // Placed in Back-Right corner
    rcGroup.rotation.y = Math.atan2(-2.0, -2.9);  // Face the cauldron exactly
    state.scene.add(rcGroup);

    // 1. Circular Woven Fabric Rug
    const rugGeo = new THREE.CircleGeometry(1.0, 32);
    rugGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#661225'; // Vintage Burgundy
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#c59d4f'; // Antique gold ring
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#320b12'; // Blackish-red ring
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(128, 128, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#c59d4f';
    ctx.beginPath();
    ctx.arc(128, 128, 18, 0, Math.PI * 2);
    ctx.fill();

    // Rug fringes along edge
    ctx.strokeStyle = '#d7b57b';
    ctx.lineWidth = 3;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
        const rx = 128 + Math.cos(angle) * 122;
        const ry = 128 + Math.sin(angle) * 122;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(angle) * 6, ry + Math.sin(angle) * 6);
        ctx.stroke();
    }

    const rugTexture = new THREE.CanvasTexture(canvas);
    const rugMat = new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 0.95,
        metalness: 0.05
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.y = 0.004; // avoid floor z-fighting
    rug.receiveShadow = true;
    rcGroup.add(rug);

    // 2. Wingback Armchair
    const chair = new THREE.Group();
    chair.position.set(-0.08, 0, 0.05);
    rcGroup.add(chair);

    const velvetMat = new THREE.MeshStandardMaterial({
        color: 0x5a0a19, // Velvet crimson
        roughness: 0.95,
        metalness: 0.02
    });

    // Chair legs (slightly flared)
    const legGeo = new THREE.CylinderGeometry(0.018, 0.014, 0.25, 8);
    const legCoords = [
        [-0.32, 0.125, -0.32],
        [0.32, 0.125, -0.32],
        [-0.32, 0.125, 0.32],
        [0.32, 0.125, 0.32]
    ];
    legCoords.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, beamMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        chair.add(leg);
    });

    // Cushion seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.72), velvetMat);
    seat.position.y = 0.32;
    seat.castShadow = true;
    seat.receiveShadow = true;
    chair.add(seat);

    // Armrests left/right
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.74), velvetMat);
    armL.position.set(-0.36, 0.46, 0);
    armL.castShadow = true;
    armL.receiveShadow = true;
    chair.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.74), velvetMat);
    armR.position.set(0.36, 0.46, 0);
    armR.castShadow = true;
    armR.receiveShadow = true;
    chair.add(armR);

    // Tall backing
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.8, 0.15), velvetMat);
    back.position.set(0, 0.72, -0.34);
    back.rotation.x = -0.06;
    back.castShadow = true;
    back.receiveShadow = true;
    chair.add(back);

    // Wingback side ears (wings)
    const wingGeo = new THREE.BoxGeometry(0.14, 0.34, 0.24);
    
    const earL = new THREE.Mesh(wingGeo, velvetMat);
    earL.position.set(-0.32, 0.88, -0.22);
    earL.rotation.y = 0.28;
    earL.castShadow = true;
    chair.add(earL);

    const earR = new THREE.Mesh(wingGeo, velvetMat);
    earR.position.set(0.32, 0.88, -0.22);
    earR.rotation.y = -0.28;
    earR.castShadow = true;
    chair.add(earR);

    // 3. Round Wooden Side Table
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0.68, 0, -0.18);
    rcGroup.add(tableGroup);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.5, 8), beamMaterial);
    post.position.y = 0.25;
    post.castShadow = true;
    tableGroup.add(post);

    const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 12), beamMaterial);
    tableBase.position.y = 0.025;
    tableBase.castShadow = true;
    tableGroup.add(tableBase);

    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16), beamMaterial);
    tableTop.position.y = 0.52;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // 4. Stack of books on side table
    const bookColors = [0x152c54, 0x70001a, 0x473426];
    const bkH = 0.032;
    for (let i = 0; i < 3; i++) {
        const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, bkH, 0.22),
            new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.78 })
        );
        book.position.set(
            (Math.random() - 0.5) * 0.02,
            0.54 + i * bkH,
            (Math.random() - 0.5) * 0.02
        );
        book.rotation.y = (Math.random() - 0.5) * 0.35;
        book.castShadow = true;
        book.receiveShadow = true;
        tableGroup.add(book);
        state.registerFloatingProp(book, 0.5); // Float books from side table
    }

    // 5. Candle emitting soft cozy light on side table
    const candle = new THREE.Group();
    candle.position.set(-0.08, 0.54 + 3 * bkH, 0.06);
    tableGroup.add(candle);

    const wax = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.075, 8),
        new THREE.MeshStandardMaterial({ color: 0xfaedd6, roughness: 0.65 })
    );
    wax.position.y = 0.038;
    wax.castShadow = true;
    candle.add(wax);

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.008, 0.025, 8),
        new THREE.MeshBasicMaterial({ color: 0xffa500 })
    );
    flame.position.y = 0.088;
    candle.add(flame);

    const candleLight = new THREE.PointLight(0xffaa44, 2.0, 3.2);
    candleLight.position.set(0, 0.12, 0);
    candleLight.castShadow = true;
    candleLight.shadow.bias = -0.001;
    candle.add(candleLight);
    state.registerFloatingProp(candle, 0.45); // Float candle
}

export function buildBed(beamMaterial) {
    const bedGroup = new THREE.Group();
    // Position in the back-left corner
    bedGroup.position.set(-2.7, 0, 1.9);
    state.scene.add(bedGroup);

    const woodMat = beamMaterial;
    const mattressMat = new THREE.MeshStandardMaterial({
        color: 0xf4f1ea, // soft cream linen
        roughness: 0.95
    });
    const blanketMat = new THREE.MeshStandardMaterial({
        color: 0x1d3a2b, // cozy deep forest green velvet
        roughness: 0.9,
        metalness: 0.05
    });
    const pillowMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8
    });

    // 1. Bed Frame Corner Posts
    const postGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);

    const postFL = new THREE.Mesh(postGeo, woodMat);
    postFL.position.set(-0.56, 0.25, -0.96);
    postFL.castShadow = true;
    bedGroup.add(postFL);

    const postFR = new THREE.Mesh(postGeo, woodMat);
    postFR.position.set(0.56, 0.25, -0.96);
    postFR.castShadow = true;
    bedGroup.add(postFR);

    const postBL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08), woodMat);
    postBL.position.set(-0.56, 0.475, 0.96);
    postBL.castShadow = true;
    bedGroup.add(postBL);

    const postBR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08), woodMat);
    postBR.position.set(0.56, 0.475, 0.96);
    postBR.castShadow = true;
    bedGroup.add(postBR);

    // 2. Side Panels & Headboard
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 1.84), woodMat);
    sideL.position.set(-0.56, 0.3, 0);
    sideL.castShadow = true;
    sideL.receiveShadow = true;
    bedGroup.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 1.84), woodMat);
    sideR.position.set(0.56, 0.3, 0);
    sideR.castShadow = true;
    sideR.receiveShadow = true;
    bedGroup.add(sideR);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.5, 0.04), woodMat);
    headboard.position.set(0, 0.65, 0.96);
    headboard.castShadow = true;
    headboard.receiveShadow = true;
    bedGroup.add(headboard);

    const footboard = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.25, 0.04), woodMat);
    footboard.position.set(0, 0.325, -0.96);
    footboard.castShadow = true;
    footboard.receiveShadow = true;
    bedGroup.add(footboard);

    // 3. Mattress
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.25, 1.84), mattressMat);
    mattress.position.set(0, 0.35, 0);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    bedGroup.add(mattress);

    // 4. Pillows
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.35), pillowMat);
    pillow.position.set(0, 0.49, 0.72);
    pillow.rotation.x = -0.15; // slightly propped up
    pillow.castShadow = true;
    bedGroup.add(pillow);

    // 5. Folded Quilt / Blanket
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.1, 1.35), blanketMat);
    blanket.position.set(0, 0.44, -0.25);
    blanket.castShadow = true;
    blanket.receiveShadow = true;
    bedGroup.add(blanket);

    const fold = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.14, 0.22), blanketMat);
    fold.position.set(0, 0.47, 0.44);
    fold.rotation.x = 0.15;
    fold.castShadow = true;
    bedGroup.add(fold);

    // 6. Chest at the foot of the bed
    const chest = new THREE.Group();
    chest.position.set(0, 0, -1.35);
    chest.rotation.y = Math.PI; // face towards center of cabin
    bedGroup.add(chest);

    const chestBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.42, 0.45), woodMat);
    chestBody.position.y = 0.21;
    chestBody.castShadow = true;
    chestBody.receiveShadow = true;
    chest.add(chestBody);

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.8, roughness: 0.5 });
    for (let xOff of [-0.3, 0.3]) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.43, 0.46), ironMat);
        band.position.set(xOff, 0.21, 0);
        chest.add(band);
    }
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.012), ironMat);
    lock.position.set(0, 0.32, 0.23);
    chest.add(lock);
}

export function buildKitchen(beamMaterial) {
    const kitGroup = new THREE.Group();
    // Place along left wall next to the fireplace (X = -3.3, Z = -2.8)
    kitGroup.position.set(-3.3, 0, -2.8);
    kitGroup.rotation.y = Math.PI / 2; // face inwards (+X)
    state.scene.add(kitGroup);

    const woodMat = beamMaterial;
    const counterTopMat = new THREE.MeshStandardMaterial({
        color: 0x2b2b2b, // slate stone texture
        roughness: 0.8,
        metalness: 0.15
    });

    // 1. Counter base cabinet
    const counterW = 1.35;
    const counterH = 0.8;
    const counterD = 0.55;

    const base = new THREE.Mesh(new THREE.BoxGeometry(counterW, counterH, counterD), woodMat);
    base.position.y = counterH / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    kitGroup.add(base);

    // Countertop slab
    const top = new THREE.Mesh(new THREE.BoxGeometry(counterW + 0.04, 0.06, counterD + 0.04), counterTopMat);
    top.position.y = counterH + 0.03;
    top.castShadow = true;
    top.receiveShadow = true;
    kitGroup.add(top);

    // Cabinet doors panel details
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x221208, roughness: 0.92 });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.01), doorMat);
    doorL.position.set(-0.31, 0.38, counterD / 2 + 0.005);
    doorL.castShadow = true;
    kitGroup.add(doorL);

    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.01), doorMat);
    doorR.position.set(0.31, 0.38, counterD / 2 + 0.005);
    doorR.castShadow = true;
    kitGroup.add(doorR);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.85, roughness: 0.2 });
    const knobL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), metalMat);
    knobL.position.set(-0.08, 0.5, counterD / 2 + 0.016);
    kitGroup.add(knobL);

    const knobR = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), metalMat);
    knobR.position.set(0.08, 0.5, counterD / 2 + 0.016);
    kitGroup.add(knobR);

    // 2. Kitchen shelf above counter (hanging on wall)
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.22), woodMat);
    shelf.position.set(0, 1.7, -counterD / 2 + 0.12);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    kitGroup.add(shelf);

    // 3. Props on Countertop
    // Terracotta mixing bowl
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xb56d45, roughness: 0.9 });
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.07, 0.09, 12), clayMat);
    bowl.position.set(-0.35, counterH + 0.1, 0.04);
    bowl.castShadow = true;
    kitGroup.add(bowl);
    state.registerFloatingProp(bowl, 0.45); // Float bowl

    // Cutting board & knife grouped to float together
    const boardGroup = new THREE.Group();
    boardGroup.position.set(0.1, counterH + 0.07, 0.02);
    boardGroup.rotation.y = 0.22;
    kitGroup.add(boardGroup);

    const board = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.32), new THREE.MeshStandardMaterial({ color: 0xccaa7d, roughness: 0.85 }));
    board.position.set(0, 0, 0);
    board.castShadow = true;
    boardGroup.add(board);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), woodMat);
    handle.position.set(0, 0.02, 0.14);
    handle.rotation.x = Math.PI / 2;
    boardGroup.add(handle);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.025, 0.18), metalMat);
    blade.position.set(0, 0.025, 0.03);
    boardGroup.add(blade);
    state.registerFloatingProp(boardGroup, 0.45); // Float board + knife

    // Spice jars grouped individually to float
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.9 });
    const powderColors = [0xff4500, 0xffd700, 0x86e22f];
    for (let i = 0; i < 3; i++) {
        const jarGroup = new THREE.Group();
        jarGroup.position.set(0.42 + i * 0.08, counterH + 0.1, -0.08);
        kitGroup.add(jarGroup);

        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), glassMat);
        jar.position.set(0, 0, 0);
        jar.castShadow = true;
        jarGroup.add(jar);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 8), woodMat);
        lid.position.set(0, 0.04, 0);
        jarGroup.add(lid);

        const powder = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.045, 8), new THREE.MeshStandardMaterial({ color: powderColors[i], roughness: 0.95 }));
        powder.position.set(0, -0.02, 0);
        jarGroup.add(powder);

        state.registerFloatingProp(jarGroup, 0.4); // Float spice jar
    }

    // 4. Props on Wall Shelf
    // Terracotta cups
    for (let i = 0; i < 2; i++) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.075, 8), clayMat);
        cup.position.set(-0.35 + i * 0.12, 1.76, -counterD / 2 + 0.12);
        cup.castShadow = true;
        kitGroup.add(cup);
        state.registerFloatingProp(cup, 0.45); // Float cup
    }

    // Ceramic plates stacked on shelf to float as one stack
    const plateStackGroup = new THREE.Group();
    plateStackGroup.position.set(0.25, 1.72, -counterD / 2 + 0.12);
    kitGroup.add(plateStackGroup);

    const plateMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f0, roughness: 0.45 });
    for (let i = 0; i < 4; i++) {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 12), plateMat);
        plate.position.set(0, i * 0.015, 0);
        plate.castShadow = true;
        plateStackGroup.add(plate);
    }
    state.registerFloatingProp(plateStackGroup, 0.4); // Float plates stack

    // 5. Hanging pans/spoons on wall rack below shelf
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.02), metalMat);
    rack.position.set(0, 1.5, -counterD / 2 + 0.03);
    kitGroup.add(rack);

    for (let i = 0; i < 3; i++) {
        const hangX = -0.25 + i * 0.25;
        const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 8), metalMat);
        hook.position.set(hangX, 1.44, -counterD / 2 + 0.03);
        kitGroup.add(hook);

        if (i === 1) {
            const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 8), metalMat);
            panHandle.position.set(hangX, 1.34, -counterD / 2 + 0.03);
            kitGroup.add(panHandle);

            const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.028, 12), new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.65 }));
            pan.rotation.x = Math.PI / 2;
            pan.position.set(hangX, 1.2, -counterD / 2 + 0.05);
            pan.castShadow = true;
            kitGroup.add(pan);
        } else {
            const spoonHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 8), metalMat);
            spoonHandle.position.set(hangX, 1.34, -counterD / 2 + 0.03);
            kitGroup.add(spoonHandle);

            const spoon = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), metalMat);
            spoon.position.set(hangX, 1.23, -counterD / 2 + 0.034);
            spoon.scale.set(1, 1.5, 0.5);
            kitGroup.add(spoon);
        }
    }
}

export function buildSideboardsAndPlants(beamMaterial) {
    const woodMat = beamMaterial;
    const counterTopMat = new THREE.MeshStandardMaterial({
        color: 0x24160c, // rich dark oak wood top
        roughness: 0.8
    });

    // glass material for door panes
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x90ccff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.1,
        metalness: 0.95
    });

    const ironMat = new THREE.MeshStandardMaterial({
        color: 0x1f1f1f,
        metalness: 0.8,
        roughness: 0.5
    });

    // Helper to build a modular sideboard cabinet
    function buildSingleCabinet(xCenter, width) {
        const cabGroup = new THREE.Group();
        cabGroup.position.set(xCenter, 0, -3.76); // against far wall at Z = -4.0 (offset by depth/2)
        state.scene.add(cabGroup);

        const cW = width;
        const cH = 0.85;
        const cD = 0.38;

        // 1. Back panel
        const back = new THREE.Mesh(new THREE.BoxGeometry(cW, cH, 0.02), woodMat);
        back.position.set(0, cH / 2, -cD / 2 + 0.01);
        back.receiveShadow = true;
        cabGroup.add(back);

        // 2. Left and Right side panels
        const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.03, cH, cD - 0.02), woodMat);
        sideL.position.set(-cW / 2 + 0.015, cH / 2, 0.01);
        sideL.castShadow = true;
        sideL.receiveShadow = true;
        cabGroup.add(sideL);

        const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.03, cH, cD - 0.02), woodMat);
        sideR.position.set(cW / 2 - 0.015, cH / 2, 0.01);
        sideR.castShadow = true;
        sideR.receiveShadow = true;
        cabGroup.add(sideR);

        // 3. Middle vertical divider
        const divider = new THREE.Mesh(new THREE.BoxGeometry(0.03, cH - 0.06, cD - 0.04), woodMat);
        divider.position.set(0, cH / 2, 0);
        divider.castShadow = true;
        cabGroup.add(divider);

        // 4. Bottom base board
        const bottom = new THREE.Mesh(new THREE.BoxGeometry(cW - 0.06, 0.05, cD - 0.02), woodMat);
        bottom.position.set(0, 0.025, 0.01);
        bottom.receiveShadow = true;
        cabGroup.add(bottom);

        // 5. Wooden countertop
        const top = new THREE.Mesh(new THREE.BoxGeometry(cW + 0.04, 0.05, cD + 0.04), counterTopMat);
        top.position.set(0, cH + 0.025, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        cabGroup.add(top);

        // 6. Middle horizontal shelves (left and right compartments)
        const shelfL = new THREE.Mesh(new THREE.BoxGeometry(cW / 2 - 0.045, 0.02, cD - 0.04), woodMat);
        shelfL.position.set(-cW / 4 - 0.0075, cH / 2, 0);
        shelfL.castShadow = true;
        shelfL.receiveShadow = true;
        cabGroup.add(shelfL);

        const shelfR = new THREE.Mesh(new THREE.BoxGeometry(cW / 2 - 0.045, 0.02, cD - 0.04), woodMat);
        shelfR.position.set(cW / 4 + 0.0075, cH / 2, 0);
        shelfR.castShadow = true;
        shelfR.receiveShadow = true;
        cabGroup.add(shelfR);

        // 7. Populating shelves (inside the cabinet, visible through glass)
        // Spawn books on bottom shelf left
        const bookCol = [0x70001a, 0x152c54, 0x473426];
        for (let i = 0; i < 3; i++) {
            const book = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.16, 0.12),
                new THREE.MeshStandardMaterial({ color: bookCol[i], roughness: 0.8 })
            );
            book.position.set(-cW / 3.2 + i * 0.035, 0.13, 0);
            book.castShadow = true;
            cabGroup.add(book);
        }

        // Spawn scrolls on top shelf left
        for (let i = 0; i < 2; i++) {
            const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xfaeed6, roughness: 0.9 }));
            scroll.rotation.x = Math.PI / 2;
            scroll.rotation.z = 0.3 * (i - 0.5);
            scroll.position.set(-cW / 3 + i * 0.07, cH / 2 + 0.03, 0.02);
            scroll.castShadow = true;
            cabGroup.add(scroll);
        }

        // Spawn colorful potion bottles on bottom shelf right
        const potColors = [0x86e22f, 0xff4500, 0x8a2be2];
        for (let i = 0; i < 3; i++) {
            const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), glassMat);
            bot.position.set(cW / 5.2 + i * 0.05, 0.085, 0.02);
            bot.castShadow = true;
            cabGroup.add(bot);

            const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.045, 8), new THREE.MeshStandardMaterial({ color: potColors[i], emissive: potColors[i], emissiveIntensity: 1.1 }));
            liquid.position.set(cW / 5.2 + i * 0.05, 0.07, 0.02);
            cabGroup.add(liquid);

            const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.012, 8), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
            cork.position.set(cW / 5.2 + i * 0.05, 0.125, 0.02);
            cabGroup.add(cork);
        }

        // Spawn spellbooks on top shelf right
        const bookR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.18), new THREE.MeshStandardMaterial({ color: 0x612975, roughness: 0.8 }));
        bookR.position.set(cW / 4, cH / 2 + 0.03, 0);
        bookR.rotation.y = 0.25;
        bookR.castShadow = true;
        cabGroup.add(bookR);

        // 8. Dual glass doors
        const doorW = cW / 2 - 0.035;
        const doorH = cH - 0.06;
        const frameTh = 0.03;

        // Helper to create a door
        function buildDoorSide(isRightSide) {
            const door = new THREE.Group();
            const sign = isRightSide ? 1 : -1;
            door.position.set(sign * (doorW / 2 + 0.015), cH / 2, cD / 2 - 0.005);
            cabGroup.add(door);

            // Wooden frame around door
            const borderH = new THREE.Mesh(new THREE.BoxGeometry(doorW, frameTh, 0.02), woodMat);
            borderH.position.set(0, doorH / 2 - frameTh / 2, 0);
            borderH.castShadow = true;
            door.add(borderH);

            const borderH2 = new THREE.Mesh(new THREE.BoxGeometry(doorW, frameTh, 0.02), woodMat);
            borderH2.position.set(0, -doorH / 2 + frameTh / 2, 0);
            borderH2.castShadow = true;
            door.add(borderH2);

            const borderV = new THREE.Mesh(new THREE.BoxGeometry(frameTh, doorH - frameTh * 2, 0.02), woodMat);
            borderV.position.set(-doorW / 2 + frameTh / 2, 0, 0);
            borderV.castShadow = true;
            door.add(borderV);

            const borderV2 = new THREE.Mesh(new THREE.BoxGeometry(frameTh, doorH - frameTh * 2, 0.02), woodMat);
            borderV2.position.set(doorW / 2 - frameTh / 2, 0, 0);
            borderV2.castShadow = true;
            door.add(borderV2);

            // Glass pane inside
            const pane = new THREE.Mesh(new THREE.PlaneGeometry(doorW - frameTh * 2, doorH - frameTh * 2), glassMat);
            pane.position.set(0, 0, 0.002);
            door.add(pane);

            // Small ring door handle
            const handle = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), ironMat);
            // handles placed near center gap
            handle.position.set(-sign * (doorW / 2 - 0.04), 0, 0.014);
            handle.castShadow = true;
            door.add(handle);
        }

        buildDoorSide(false); // Left Door
        buildDoorSide(true);  // Right Door
    }

    // Build three sideboards (Left, Center under window, Right)
    const sideboardW = 1.8;
    buildSingleCabinet(-2.2, sideboardW);
    buildSingleCabinet(0, sideboardW);
    buildSingleCabinet(2.2, sideboardW);

    // --- Plants and Growing Nature Inside Cabin ---
    const leafMat = new THREE.MeshStandardMaterial({
        color: 0x2e5c36, // deep forest leaf green
        roughness: 0.9
    });
    const clayPotMat = new THREE.MeshStandardMaterial({
        color: 0xb56d45, // terracotta
        roughness: 0.85
    });

    // 1. Growing Ivy on Corner studs
    function growIvy(x, z) {
        const ivyGroup = new THREE.Group();
        ivyGroup.position.set(x, 0, z);
        state.scene.add(ivyGroup);

        // Vine stem (thin green line cylinder)
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 3.0, 6),
            new THREE.MeshStandardMaterial({ color: 0x1d3c24, roughness: 0.9 })
        );
        stem.position.y = 1.5;
        ivyGroup.add(stem);

        // Small flat leaves growing up the stem
        for (let y = 0.25; y < 2.9; y += 0.16) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), leafMat);
            leaf.scale.set(1.4, 0.2, 0.8);
            
            const angle = Math.random() * Math.PI * 2;
            leaf.position.set(Math.cos(angle) * 0.03, y, Math.sin(angle) * 0.03);
            leaf.rotation.set(0.2, angle, 0.3);
            leaf.castShadow = true;
            ivyGroup.add(leaf);
        }
    }

    growIvy(-3.34, -3.84); // Far-Left corner timber post ivy
    growIvy(3.34, -3.84);  // Far-Right corner timber post ivy

    // 2. Fern Plant on top of Left Sideboard
    const fernGroup = new THREE.Group();
    fernGroup.position.set(-2.2, 0.9, -3.76); // On top of left sideboard
    state.scene.add(fernGroup);
    state.registerFloatingProp(fernGroup, 0.55); // Float fern

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 10), clayPotMat);
    pot.position.y = 0.06;
    pot.castShadow = true;
    fernGroup.add(pot);

    // Fern leaves branching out
    const leafCount = 12;
    for (let i = 0; i < leafCount; i++) {
        const leafGroup = new THREE.Group();
        leafGroup.position.set(0, 0.1, 0);
        
        const angle = (i * Math.PI * 2) / leafCount + Math.random() * 0.3;
        const bend = 0.4 + Math.random() * 0.35; // droop angle
        const length = 0.24 + Math.random() * 0.15;

        leafGroup.rotation.y = angle;
        leafGroup.rotation.z = bend;

        const leafSeg = new THREE.Mesh(new THREE.BoxGeometry(length, 0.005, 0.04), leafMat);
        leafSeg.position.x = length / 2; // offset hinge pivot
        leafSeg.castShadow = true;
        leafGroup.add(leafSeg);

        fernGroup.add(leafGroup);
    }

    // 3. Glowing Mystical Flowers in Vase on Right Sideboard
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(2.2, 0.9, -3.76); // On top of right sideboard
    state.scene.add(flowerGroup);
    state.registerFloatingProp(flowerGroup, 0.55); // Float flowers in vase

    // Glass vase
    const vaseMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.9
    });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10), vaseMat);
    vase.position.y = 0.08;
    vase.castShadow = true;
    flowerGroup.add(vase);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x1c3b1e, roughness: 0.9 });
    const glowMat = new THREE.MeshStandardMaterial({
        color: 0x8a2be2, // deep indigo flower
        emissive: 0x5a189a, // violet emissive glow
        emissiveIntensity: 1.6,
        roughness: 0.5
    });

    // 3 flower stems
    for (let i = 0; i < 3; i++) {
        const stemAngleX = (i - 1) * 0.25;
        const stemAngleZ = (Math.random() - 0.5) * 0.3;
        const stemH = 0.24 + Math.random() * 0.08;

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, stemH, 6), stemMat);
        stem.rotation.set(stemAngleX, 0, stemAngleZ);
        // offset pivot
        stem.position.set(0.015 * (i - 1), 0.08 + stemH / 2, 0);
        stem.castShadow = true;
        flowerGroup.add(stem);

        // glowing flower head sphere
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), glowMat);
        const stemTip = new THREE.Vector3(0, stemH / 2, 0).applyEuler(stem.rotation);
        head.position.copy(stem.position).add(stemTip);
        head.castShadow = true;
        flowerGroup.add(head);

        // point light for flower glow
        const fLight = new THREE.PointLight(0x8a2be2, 1.2, 1.5);
        fLight.position.copy(head.position);
        flowerGroup.add(fLight);
    }

    // 4. Potted Mint Herb crate under the window
    const mintGroup = new THREE.Group();
    mintGroup.position.set(0.4, 0.9, -3.76); // top of center sideboard, slightly off-center
    state.scene.add(mintGroup);
    state.registerFloatingProp(mintGroup, 0.45); // Float mint crate

    const boxPot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.16), woodMat);
    boxPot.position.y = 0.05;
    boxPot.castShadow = true;
    mintGroup.add(boxPot);

    for (let i = 0; i < 6; i++) {
        const ox = (Math.random() - 0.5) * 0.14;
        const oz = (Math.random() - 0.5) * 0.08;

        const stalkH = 0.08 + Math.random() * 0.06;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, stalkH, 6), stemMat);
        stalk.position.set(ox, 0.1 + stalkH / 2, oz);
        stalk.castShadow = true;
        mintGroup.add(stalk);

        for (let k = 0; k < 3; k++) {
            const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), leafMat);
            leafCluster.position.set(ox, 0.1 + stalkH - k * 0.02, oz);
            leafCluster.scale.set(1.2, 0.4, 1.2);
            mintGroup.add(leafCluster);
        }
    }
}

export function buildRightSideFurniture(beamMaterial) {
    const woodMat = beamMaterial;
    
    // Desk materials
    const deskMat = new THREE.MeshStandardMaterial({
        color: 0x3d2716, // dark oak
        roughness: 0.82
    });
    const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0x2b1a0e, // slightly darker tabletop
        roughness: 0.78
    });
    const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // gold/brass for drawer handles/stand
        metalness: 0.9,
        roughness: 0.2
    });

    // 1. Cozy Study/Writing Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(3.22, 0, 0.45); // against the right wall at X = 3.5 (offset by table depth/2)
    deskGroup.rotation.y = -Math.PI / 2; // Face inwards (-X)
    state.scene.add(deskGroup);

    const dW = 0.95;
    const dH = 0.75;
    const dD = 0.46;

    // Desk tabletop
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(dW, 0.04, dD), deskTopMat);
    deskTop.position.set(0, dH - 0.02, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    // Desk side panels/legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.04, dH - 0.04, dD - 0.04), deskMat);
    legL.position.set(-dW / 2 + 0.04, (dH - 0.04) / 2, 0);
    legL.castShadow = true;
    legL.receiveShadow = true;
    deskGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.04, dH - 0.04, dD - 0.04), deskMat);
    legR.position.set(dW / 2 - 0.04, (dH - 0.04) / 2, 0);
    legR.castShadow = true;
    legR.receiveShadow = true;
    deskGroup.add(legR);

    // Back support panel
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(dW - 0.08, 0.35, 0.02), deskMat);
    backPanel.position.set(0, dH - 0.225, -dD / 2 + 0.03);
    backPanel.castShadow = true;
    deskGroup.add(backPanel);

    // Drawer unit front face detailing
    const drawerFront = new THREE.Mesh(new THREE.BoxGeometry(dW - 0.12, 0.12, 0.02), deskMat);
    drawerFront.position.set(0, dH - 0.1, dD / 2 - 0.02);
    drawerFront.castShadow = true;
    deskGroup.add(drawerFront);

    // Small drawer knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), brassMat);
    knob.position.set(0, dH - 0.1, dD / 2 - 0.005);
    knob.castShadow = true;
    deskGroup.add(knob);

    // 2. Wooden Stool
    const stoolGroup = new THREE.Group();
    stoolGroup.position.set(2.82, 0, 0.45); // tucked slightly under
    state.scene.add(stoolGroup);
    state.registerFloatingProp(stoolGroup, 0.6); // Float stool

    const stoolH = 0.45;
    const sR = 0.14;

    // Stool seat
    const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(sR, sR, 0.04, 12), deskTopMat);
    stoolSeat.position.y = stoolH - 0.02;
    stoolSeat.castShadow = true;
    stoolSeat.receiveShadow = true;
    stoolGroup.add(stoolSeat);

    // Stool legs (3 angled legs)
    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, stoolH - 0.04, 8), deskMat);
        leg.position.set(
            Math.cos(angle) * (sR * 0.7),
            (stoolH - 0.04) / 2,
            Math.sin(angle) * (sR * 0.7)
        );
        leg.rotation.z = -Math.cos(angle) * 0.16;
        leg.rotation.x = Math.sin(angle) * 0.16;
        leg.castShadow = true;
        stoolGroup.add(leg);
    }

    // 3. Desktop Items
    // Open scroll on desk
    const scrollGroup = new THREE.Group();
    scrollGroup.position.set(0, dH, 0.05);
    scrollGroup.rotation.y = 0.12;
    deskGroup.add(scrollGroup);
    state.registerFloatingProp(scrollGroup, 0.6); // Float scroll

    // Scroll sheet (curved parchment)
    const parchmentMat = new THREE.MeshStandardMaterial({
        map: createScrollTexture(),
        roughness: 0.9,
        side: THREE.DoubleSide
    });
    const scrollPaper = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.18), parchmentMat);
    scrollPaper.rotation.x = -Math.PI / 2;
    scrollPaper.receiveShadow = true;
    scrollGroup.add(scrollPaper);

    // Wooden rollers on the sides
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.8 });
    const rollerL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.21, 8), rollerMat);
    rollerL.rotation.z = Math.PI / 2;
    rollerL.position.set(0, 0.005, -0.13);
    rollerL.castShadow = true;
    scrollGroup.add(rollerL);

    const rollerR = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.21, 8), rollerMat);
    rollerR.rotation.z = Math.PI / 2;
    rollerR.position.set(0, 0.005, 0.13);
    rollerR.castShadow = true;
    scrollGroup.add(rollerR);

    // Quill and Inkwell
    const inkwellGroup = new THREE.Group();
    inkwellGroup.position.set(-0.3, dH, -0.08);
    deskGroup.add(inkwellGroup);
    state.registerFloatingProp(inkwellGroup, 0.5); // Float inkwell

    const ceramicMat = new THREE.MeshStandardMaterial({
        color: 0x1f2b3a, // dark teal glazed ceramic
        roughness: 0.25,
        metalness: 0.1
    });
    const inkwell = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.05, 10), ceramicMat);
    inkwell.position.y = 0.025;
    inkwell.castShadow = true;
    inkwellGroup.add(inkwell);

    // Quill feather
    const quill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.008, 0.18, 6),
        new THREE.MeshStandardMaterial({ color: 0xe0e6ed, roughness: 0.7 })
    );
    quill.scale.set(0.2, 1, 3.5);
    quill.rotation.z = -0.4;
    quill.rotation.x = 0.2;
    quill.position.set(0.02, 0.075, 0.015);
    quill.castShadow = true;
    inkwellGroup.add(quill);

    // Glowing Crystal Ball on desk
    const cbGroup = new THREE.Group();
    cbGroup.position.set(0.28, dH, -0.06);
    deskGroup.add(cbGroup);
    state.registerFloatingProp(cbGroup, 0.5); // Float crystal ball

    // Brass stand
    const cbStand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.03, 10), brassMat);
    cbStand.position.y = 0.015;
    cbStand.castShadow = true;
    cbGroup.add(cbStand);

    // Glass ball
    const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        metalness: 0.9
    });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), crystalMat);
    ball.position.y = 0.065;
    ball.castShadow = true;
    cbGroup.add(ball);

    // Core
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    core.position.y = 0.065;
    cbGroup.add(core);

    // Magic light inside the crystal ball (cyan-blue glow)
    state.crystalBallLight = new THREE.PointLight(0x00ffff, 1.2, 1.8);
    state.crystalBallLight.position.set(0, 0.065, 0);
    state.crystalBallLight.castShadow = true;
    state.crystalBallLight.shadow.bias = -0.001;
    cbGroup.add(state.crystalBallLight);

    // 4. Framed Gallery Paintings on the right wall
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x2c140e, // mahogany frame
        roughness: 0.75
    });

    // Helper to build a framed painting
    function buildPainting(zCenter, yCenter, width, height, type) {
        const paintGroup = new THREE.Group();
        paintGroup.position.set(3.45, yCenter, zCenter); // on right wall
        paintGroup.rotation.y = -Math.PI / 2; // Face inwards
        state.scene.add(paintGroup);

        // Frame dimensions
        const frameTh = 0.045; // frame border thickness
        const frameD = 0.03; // depth off the wall

        // Back board / Canvas
        const canvasTexture = createPaintingTexture(type);
        const canvasMat = new THREE.MeshStandardMaterial({
            map: canvasTexture,
            roughness: 0.85
        });
        const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), canvasMat);
        canvasMesh.position.set(0, 0, frameD / 2 - 0.002);
        canvasMesh.receiveShadow = true;
        paintGroup.add(canvasMesh);

        // Frame Borders (Left, Right, Top, Bottom)
        // Top
        const bT = new THREE.Mesh(new THREE.BoxGeometry(width + frameTh * 2, frameTh, frameD), frameMat);
        bT.position.set(0, height / 2 + frameTh / 2, 0);
        bT.castShadow = true;
        paintGroup.add(bT);

        // Bottom
        const bB = new THREE.Mesh(new THREE.BoxGeometry(width + frameTh * 2, frameTh, frameD), frameMat);
        bB.position.set(0, -height / 2 - frameTh / 2, 0);
        bB.castShadow = true;
        paintGroup.add(bB);

        // Left
        const bL = new THREE.Mesh(new THREE.BoxGeometry(frameTh, height, frameD), frameMat);
        bL.position.set(-width / 2 - frameTh / 2, 0, 0);
        bL.castShadow = true;
        paintGroup.add(bL);

        // Right
        const bR = new THREE.Mesh(new THREE.BoxGeometry(frameTh, height, frameD), frameMat);
        bR.position.set(width / 2 + frameTh / 2, 0, 0);
        bR.castShadow = true;
        paintGroup.add(bR);

        // Thin gold trim insert (inner border)
        const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.01, height + 0.01, frameD + 0.004), brassMat);
        trim.scale.set(1.01, 1.01, 0.1);
        trim.position.set(0, 0, 0);
        paintGroup.add(trim);
    }

    // Hang 3 paintings on the wall above the desk
    // Painting 1 (Center): Moonlit Lake
    buildPainting(0.45, 1.7, 0.65, 0.48, 'moon');

    // Painting 2 (Left Flank): Alchemical Sun
    buildPainting(-0.06, 1.55, 0.32, 0.32, 'sun');

    // Painting 3 (Right Flank): Whispering Forest
    buildPainting(0.96, 1.55, 0.32, 0.32, 'forest');
}
