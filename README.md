# Simple Ray Tracing + Procedural Creatures (WIP)

A small collection of p5.js prototypes focused on:
- simple 2D “ray tracing” / visibility cones (ray casting against rectangle obstacles)
- procedural creature/organism movement using a spine of linked joints
- groundwork for a first-person-style view using ray distances

This repo is experimental and currently includes mostly logic files (not much styling/UI yet).

---

## What’s in here

### 1) Procedural spine / creature body
Two prototypes exploring a “spine” made of linked points/vertebrae:
- basic dragging + joint constraints
- angle limiting between joints
- collision/overlap resolving between non-neighbor joints
- parametric left/right edge points used to draw a smooth body outline

This is the base for “little animal fellas” that move as a connected chain.

### 2) Ray casting / visibility cone (2D)
A player with velocity-based facing direction casts rays into the scene:
- rays are cast inside a forward cone
- extra rays are added toward obstacle corners for cleaner visibility edges
- the visible region is drawn as a filled shape
- enemies are only drawn if they are inside the cone *and* not blocked by obstacles (line of sight)

### 3) Movement helper
A small movement function that applies acceleration + friction and constrains the player inside the canvas bounds.

---

## Planned next steps

- **First-person POV mode:** use the ray hit distances to render a simple “wall slice” view (classic raycaster style).
- **Neuroevolution agents:** add evolved “brains” to control creature movement / navigation using ray distances and other inputs.
- Clean up and reorganize into a more standard project structure.

---

## How to run

These sketches are intended to run in a p5.js environment.

Recommended:
- open with a local server (VS Code Live Server), or
- use the p5.js editor, or
- host as a simple static site (GitHub Pages)

If you have an `index.html` that loads the scripts, open that page via a local server.

---

## Notes / To-do (cleanup)

- Split each prototype into its own folder (or separate entry points)
- Standardize naming (`Vert` vs `Vpoint`, etc.)
- Remove duplicated code (random helpers, movement, etc.)
- Add a minimal `index.html` per prototype so each demo is one click to run
- Add screenshots/GIFs for each demo in the README
- Add a short “controls” section per prototype once UI is finalized

---
