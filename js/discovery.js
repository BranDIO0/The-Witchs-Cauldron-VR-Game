import { state } from './state.js';

export class DiscoveryManager {
    constructor() {
        this.ingredientsList = [
            "Toad Egg",
            "Fly Amanita",
            "Bat Wing",
            "Swamp Slime",
            "Phoenix Ash",
            "Mandrake Root"
        ];
        this.specialRecipes = [
            { pair: ["Toad Egg", "Fly Amanita"], name: "Antigravity State", effect: "ANTIGRAVITY", color: 0x39ff14 },
            { pair: ["Bat Wing", "Swamp Slime"], name: "Time Dilation State", effect: "TIME_DILATION", color: 0x8a2be2 },
            { pair: ["Fly Amanita", "Bat Wing"], name: "Shrinking Spell State", effect: "SHRINKING", color: 0x00ffff },
            { pair: ["Toad Egg", "Swamp Slime"], name: "Inferno Vortex State", effect: "INFERNO_VORTEX", color: 0xff4500 },
            { pair: ["Phoenix Ash", "Mandrake Root"], name: "Cosmic Starfield State", effect: "COSMIC_STARFIELD", color: 0x000000 },
            { pair: ["Mandrake Root", "Bat Wing"], name: "Wireframe Matrix Mode", effect: "WIREFRAME_MATRIX", color: 0x00ff00 }
        ];
        this.initDiscoveryState();
    }

    initDiscoveryState() {
        // Generate all 15 unique pairs
        for (let i = 0; i < this.ingredientsList.length; i++) {
            for (let j = i + 1; j < this.ingredientsList.length; j++) {
                const itemA = this.ingredientsList[i];
                const itemB = this.ingredientsList[j];
                const key = this.getCombinationKey(itemA, itemB);
                
                // Check if this pair is a special recipe
                const special = this.specialRecipes.find(r => 
                    r.pair.includes(itemA) && r.pair.includes(itemB)
                );
                
                state.discoveredPotions[key] = {
                    itemA: itemA,
                    itemB: itemB,
                    discovered: false,
                    potionName: special ? special.name : "Basic Sludge",
                    effect: special ? special.effect : "SLUDGE",
                    color: special ? special.color : 0x8b5a2b
                };
            }
        }
    }

    getCombinationKey(itemA, itemB) {
        return [itemA, itemB].sort().join(" + ");
    }

    evaluateCombination(itemA, itemB) {
        const key = this.getCombinationKey(itemA, itemB);
        if (state.discoveredPotions[key]) {
            state.discoveredPotions[key].discovered = true;
            return state.discoveredPotions[key];
        }
        return null;
    }
}

// Magic Tome Drawing Utilities
export function updateTomeDisplay() {
    if (!state.tomeCtx) return;
    drawTomeOnCanvas(state.tomeCanvas, state.tomeCtx, state.discoveredPotions);
    if (state.tomeTexture) state.tomeTexture.needsUpdate = true;
}

export function drawTomeOnCanvas(canvas, ctx, tomeState) {
    // Background - Parchment
    ctx.fillStyle = "#f3e6d8";
    ctx.fillRect(0, 0, 1024, 512);

    // Double page dividers
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 488);

    // Center book binding spine shadow
    ctx.fillStyle = "rgba(100, 70, 40, 0.15)";
    ctx.fillRect(504, 12, 16, 488);
    
    ctx.beginPath();
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 8;
    ctx.moveTo(512, 12);
    ctx.lineTo(512, 500);
    ctx.stroke();

    // Setup styling
    ctx.fillStyle = "#2c1c0c";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Title Left Page
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText("Tome of Secrets", 50, 40);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(90, 58, 26, 0.4)";
    ctx.lineWidth = 3;
    ctx.moveTo(50, 75);
    ctx.lineTo(462, 75);
    ctx.stroke();

    // Title Right Page
    ctx.fillText("Alchemical Ledger", 562, 40);
    ctx.beginPath();
    ctx.moveTo(562, 75);
    ctx.lineTo(974, 75);
    ctx.stroke();

    ctx.font = "17px Arial, sans-serif";
    const keys = Object.keys(tomeState);
    let discoveredCount = 0;

    // Draw left page entries (1-8)
    let yPos = 95;
    for (let i = 0; i < 8; i++) {
        if (i >= keys.length) break;
        const key = keys[i];
        const entry = tomeState[key];
        let text = "";
        if (entry.discovered) {
            text = `${entry.itemA} + ${entry.itemB} = ${entry.potionName}`;
            discoveredCount++;
            ctx.fillStyle = "#228b22"; // Forest green for discovered
        } else {
            text = "?? + ?? = ???";
            ctx.fillStyle = "#7a6e60"; // Muted grey
        }
        ctx.fillText(`${i + 1}. ${text}`, 50, yPos);
        yPos += 42;
    }

    // Draw right page entries (9-15)
    yPos = 95;
    for (let i = 8; i < 15; i++) {
        if (i >= keys.length) break;
        const key = keys[i];
        const entry = tomeState[key];
        let text = "";
        if (entry.discovered) {
            text = `${entry.itemA} + ${entry.itemB} = ${entry.potionName}`;
            discoveredCount++;
            ctx.fillStyle = "#228b22";
        } else {
            text = "?? + ?? = ???";
            ctx.fillStyle = "#7a6e60";
        }
        ctx.fillText(`${i + 1}. ${text}`, 562, yPos);
        yPos += 42;
    }

    // Progress tracking
    ctx.fillStyle = "#5a3a1a";
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText(`Unveiled: ${discoveredCount} / 15 Secrets`, 562, 435);
}
