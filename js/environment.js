import * as THREE from 'three';
import { state } from './state.js';
import { createProceduralWoodTexture, createProceduralOakTexture } from './textures.js';
import { updateTomeDisplay } from './discovery.js';
import { buildCabin } from './cabin.js';

// --- Environment Mesh Generation ---
export function buildEnvironment() {
    // A. Rustic Floor Plane with canvas-generated procedural wood pattern
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const woodTexture = createProceduralWoodTexture();
    const floorMat = new THREE.MeshStandardMaterial({ 
        map: woodTexture,
        roughness: 0.9,
        metalness: 0.1
    });
    state.floor = new THREE.Mesh(floorGeo, floorMat);
    state.floor.rotation.x = -Math.PI / 2;
    state.floor.position.y = state.FLOOR_LEVEL;
    state.floor.receiveShadow = true;
    state.scene.add(state.floor);

    // B. Rustic Wooden Table with Tapered Legs (Matching Oak Texture)
    state.table = new THREE.Group();
    state.table.position.copy(state.TABLE_POS);
    state.scene.add(state.table);

    const oakTexture = createProceduralOakTexture();
    const tableOakMat = new THREE.MeshStandardMaterial({
        map: oakTexture,
        roughness: 0.85,
        metalness: 0.1
    });

    // Tabletop
    const topGeo = new THREE.BoxGeometry(state.TABLE_WIDTH, 0.05, state.TABLE_DEPTH);
    const topMesh = new THREE.Mesh(topGeo, tableOakMat);
    topMesh.position.set(0, state.TABLE_HEIGHT - 0.025, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    state.table.add(topMesh);

    // Table Legs (4 cylindrical legs)
    const legH = state.TABLE_HEIGHT - 0.05;
    const legGeo = new THREE.CylinderGeometry(0.04, 0.03, legH, 8);
    const offX = state.TABLE_WIDTH / 2 - 0.06;
    const offZ = state.TABLE_DEPTH / 2 - 0.06;

    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeo, tableOakMat);
        const legX = (i % 2 === 0 ? 1 : -1) * offX;
        const legZ = (i < 2 ? 1 : -1) * offZ;
        leg.position.set(legX, legH / 2, legZ);
        leg.castShadow = true;
        leg.receiveShadow = true;
        state.table.add(leg);
    }

    // Apron support frame under tabletop
    const apronW = state.TABLE_WIDTH - 0.12;
    const apronD = state.TABLE_DEPTH - 0.12;
    const apronH = 0.08;
    const apronTh = 0.02;

    const apronF = new THREE.Mesh(new THREE.BoxGeometry(apronW, apronH, apronTh), tableOakMat);
    apronF.position.set(0, state.TABLE_HEIGHT - 0.05 - apronH / 2, offZ - 0.01);
    apronF.castShadow = true;
    state.table.add(apronF);

    const apronB = new THREE.Mesh(new THREE.BoxGeometry(apronW, apronH, apronTh), tableOakMat);
    apronB.position.set(0, state.TABLE_HEIGHT - 0.05 - apronH / 2, -offZ + 0.01);
    apronB.castShadow = true;
    state.table.add(apronB);

    const apronL = new THREE.Mesh(new THREE.BoxGeometry(apronTh, apronH, apronD), tableOakMat);
    apronL.position.set(-offX + 0.01, state.TABLE_HEIGHT - 0.05 - apronH / 2, 0);
    apronL.castShadow = true;
    state.table.add(apronL);

    const apronR = new THREE.Mesh(new THREE.BoxGeometry(apronTh, apronH, apronD), tableOakMat);
    apronR.position.set(offX - 0.01, state.TABLE_HEIGHT - 0.05 - apronH / 2, 0);
    apronR.castShadow = true;
    state.table.add(apronR);

    // C. Cast Iron (Gusseisen) Cauldron
    state.cauldron = new THREE.Group();
    state.cauldron.position.copy(state.CAULDRON_POS);
    state.scene.add(state.cauldron);

    // Cauldron main belly
    const cauldronMat = new THREE.MeshStandardMaterial({
        color: 0x1d1a20,
        roughness: 0.8,
        metalness: 0.85,
        name: "CastIron"
    });
    
    const bellyGeo = new THREE.CylinderGeometry(state.CAULDRON_RADIUS * 0.9, state.CAULDRON_RADIUS, state.CAULDRON_HEIGHT, 24, 8);
    const belly = new THREE.Mesh(bellyGeo, cauldronMat);
    belly.position.y = state.CAULDRON_HEIGHT / 2;
    belly.castShadow = true;
    belly.receiveShadow = true;
    state.cauldron.add(belly);

    // Top decorative outer rim
    const rimGeo = new THREE.TorusGeometry(state.CAULDRON_RADIUS * 0.92, 0.04, 12, 32);
    const rim = new THREE.Mesh(rimGeo, cauldronMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = state.CAULDRON_HEIGHT;
    rim.castShadow = true;
    state.cauldron.add(rim);

    // Three cauldron feet
    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 8), cauldronMat);
        foot.position.set(
            Math.cos(angle) * (state.CAULDRON_RADIUS * 0.8),
            0.05,
            Math.sin(angle) * (state.CAULDRON_RADIUS * 0.8)
        );
        foot.rotation.z = -Math.cos(angle) * 0.25;
        foot.rotation.x = Math.sin(angle) * 0.25;
        foot.castShadow = true;
        state.cauldron.add(foot);
    }

    // Side handles (toruses)
    for (let i = 0; i < 2; i++) {
        const angle = i * Math.PI;
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 16), cauldronMat);
        handle.position.set(
            Math.cos(angle) * (state.CAULDRON_RADIUS * 0.92),
            state.CAULDRON_HEIGHT * 0.7,
            Math.sin(angle) * (state.CAULDRON_RADIUS * 0.92)
        );
        handle.rotation.y = angle;
        handle.rotation.z = 0.5;
        handle.castShadow = true;
        state.cauldron.add(handle);
    }

    // D. Cauldron Liquid surface
    const fluidGeo = new THREE.CylinderGeometry(state.CAULDRON_RADIUS * 0.85, state.CAULDRON_RADIUS * 0.85, 0.02, 24);
    state.fluidMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a0e80, // mystical deep indigo base
        roughness: 0.1,
        metalness: 0.1,
        emissive: 0x240046, // self-glow
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.95
    });
    state.cauldronFluid = new THREE.Mesh(fluidGeo, state.fluidMaterial);
    // place inside the cauldron rim
    state.cauldronFluid.position.set(0, state.CAULDRON_HEIGHT - 0.05, 0);
    state.cauldron.add(state.cauldronFluid);

    // E. Mystical Lighting Layout
    // Dim ambient light to set the night-time cabin environment
    const ambientLight = new THREE.AmbientLight(0x0f0b1a, 1.2);
    state.scene.add(ambientLight);

    // Cauldron Light: projecting mystical upward glow
    const cauldronLight = new THREE.PointLight(0x7b2cbf, 8, 4);
    cauldronLight.position.set(0, state.CAULDRON_HEIGHT + 0.1, 0);
    state.cauldron.add(cauldronLight);
    state.cauldron.userData.light = cauldronLight; // reference to animate color/intensity

    // Warm hearth/candle lantern hanging above table
    const lanternLight = new THREE.PointLight(0xffaa44, 3, 6);
    lanternLight.position.set(1.3, state.TABLE_HEIGHT + 0.3, -1.0);
    lanternLight.castShadow = true;
    lanternLight.shadow.mapSize.width = 1024;
    lanternLight.shadow.mapSize.height = 1024;
    lanternLight.shadow.bias = -0.002;
    state.scene.add(lanternLight);

    // Cozy flame/candle visual mesh for warm light source
    const candleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(1.3, state.TABLE_HEIGHT + 0.05, -1.0);
    
    const flameGeo = new THREE.ConeGeometry(0.015, 0.05, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.07;
    candle.add(flame);
    state.scene.add(candle);

    // F. Lectern and Magic Tome
    // Wooden Lectern pedestal next to cauldron
    state.lectern = new THREE.Group();
    state.lectern.name = "Lectern";
    state.lectern.position.set(-0.9, 0, -1.0); // stand on the left side
    state.lectern.rotation.y = Math.PI / 5; // angle towards player
    state.scene.add(state.lectern);

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x5c4033, // dark wood brown
        roughness: 0.9,
        metalness: 0.05
    });

    // Pedestal base
    const baseGeo = new THREE.BoxGeometry(0.35, 0.05, 0.35);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.025;
    base.castShadow = true;
    state.lectern.add(base);

    // Stand column
    const colGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 12);
    const col = new THREE.Mesh(colGeo, woodMat);
    col.position.y = 0.45;
    col.castShadow = true;
    col.receiveShadow = true;
    state.lectern.add(col);

    // Slanted book support plate
    const shelfGeo = new THREE.BoxGeometry(0.75, 0.03, 0.6);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(0, 1.0, 0); // slightly higher
    shelf.rotation.x = -Math.PI / 6; // Angle it up towards the player's eyes (negative tilts towards player)
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    state.lectern.add(shelf);

    // Magic Tome Open Book UI Plane
    state.tomeCanvas = document.createElement('canvas');
    state.tomeCanvas.width = 1024;
    state.tomeCanvas.height = 512;
    state.tomeCtx = state.tomeCanvas.getContext('2d');
    
    // Draw initial book layout
    updateTomeDisplay();

    state.tomeTexture = new THREE.CanvasTexture(state.tomeCanvas);
    const tomeMat = new THREE.MeshStandardMaterial({
        map: state.tomeTexture,
        roughness: 0.95,
        metalness: 0.0
    });

    // Plane geometry representing the open page layout
    state.tomePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.56), tomeMat);
    state.tomePlane.name = "MagicTome"; // Exclude from Matrix wireframe traverse
    
    // Position flat against the slanted stand surface
    const surfaceOffset = new THREE.Vector3(0, 0.02, 0.005).applyEuler(shelf.rotation);
    state.tomePlane.position.copy(shelf.position).add(surfaceOffset);
    state.tomePlane.rotation.copy(shelf.rotation);
    state.tomePlane.receiveShadow = true;
    state.lectern.add(state.tomePlane);

    // Build the Cozy Cabin environment, including walls, fireplace, bookshelf, and reading corner
    buildCabin();
}
