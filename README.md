# Suspension Bridge Experience

Procedural `Vite + Three.js` scene focused on a cinematic suspension bridge at golden hour. The experience uses modular TypeScript files, orbit + keyboard camera controls, procedural terrain, reflective water, atmospheric fog, and lightweight post-processing.

## Install and Run

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run test -- --run
npm run build
```

## Controls

- Mouse: orbit, pan, zoom
- `W` / `S`: move forward and backward
- `A` / `D`: strafe left and right
- `R` / `F`: move target up and down
- Arrow keys: rotate camera
- `Q` / `E`: smooth zoom

## Project Structure

- `src/core`: renderer, scene, camera, resize, animation loop
- `src/controls`: orbit + keyboard camera input
- `src/bridge`: bridge geometry split into towers, deck, cables, suspenders, anchorages
- `src/environment`: terrain, water, sky, clouds, mist, vegetation, distant mountains
- `src/postprocessing`: bloom composer setup
- `src/utils`: math, noise, disposal helpers
