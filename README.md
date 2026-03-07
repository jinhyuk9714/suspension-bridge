# Suspension Bridge

![Suspension Bridge overview](image/bridge-intro.png)

A real-time bridge study built with Vite, TypeScript, and Three.js.

This project started as a scene exercise and ended up closer to a small portfolio piece. The bridge, terrain, sky, water, and road traffic are all procedural. The target was simple: open the page and immediately get a strong sense of scale, structure, and atmosphere.

## What’s in the scene

- Procedural suspension bridge with towers, main cables, suspenders, anchorages, and an extended deck shoulder that connects cleanly to the cable line
- Golden-hour lighting tuned for both front-lit and back-lit views
- Reflective water with custom reflection grading to keep the bridge reflection from shifting too warm
- Layered terrain, distant mountain silhouettes, vegetation, clouds, and environmental depth
- Ambient road traffic with cars, trucks, and buses moving in both directions
- Mouse orbit/pan/zoom plus smooth keyboard camera movement

## Stack

- Vite
- TypeScript
- Three.js
- Vitest

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

If you want a production build locally:

```bash
npm run build
npm run preview
```

## Validation

```bash
npm run typecheck
npm test -- --run
npm run build
```

## Controls

- Mouse: orbit, pan, zoom
- `W` / `S`: move forward and backward
- `A` / `D`: strafe left and right
- `R` / `F`: move camera target up and down
- Arrow keys: rotate camera
- `Q` / `E`: smooth zoom

## Project layout

- `src/app`: scene assembly
- `src/core`: renderer, scene, camera, resize, animation loop
- `src/controls`: mouse and keyboard camera controls
- `src/bridge`: bridge geometry and material modules
- `src/environment`: terrain, water, sky, clouds, vegetation, distant mountains
- `src/traffic`: ambient vehicle system
- `src/postprocessing`: composer and bloom setup

## Notes

- No external 3D models are used.
- The bridge and surrounding environment are built from procedural geometry and tuned materials.
- The codebase is split into focused modules so the scene can be extended without reworking the whole setup.
