import * as THREE from 'three';

export const state = {
    // Core Application States
    scene: null,
    camera: null,
    renderer: null,
    cameraGroup: null,
    controls: null, // OrbitControls for desktop testing
    clock: new THREE.Clock(),

    // Environment configuration
    FLOOR_LEVEL: 0,
    TABLE_HEIGHT: 0.8,
    TABLE_WIDTH: 1.4,
    TABLE_DEPTH: 0.9,
    TABLE_POS: new THREE.Vector3(1.3, 0, -1.0), // right side of start
    CAULDRON_POS: new THREE.Vector3(0, 0, -1.1), // center, close enough to reach
    CAULDRON_RADIUS: 0.35,
    CAULDRON_HEIGHT: 0.7,

    // Interactive Objects & State
    ingredients: [],
    ingredientsInPot: [],
    gravity: -9.8,

    // Floating environment props registry for zero-gravity spell
    floatingProps: [],
    registerFloatingProp(obj, maxFloat = 0.8) {
        obj.userData.originalPosition = obj.position.clone();
        obj.userData.originalRotation = obj.rotation.clone();
        obj.userData.floatOffset = Math.random() * Math.PI * 2;
        obj.userData.floatSpeed = 0.7 + Math.random() * 0.6;
        obj.userData.maxFloat = maxFloat * (0.8 + Math.random() * 0.4);
        obj.userData.currentFloat = 0.0;
        state.floatingProps.push(obj);
    },

    // Spell/Alchemical States
    activeSpell: null,
    gravityActive: true,
    timeScale: 1.0,
    targetCameraGroupScale: new THREE.Vector3(1, 1, 1),
    targetCameraGroupY: 0,
    spellProgress: 0, // for animating cauldron color transitions
    explosionShake: 0, // for camera screen shake effect

    // Mesh References
    floor: null,
    table: null,
    cauldron: null,
    cauldronFluid: null,
    fluidMaterial: null,
    toadEgg: null,
    flyAmanita: null,
    batWing: null,
    swampSlime: null,
    phoenixAsh: null,
    mandrakeRoot: null,
    moonflower: null,
    magicTome: null,
    tomePlane: null,
    tomeCanvas: null,
    tomeCtx: null,
    tomeTexture: null,
    particleSystem: null, // points emitter for active spell
    cauldronBeam: null, // mesh/group for Aether Beam Mix
    resetRune: null, // mesh/group for VR Reset Rune
    particleData: [], // custom particle kinematics/spiral data
    starfieldSystem: null, // points emitter for Cosmic Starfield state
    fireplaceLight: null,
    fireplaceParticles: null,
    fireplaceParticleData: [],
    crystalBallLight: null,

    // VR Controllers & Interaction
    controllers: [],
    controllerTrackers: [], // tracks velocity
    teleportArcs: [], // curved line helpers
    teleportMarkers: [], // target rings on floor
    activeTeleportController: null, // tracking which hand is pointing teleport arc

    // Desktop interaction state (Mouse drag physics)
    raycasterDesktop: new THREE.Raycaster(),
    mousePosition: new THREE.Vector2(),
    desktopGrabbedObject: null,
    desktopGrabDepth: 0,
    desktopPositionHistory: [],
    isOrbitingEnabled: true,

    // Shared UI / Helper triggers
    msgBanner: null,
    discoveredPotions: {}
};
