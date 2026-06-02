import * as THREE from 'three';

// --- Procedural Cozy Plaster Wall Texture ---
export function createProceduralWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#eae2d6'; // Warm creamy plaster
    ctx.fillRect(0, 0, 512, 512);

    // Subtle plaster grain noise
    for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(145, 130, 115, 0.16)';
        const sz = 1 + Math.random() * 2;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, sz, sz);
    }

    // Plaster cracks
    ctx.strokeStyle = 'rgba(95, 85, 75, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        let x = Math.random() * 512;
        let y = Math.random() * 512;
        ctx.moveTo(x, y);
        for (let j = 0; j < 6; j++) {
            x += (Math.random() - 0.5) * 45;
            y += (Math.random() - 0.5) * 45;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
}

// --- Procedural Cozy Oak Timber Texture ---
export function createProceduralOakTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a2213'; // Dark aged oak brown
    ctx.fillRect(0, 0, 256, 256);

    // Grain and streaks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let i = 0; i < 35; i++) {
        ctx.fillRect(0, Math.random() * 256, 256, 1 + Math.random() * 4);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 12; i++) {
        ctx.fillRect(0, Math.random() * 256, 256, 1 + Math.random() * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// --- Scroll Parchment Texture Generator ---
export function createScrollTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5e8d3'; // warm vintage parchment
    ctx.fillRect(0, 0, 256, 128);

    // Shading on edges
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(110, 80, 50, 0.25)');
    grad.addColorStop(0.12, 'rgba(110, 80, 50, 0)');
    grad.addColorStop(0.88, 'rgba(110, 80, 50, 0)');
    grad.addColorStop(1, 'rgba(110, 80, 50, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);

    // Alchemical glyphs/lines drawing (simulating text)
    ctx.strokeStyle = 'rgba(75, 50, 30, 0.8)';
    ctx.lineWidth = 1.5;
    
    // Draw some neat alchemical circles/symbols on left side
    ctx.beginPath();
    ctx.arc(60, 64, 25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(60, 64, 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 34);
    ctx.lineTo(60, 94);
    ctx.moveTo(30, 64);
    ctx.lineTo(90, 64);
    ctx.stroke();

    // Draw handwriting lines on right side
    ctx.strokeStyle = 'rgba(75, 50, 30, 0.6)';
    ctx.lineWidth = 1;
    for (let y = 30; y <= 100; y += 10) {
        ctx.beginPath();
        ctx.moveTo(110, y);
        let currX = 110;
        ctx.moveTo(currX, y);
        while (currX < 225) {
            currX += 5 + Math.random() * 8;
            const wY = y + (Math.random() - 0.5) * 3;
            ctx.lineTo(currX, wY);
        }
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// --- Gallery Paintings Procedural Canvas Textures ---
export function createPaintingTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (type === 'moon') {
        // Painting 1: Moonlit Lake
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
        skyGrad.addColorStop(0, '#060410');
        skyGrad.addColorStop(0.5, '#120b24');
        skyGrad.addColorStop(1, '#2c1642');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
            const rx = Math.random() * 512;
            const ry = Math.random() * 260;
            ctx.fillRect(rx, ry, Math.random() * 1.5, Math.random() * 1.5);
        }

        ctx.shadowColor = '#d9e8ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#f2f6ff';
        ctx.beginPath();
        ctx.arc(256, 120, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#120b24';
        ctx.beginPath();
        ctx.arc(244, 114, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#100a1c';
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(120, 240);
        ctx.lineTo(240, 280);
        ctx.lineTo(380, 220);
        ctx.lineTo(512, 300);
        ctx.lineTo(512, 340);
        ctx.lineTo(0, 340);
        ctx.closePath();
        ctx.fill();

        const waterGrad = ctx.createLinearGradient(0, 320, 0, 512);
        waterGrad.addColorStop(0, '#0f0a1c');
        waterGrad.addColorStop(1, '#05020c');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, 320, 512, 192);

        const refGrad = ctx.createLinearGradient(220, 0, 290, 0);
        refGrad.addColorStop(0, 'rgba(217, 232, 255, 0)');
        refGrad.addColorStop(0.5, 'rgba(217, 232, 255, 0.25)');
        refGrad.addColorStop(1, 'rgba(217, 232, 255, 0)');
        ctx.fillStyle = refGrad;
        for (let y = 330; y < 512; y += 4) {
            const w = (y - 320) * 0.45;
            ctx.fillRect(256 - w / 2, y, w, 2);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const rx = 100 + Math.random() * 312;
            const ry = 340 + Math.random() * 160;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + 30 + Math.random() * 50, ry);
            ctx.stroke();
        }

    } else if (type === 'sun') {
        // Painting 2: Alchemical Sun Sigil
        ctx.fillStyle = '#5c3822';
        ctx.fillRect(0, 0, 512, 512);
        
        const parchGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
        parchGrad.addColorStop(0, '#9e734c');
        parchGrad.addColorStop(0.7, '#6b4528');
        parchGrad.addColorStop(1, '#472b14');
        ctx.fillStyle = parchGrad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = '#dfb566';
        ctx.shadowColor = '#ffd37a';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(256, 256, 140, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(256, 256, 120, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 3;
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i * Math.PI * 2) / rayCount;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(256 + cos * 60, 256 + sin * 60);
            ctx.lineTo(256 + cos * 105, 256 + sin * 105);
            ctx.stroke();
        }

        ctx.fillStyle = '#fce5ad';
        ctx.beginPath();
        ctx.arc(256, 256, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#533219';
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        const r = 40;
        ctx.moveTo(256, 256 + r);
        ctx.lineTo(256 - r * 0.866, 256 - r * 0.5);
        ctx.lineTo(256 + r * 0.866, 256 - r * 0.5);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#cca152';
        ctx.lineWidth = 2.5;
        const runeAngles = [0.2, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6];
        runeAngles.forEach(ang => {
            const cx = 256 + Math.cos(ang) * 130;
            const cy = 256 + Math.sin(ang) * 130;
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.moveTo(cx - 8, cy);
            ctx.lineTo(cx + 8, cy);
            ctx.stroke();
        });

    } else if (type === 'forest') {
        // Painting 3: Whispering Forest
        const forestGrad = ctx.createLinearGradient(0, 0, 512, 512);
        forestGrad.addColorStop(0, '#031718');
        forestGrad.addColorStop(0.6, '#082b24');
        forestGrad.addColorStop(1, '#03100d');
        ctx.fillStyle = forestGrad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = 'rgba(2, 12, 10, 0.4)';
        for (let i = 0; i < 6; i++) {
            const px = 50 + i * 80;
            const ph = 150 + Math.random() * 80;
            ctx.beginPath();
            ctx.moveTo(px, 340);
            ctx.lineTo(px - 35, 340 + ph);
            ctx.lineTo(px + 35, 340 + ph);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = '#010504';
        ctx.beginPath();
        ctx.moveTo(0, 512);
        ctx.quadraticCurveTo(80, 360, 160, 300);
        ctx.quadraticCurveTo(120, 240, 90, 150);
        ctx.lineTo(110, 145);
        ctx.quadraticCurveTo(140, 220, 175, 290);
        ctx.quadraticCurveTo(300, 380, 512, 440);
        ctx.lineTo(512, 512);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(160, 300);
        ctx.quadraticCurveTo(240, 230, 290, 180);
        ctx.lineTo(298, 186);
        ctx.quadraticCurveTo(248, 238, 172, 308);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#00ffd2';
        ctx.shadowColor = '#00ffbf';
        ctx.shadowBlur = 10;
        for (let i = 0; i < 4; i++) {
            const mx = 60 + i * 40;
            const my = 460 + Math.random() * 25;
            ctx.beginPath();
            ctx.arc(mx, my, 8, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.fillRect(mx - 2, my, 4, 12);
            ctx.fillStyle = '#00ffd2';
            ctx.shadowColor = '#00ffbf';
            ctx.shadowBlur = 10;
        }

        ctx.shadowBlur = 12;
        for (let i = 0; i < 15; i++) {
            const fx = Math.random() * 512;
            const fy = Math.random() * 450;
            const fs = 2 + Math.random() * 3;
            ctx.fillStyle = Math.random() > 0.5 ? '#b5ff45' : '#45ffaf';
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(fx, fy, fs, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createProceduralWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rustic deep brown wood floor planks
    ctx.fillStyle = '#22140a';
    ctx.fillRect(0, 0, 512, 512);

    // Plank dividers
    ctx.strokeStyle = '#120a05';
    ctx.lineWidth = 4;
    const plankWidth = 512 / 6;
    for (let i = 0; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(i * plankWidth, 0);
        ctx.lineTo(i * plankWidth, 512);
        ctx.stroke();
    }

    // Grain and stains overlay
    for (let i = 0; i < 400; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 15, 5, 0.15)' : 'rgba(0, 0, 0, 0.12)';
        const w = 4 + Math.random() * 15;
        const h = 40 + Math.random() * 150;
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, w, h);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
}

export function createProceduralTableTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich warm mahogany color base
    ctx.fillStyle = '#442111';
    ctx.fillRect(0, 0, 256, 256);

    // Wood lines details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let i = 0; i < 15; i++) {
        ctx.fillRect(0, Math.random() * 256, 256, 2 + Math.random() * 6);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(0, Math.random() * 256, 256, 1 + Math.random() * 3);
    }

    return new THREE.CanvasTexture(canvas);
}
