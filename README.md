# Suspension Bridge

A real-time Three.js bridge study built with Vite and TypeScript.

The scene centers on a large suspension bridge crossing a coastal strait at golden hour. Everything is built procedurally: the bridge, the terrain, the water, the sky, and the ambient traffic moving across the deck. The goal was not to make a game level or a toy diorama. It was to make a clean, focused architectural showcase that feels large, readable, and cinematic as soon as it opens.

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
- The bridge and environment are built from procedural geometry and tuned materials.
- The codebase is split into small modules so the scene can be extended without rewriting the main setup.
