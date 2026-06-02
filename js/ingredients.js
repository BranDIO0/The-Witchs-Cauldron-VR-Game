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
        emissive: 0x550011,
        emissiveIntensity: 0.3
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
        metalness: 0.3
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
        emissive: 0x145f08,
        emissiveIntensity: 0.4
    });
    const slimeMesh = new THREE.Mesh(slimeGeo, slimeMat);
    slimeMesh.position.y = 0.07;
    slimeMesh.castShadow = true;
    slimeGroup.add(slimeMesh);

    slimeGroup.position.set(1.4, state.TABLE_HEIGHT, -1.0);
    slimeGroup.userData = {
        name: "Swamp Slime",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.4, state.TABLE_HEIGHT, -1.0)
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

    ashGroup.position.set(1.6, state.TABLE_HEIGHT + 0.05, -1.0);
    ashGroup.userData = {
        name: "Phoenix Ash",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.6, state.TABLE_HEIGHT + 0.05, -1.0)
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
        metalness: 0.05
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

    rootGroup.position.set(1.8, state.TABLE_HEIGHT, -1.0);
    rootGroup.userData = {
        name: "Mandrake Root",
        isGrabbed: false,
        grabbedBy: null,
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.07,
        onTable: true,
        inPot: false,
        initialPos: new THREE.Vector3(1.8, state.TABLE_HEIGHT, -1.0)
    };
    state.scene.add(rootGroup);
    state.ingredients.push(rootGroup);
    state.mandrakeRoot = rootGroup;
}
