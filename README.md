# The Witch's Cauldron: Tome of Secrets WebXR Prototype

An immersive WebXR VR prototype built on **Three.js** that transports the player into a cozy, atmospheric witch’s cabin. Step up to the glowing cauldron, combine mythical ingredients, and unlock ancient spells that alter the physics, environment, and visual matrix of the cabin.

---

## Technology Stack & Architecture

- **Core Engine**: Three.js (WebGL 3D Library, v0.160.0)
- **Platform**: WebXR Device API (via WebGLRenderer.xr)
- **Logic**: ES6 Modules / Vanilla JavaScript
- **Styling**: Vanilla CSS (sleek dark mode, alchemical typography)
- **Assets**: 100% Procedurally generated 3D meshes (geometries, custom particles, and dynamic materials) to ensure instant loading and maximum compatibility.

---

## Core Features & Mechanics

- **Cauldron Alchemy**: Toss ingredients into the cauldron. When exactly two unique ingredients are added, the Cauldron evaluates the combination.
- **Magic Tome**: Discovered recipes are drawn in real-time onto an interactive, 3D parchment book resting on the sideboard.
- **Dynamic Physics Engine**: Custom kinematic physics handling gravity, table collisions, boundaries, throwing velocities, and time-scale dilation.
- **Atmospheric Environment**: Fully modeled witch cabin containing a crackling fireplace, floating candles, cozy props, window backdrops, and volumetric fog.

---

## Magical Ingredients

1. **Toad Egg** (Blue bumpy organic sphere)
2. **Fly Amanita** (Red cylinder with white spots)
3. **Bat Wing** (Grey mesh)
4. **Swamp Slime** (Green fluid sphere)
5. **Phoenix Ash** (Orange glowing mesh)
6. **Mandrake Root** (Brown organic root)
7. **Moonflower** (White flower)

---

## The Spellbook (Special Recipes)

Combine two ingredients in the cauldron to unleash one of **9 special spells**:

| Ingredient A | Ingredient B | Spell Name | Effect Description |
| :--- | :--- | :--- | :--- |
| **Toad Egg** | **Fly Amanita** | **Antigravity State** | Disables gravity. Ingredients float and glowing green particles swirl upwards. |
| **Bat Wing** | **Swamp Slime** | **Time Dilation State** | Dilates time to 15% speed, slowing down physics and velocities. |
| **Fly Amanita** | **Bat Wing** | **Shrinking Spell State** | Shrinks the player down to bug-size, scaling the room up. |
| **Toad Egg** | **Swamp Slime** | **Inferno Vortex State** | Spawns a raging, swirling vortex of flame particles from the cauldron. |
| **Phoenix Ash** | **Mandrake Root** | **Cosmic Starfield State** | Extinguishes cabin lights, turning the room into a deep space nebula. |
| **Mandrake Root** | **Bat Wing** | **Wireframe Matrix Mode** | Transforms all meshes in the scene into glowing green wireframes. |
| **Moonflower** | **Fly Amanita** | **Love Mix** | Turns the fluid pink, spawning heart particles with a screen filter. |
| **Moonflower** | **Phoenix Ash** | **Explosion Mix** | Triggers a visual blast with screen-shake. |
| **Mandrake Root** | **Moonflower** | **Aether Beam Mix** | Fires a towering pillar of light upwards from the liquid. |

*Any other combination results in **Basic Sludge**.*

---

## Controls

### VR Mode (WebXR Controllers)
- **Navigate / Teleport**: Press and hold the **Squeeze Button** on either controller to cast a green parabolic arc. Aim it at the floor, and release to teleport.
- **Grab Ingredients**: Point your controller ray at any ingredient and press the **Trigger Button**.
- **Throw Ingredients**: Release the **Trigger Button** while moving your arm to toss the ingredient into the cauldron.
- **Reset Cauldron**: Aim your laser pointer at the glowing **Reset Rune** on the wall and press the **Trigger**.
- **Witch Hands**: Responsive, procedurally generated **witch-green hands** are attached to your controllers. The fingers automatically curl into a grabbing fist when pressing the trigger.

### Desktop Simulation Fallback
- **Look Around**: Click and drag your mouse.
- **Pan / Zoom**: Use Right-click drag or the Scroll wheel.
- **Interact**: Use the **Direct Simulation Commands** panel in the HUD to simulate ingredient drops and reset the scene with single clicks.

---

## Running Locally

Since WebXR and modules require secure contexts, run the project using a local development server:

Using python:
```bash
python -m http.server 8000
```
Or using Node.js/npm:
```bash
npx serve .
```

Open the address in your browser (e.g., `http://localhost:8000`), or enter it in your VR headset's web browser.
