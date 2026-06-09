import * as THREE from 'three';
import { state } from './state.js';

// --- Spawn Ingredient Meshes with Procedural Details ---
export function spawnIngredients() {
    // A. Toad Egg: Blue bumpy organic sphere
    const toadEggGroup = new THREE.Group();
    toadEggGroup.name = "Toad Egg";
    
    const eggBaseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eggMat = new THREE.MeshStandardMaterial({
        color: 0x0066ff, // Mystical Blue
        roughness: 0.15,
        metalness: 0.2,
        emissive: 0x002288,
        emissiveIntensity: 0.8
    });
    const eggBase = new THREE.Mesh(eggBaseGeo, eggMat);
    eggBase.castShadow = true;
    toadEggGroup.add(eggBase);

    // Add small bumpy nodes of varying size
    const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff, // Glowing cyan/light-blue
        roughness: 0.2,
        emissive: 0x0055aa,
        emissiveIntensity: 0.5
    });
    for (let i = 0; i < 12; i++) {
        const nodeSize = 0.01 + Math.random() * 0.015;
        const nodeGeo = new THREE.SphereGeometry(nodeSize, 8, 8);
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        
        // Distribute nodes randomly on sphere shell
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 0.075;
        
        node.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
        toadEggGroup.add(node);
    }

    toadEggGroup.position.set(0.8, state.TABLE_HEIGHT + 0.08, -1.0);
    toadEggGroup.userData = {
        name: "Toad Egg",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.08,
        bottomOffset: 0.08,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(0.8, state.TABLE_HEIGHT + 0.08, -1.0)
    };
    state.scene.add(toadEggGroup);
    state.ingredients.push(toadEggGroup);
    state.toadEgg = toadEggGroup;

    // B. Fly Amanita: Red Cylinder
    const mushroomGroup = new THREE.Group();
    mushroomGroup.name = "Fly Amanita";

    // Stylized Red Cylinder body
    const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.14, 16);
        const cylinderMat = new THREE.MeshStandardMaterial({
            color: 0xd90429, // Crimson Red
            roughness: 0.4,
            metalness: 0.1,
            emissive: 0xd90429,
            emissiveIntensity: 0.8
        });
    const mainBody = new THREE.Mesh(cylinderGeo, cylinderMat);
    mainBody.position.y = 0.07;
    mainBody.castShadow = true;
    mushroomGroup.add(mainBody);

    // Add decorative white spots directly on the cylinder to keep the fly amanita identity
    const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    for (let i = 0; i < 8; i++) {
        const spotGeo = new THREE.SphereGeometry(0.01, 8, 8);
        const spot = new THREE.Mesh(spotGeo, spotMat);
        const angle = (i * Math.PI * 2) / 8;
        const h = 0.02 + Math.random() * 0.1;
        spot.position.set(Math.cos(angle) * 0.045, h, Math.sin(angle) * 0.045);
        mushroomGroup.add(spot);
    }

    mushroomGroup.position.set(1.0, state.TABLE_HEIGHT, -1.0);
    mushroomGroup.userData = {
        name: "Fly Amanita",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.0, state.TABLE_HEIGHT, -1.0)
    };
    state.scene.add(mushroomGroup);
    state.ingredients.push(mushroomGroup);
    state.flyAmanita = mushroomGroup;

    // C. Bat Wing: Dark Grey ExtrudeGeometry / Wing Shape
    const wingGroup = new THREE.Group();
    wingGroup.name = "Bat Wing";

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(0.04, 0.08, 0.1, 0.06);
    wingShape.quadraticCurveTo(0.06, 0.01, 0.09, -0.04);
    wingShape.quadraticCurveTo(0.03, -0.02, 0, 0);

    const extrudeSettings = {
        depth: 0.015,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.003,
        bevelThickness: 0.003
    };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.center();

    const wingMat = new THREE.MeshStandardMaterial({
        color: 0x2b2b2b, // Dark grey
        roughness: 0.7,
        metalness: 0.3,
        emissive: 0x4a0e80, // mystical deep purple
        emissiveIntensity: 0.8
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.y = 0.05;
    wingMesh.castShadow = true;
    wingGroup.add(wingMesh);

    wingGroup.position.set(1.2, state.TABLE_HEIGHT, -1.0);
    wingGroup.userData = {
        name: "Bat Wing",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.08,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.2, state.TABLE_HEIGHT, -1.0)
    };
    state.scene.add(wingGroup);
    state.ingredients.push(wingGroup);
    state.batWing = wingGroup;

    // D. Swamp Slime: Neon Green Deformed Icosahedron
    const slimeGroup = new THREE.Group();
    slimeGroup.name = "Swamp Slime";

    const slimeGeo = new THREE.IcosahedronGeometry(0.07, 1);
    const posAttr = slimeGeo.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
        vertex.fromBufferAttribute(posAttr, i);
        vertex.addScaledVector(vertex.clone().normalize(), (Math.random() - 0.5) * 0.02);
        posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    slimeGeo.computeVertexNormals();

    const slimeMat = new THREE.MeshStandardMaterial({
        color: 0x39ff14, // Neon Green
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
        emissive: 0x39ff14,
        emissiveIntensity: 0.8
    });
    const slimeMesh = new THREE.Mesh(slimeGeo, slimeMat);
    slimeMesh.position.y = 0.07;
    slimeMesh.castShadow = true;
    slimeGroup.add(slimeMesh);

    slimeGroup.position.set(-2.7, 0.48, 1.9);
    slimeGroup.userData = {
        name: "Swamp Slime",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(-2.7, 0.48, 1.9)
    };
    state.scene.add(slimeGroup);
    state.ingredients.push(slimeGroup);
    state.swampSlime = slimeGroup;

    // E. Phoenix Ash: Glowing Orange/Yellow clustered sphere dust-cloud
    const ashGroup = new THREE.Group();
    ashGroup.name = "Phoenix Ash";

    const ashMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00, // Golden Orange
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: 0xff4500,
        emissiveIntensity: 1.5
    });

    const mainAsh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), ashMat);
    mainAsh.castShadow = true;
    ashGroup.add(mainAsh);

    for (let i = 0; i < 4; i++) {
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), ashMat);
        const angle = (i * Math.PI * 2) / 4;
        sat.position.set(Math.cos(angle) * 0.035, (Math.random() - 0.5) * 0.03, Math.sin(angle) * 0.035);
        ashGroup.add(sat);
    }

    ashGroup.position.set(2.09, 0.44, 1.80);
    ashGroup.userData = {
        name: "Phoenix Ash",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        bottomOffset: 0.04,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(2.09, 0.44, 1.80)
    };
    state.scene.add(ashGroup);
    state.ingredients.push(ashGroup);
    state.phoenixAsh = ashGroup;

    // F. Mandrake Root: Brown twisted Cylinder root
    const rootGroup = new THREE.Group();
    rootGroup.name = "Mandrake Root";

    const rootMat = new THREE.MeshStandardMaterial({
        color: 0x5c4033, // Matte brown root color
        roughness: 0.95,
        metalness: 0.05,
        emissive: 0xaa7c11, // amber/gold glow
        emissiveIntensity: 0.6
    });

    const baseRoot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.12, 10), rootMat);
    baseRoot.position.y = 0.06;
    baseRoot.rotation.z = 0.2; // slight twist
    baseRoot.castShadow = true;
    rootGroup.add(baseRoot);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.08, 8), rootMat);
    leftLeg.position.set(-0.02, 0.02, 0.01);
    leftLeg.rotation.z = 0.5;
    leftLeg.castShadow = true;
    rootGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.08, 8), rootMat);
    rightLeg.position.set(0.02, 0.02, -0.01);
    rightLeg.rotation.z = -0.5;
    rightLeg.castShadow = true;
    rootGroup.add(rightLeg);

    rootGroup.position.set(-3.3, 0.875, -2.4);
    rootGroup.userData = {
        name: "Mandrake Root",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(-3.3, 0.875, -2.4)
    };
    state.scene.add(rootGroup);
    state.ingredients.push(rootGroup);
    state.mandrakeRoot = rootGroup;

    // G. Moonflower: Glowing white/blue flower with silver petals
    const flowerGroup = new THREE.Group();
    flowerGroup.name = "Moonflower";

    // Stem: thin green cylinder
    const stemGeo = new THREE.CylinderGeometry(0.006, 0.008, 0.12, 8);
    const stemMat = new THREE.MeshStandardMaterial({
        color: 0x2e5c36, // green stem
        roughness: 0.8
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.06;
    stem.castShadow = true;
    flowerGroup.add(stem);

    // Glowing core: glowing soft blue/white sphere
    const coreGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x90ccff,
        emissiveIntensity: 1.8,
        roughness: 0.2
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.12;
    core.castShadow = true;
    flowerGroup.add(core);

    // Petals: small flat silver/blue ellipsoids
    const petalGeo = new THREE.SphereGeometry(0.015, 8, 8);
    petalGeo.scale(2.2, 0.4, 1.0); // flatten and stretch
    const petalMat = new THREE.MeshStandardMaterial({
        color: 0xe0e8f0, // silver/pale blue
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x2b4c7e,
        emissiveIntensity: 0.5
    });

    for (let i = 0; i < 5; i++) {
        const petal = new THREE.Mesh(petalGeo, petalMat);
        const angle = (i * Math.PI * 2) / 5;
        petal.position.set(Math.cos(angle) * 0.02, 0.12, Math.sin(angle) * 0.02);
        petal.rotation.y = -angle;
        petal.rotation.z = 0.3; // tilt upwards
        petal.castShadow = true;
        flowerGroup.add(petal);
    }

    flowerGroup.position.set(-0.3, 0.875, -3.7);
    flowerGroup.userData = {
        name: "Moonflower",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.08,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(-0.3, 0.875, -3.7)
    };
    state.scene.add(flowerGroup);
    state.ingredients.push(flowerGroup);
    state.moonflower = flowerGroup;

    // H. Magic Tome: 3D grabbable open book
    const bookGroup = new THREE.Group();
    bookGroup.name = "MagicTome";

    const bookCoverMat = new THREE.MeshStandardMaterial({
        color: 0x4a2a16, // leather brown
        roughness: 0.8,
        metalness: 0.1,
        emissive: 0x221105, // very light self-glow for cover
        emissiveIntensity: 0.5
    });
    const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.58), bookCoverMat);
    bookCover.position.y = 0.015;
    bookCover.castShadow = true;
    bookCover.receiveShadow = true;
    bookGroup.add(bookCover);

    const bookPagesMat = new THREE.MeshStandardMaterial({
        color: 0xfaedd6, // parchment
        roughness: 0.9,
        emissive: 0x3d3525, // self-glow
        emissiveIntensity: 0.4
    });
    const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.024, 0.56), bookPagesMat);
    pageBlock.position.y = 0.042;
    pageBlock.castShadow = true;
    pageBlock.receiveShadow = true;
    bookGroup.add(pageBlock);

    const bookTomeMat = new THREE.MeshStandardMaterial({
        map: state.tomeTexture,
        emissiveMap: state.tomeTexture, // make text glow!
        emissive: new THREE.Color(0x777777), // glow intensity
        roughness: 0.95,
        metalness: 0.0
    });
    state.tomePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.70, 0.56), bookTomeMat);
    state.tomePlane.name = "MagicTome";
    state.tomePlane.rotation.x = -Math.PI / 2;
    state.tomePlane.position.y = 0.055;
    state.tomePlane.receiveShadow = true;
    bookGroup.add(state.tomePlane);

    // Position it initially flat on the main table next to the ingredients
    bookGroup.position.set(1.68, state.TABLE_HEIGHT, -1.0);
    bookGroup.rotation.set(0, 0, 0);

    bookGroup.userData = {
        name: "Magic Tome",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.28,
        bottomOffset: 0.0,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.68, state.TABLE_HEIGHT, -1.0),
        initialRot: new THREE.Euler(0, 0, 0)
    };

    state.scene.add(bookGroup);
    state.ingredients.push(bookGroup);
    state.magicTome = bookGroup;

    // A physical Reset Button placed on the table
    const buttonGroup = new THREE.Group();
    buttonGroup.name = "ResetButton";
    
    // 1. Stone/wooden base plate sitting on the table
    const baseGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.02, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x3a2f28, roughness: 0.8, metalness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.01;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    buttonGroup.add(baseMesh);

    // 2. Glowing red button cap that is raised
    const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.018, 16);
    const capMat = new THREE.MeshStandardMaterial({
        color: 0xff2200,
        emissive: 0xbb0000,
        emissiveIntensity: 1.8,
        roughness: 0.2,
        metalness: 0.1
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 0.025; // slightly raised above base
    capMesh.castShadow = true;
    buttonGroup.add(capMesh);

    // Place the button on the left side of the table, near the cauldron
    // Cauldron is at (0, 0, -1.1). Table height is state.TABLE_HEIGHT (0.8).
    buttonGroup.position.set(0.7, state.TABLE_HEIGHT, -0.7);
    
    state.scene.add(buttonGroup);
    state.resetRune = buttonGroup;

    // Initialize particle emitters for all actual brewing ingredients (exclude Tome)
    state.ingredients.forEach(item => {
        if (item.userData.name !== "Magic Tome") {
            createIngredientParticles(item);
        }
    });
}

function createIngredientParticles(group, particleCount = 15) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleData = [];

    // Create a circular glowing canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    // Initialize particles locally within the group's coordinate frame
    for (let i = 0; i < particleCount; i++) {
        const life = Math.random(); // staggered starting life
        const x = (Math.random() - 0.5) * 0.08;
        const y = (group.userData.bottomOffset || 0) + Math.random() * 0.1;
        const z = (Math.random() - 0.5) * 0.08;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        colors[i * 3] = life;
        colors[i * 3 + 1] = life;
        colors[i * 3 + 2] = life;

        particleData.push({
            x: x,
            y: y,
            z: z,
            speedY: 0.08 + Math.random() * 0.12,
            speedX: (Math.random() - 0.5) * 0.04,
            speedZ: (Math.random() - 0.5) * 0.04,
            life: life,
            decay: 0.4 + Math.random() * 0.5
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.04,
        map: texture,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    group.add(particles);

    group.userData.particleSystem = particles;
    group.userData.particleData = particleData;
}

export function updateIngredientParticles(dt) {
    state.ingredients.forEach(group => {
        // Handle sinking and fading out when in pot
        if (group.userData.inPot) {
            if (group.userData.sinkProgress === undefined) {
                group.userData.sinkProgress = 0;
            }
            if (group.userData.sinkProgress >= 0) {
                if (group.userData.sinkProgress === 0) {
                    group.userData.sinkProgress = 0.01;
                    group.userData.sinkStartScale = group.scale.clone();
                }
                group.userData.sinkProgress += dt * 1.25; // 0.8 seconds duration
                const progress = Math.min(group.userData.sinkProgress, 1.0);
                
                if (group.userData.sinkStartScale) {
                    group.scale.copy(group.userData.sinkStartScale).multiplyScalar(1.0 - progress);
                }
                group.position.y -= dt * 0.35; // sink down at 35cm/sec
                
                if (progress >= 1.0) {
                    group.visible = false;
                    group.userData.sinkProgress = -1; // finished sinking
                }
            }
            
            if (group.userData.particleSystem) {
                group.userData.particleSystem.visible = false;
            }
            return;
        } else {
            if (group.userData.particleSystem) {
                group.userData.particleSystem.visible = true;
            }
        }

        if (!group.userData.particleSystem || !group.userData.particleData) return;

        const system = group.userData.particleSystem;
        const positions = system.geometry.attributes.position.array;
        const colors = system.geometry.attributes.color.array;
        const dataList = group.userData.particleData;

        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            
            data.life -= data.decay * dt;
            data.y += data.speedY * dt;
            data.x += data.speedX * dt;
            data.z += data.speedZ * dt;

            // Respawn if dead
            if (data.life <= 0) {
                data.life = 1.0;
                data.x = (Math.random() - 0.5) * 0.08;
                data.y = (group.userData.bottomOffset || 0) + Math.random() * 0.05;
                data.z = (Math.random() - 0.5) * 0.08;
                data.speedY = 0.08 + Math.random() * 0.12;
                data.speedX = (Math.random() - 0.5) * 0.04;
                data.speedZ = (Math.random() - 0.5) * 0.04;
                data.decay = 0.4 + Math.random() * 0.5;
            }

            positions[i * 3] = data.x;
            positions[i * 3 + 1] = data.y;
            positions[i * 3 + 2] = data.z;

            // Fade intensity based on remaining life
            const intensity = Math.max(0, Math.min(1, data.life));
            colors[i * 3] = intensity;
            colors[i * 3 + 1] = intensity;
            colors[i * 3 + 2] = intensity;
        }

        system.geometry.attributes.position.needsUpdate = true;
        system.geometry.attributes.color.needsUpdate = true;
    });
}

