import * as THREE from 'three';
import { state } from './state.js';

// --- Cozy Decorative Details Constructor ---
export function buildCozyDetails(beamMaterial) {
    // 1. Sleeping Black Cat Familiar (curled up on the bed chest)
    const catGroup = new THREE.Group();
    catGroup.position.set(-2.7, 0.425, 0.55); // on top of the bed chest
    catGroup.rotation.y = Math.PI / 4.5;
    state.scene.add(catGroup);
    state.registerFloatingProp(catGroup, 0.4); // Float cat

    const catMat = new THREE.MeshStandardMaterial({
        color: 0x181818, // matte black
        roughness: 0.95
    });

    // Curl body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), catMat);
    body.scale.set(1.3, 0.8, 1.0);
    body.castShadow = true;
    catGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), catMat);
    head.position.set(0.065, 0.02, 0.03);
    head.castShadow = true;
    catGroup.add(head);

    // Ears
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.025, 4), catMat);
    earL.position.set(0.065, 0.058, 0.046);
    earL.rotation.z = -0.2;
    earL.rotation.y = 0.2;
    catGroup.add(earL);

    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.025, 4), catMat);
    earR.position.set(0.046, 0.058, 0.016);
    earR.rotation.z = -0.2;
    earR.rotation.y = -0.2;
    catGroup.add(earR);

    // Curled tail
    const tailGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI * 1.25);
    const tail = new THREE.Mesh(tailGeo, catMat);
    tail.position.set(-0.04, -0.016, 0.012);
    tail.rotation.x = Math.PI / 2;
    tail.rotation.y = 0.2;
    tail.castShadow = true;
    catGroup.add(tail);

    // 2. Witch's Broom (Leaning against the wall next to the door)
    const broomGroup = new THREE.Group();
    broomGroup.position.set(0.72, 0.02, 2.86);
    broomGroup.rotation.x = -0.15; // lean back
    broomGroup.rotation.z = 0.08;  // lean side
    state.scene.add(broomGroup);
    state.registerFloatingProp(broomGroup, 0.65); // Float broom

    const stickMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xb59c5d, roughness: 0.95 });
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });

    const broomHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.45, 8), stickMat);
    broomHandle.position.y = 0.725;
    broomHandle.castShadow = true;
    broomGroup.add(broomHandle);

    const straw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 12), strawMat);
    straw.position.y = 0.14;
    straw.castShadow = true;
    broomGroup.add(straw);

    const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), stringMat);
    tie.position.y = 0.28;
    broomGroup.add(tie);

    // 3. Hanging Dried Herb Bundles from Rafters
    const herbColors = [
        0x4d7c59, // Green sage
        0x7b588c, // Purple lavender
        0x9a4b59  // Burgundy dried rose
    ];

    function hangHerbs(x, z, color) {
        const bundle = new THREE.Group();
        bundle.position.set(x, 2.95, z); // hang below rafters
        state.scene.add(bundle);

        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.95 });

        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.12, 6), stemMat);
        string.position.y = 0.06;
        bundle.add(string);

        const stems = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 6), stemMat);
        stems.position.y = -0.065;
        bundle.add(stems);

        for (let i = 0; i < 10; i++) {
            const cluster = new THREE.Mesh(
                new THREE.SphereGeometry(0.015 + Math.random() * 0.015, 6, 6),
                leafMat
            );
            const radius = 0.04 * Math.random();
            const angle = Math.random() * Math.PI * 2;
            cluster.position.set(
                Math.cos(angle) * radius,
                -0.08 - Math.random() * 0.1,
                Math.sin(angle) * radius
            );
            cluster.castShadow = true;
            bundle.add(cluster);
        }
    }

    hangHerbs(-1.5, -0.6, herbColors[0]); // Green Sage above Cauldron-Left
    hangHerbs(1.8, 0.5, herbColors[1]);  // Purple Lavender near books/reading corner
    hangHerbs(-0.8, 1.6, herbColors[2]);  // Burgundy rose near bed corner

    // 4. Cozy fireplace sheepskin/faux-fur rug
    const rugGeo = new THREE.CircleGeometry(0.7, 24);
    rugGeo.scale(1.4, 0.9, 1.0); // stretch to make oval shape
    rugGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dfdcd5'; // Warm grey/cream faux fur
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#c5c2ba';
    ctx.lineWidth = 1;
    for (let i = 0; i < 300; i++) {
        const rx = Math.random() * 128;
        const ry = Math.random() * 128;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + (Math.random() - 0.5) * 8, ry + (Math.random() - 0.5) * 8);
        ctx.stroke();
    }

    const rugTexture = new THREE.CanvasTexture(canvas);
    const rugMat = new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 0.98
    });
    const fireplaceRug = new THREE.Mesh(rugGeo, rugMat);
    fireplaceRug.position.set(-2.1, 0.005, -1.1); // in front of fireplace
    fireplaceRug.receiveShadow = true;
    state.scene.add(fireplaceRug);
}
