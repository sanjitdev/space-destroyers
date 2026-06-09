# Project Overview

Space Destroyers is a Phaser 3 arcade shooter written in TypeScript and bundled with Vite.

## Tech Stack

| | |
|---|---|
| Framework | Phaser 3.90 |
| Language | TypeScript 6 strict |
| Bundler | Vite 8 |
| Assets | Procedural textures + Web Audio synth. Exception: public/assets/ship-falcon.png |

## Core Specs

- Canvas: 480 x 800
- Physics: Phaser Arcade
- Scene flow: BootScene -> MenuScene -> GameScene -> GameOverScene -> MenuScene

## Current Gameplay Snapshot

- 6 enemy families (small, medium, heavy, striker, bomber, destroyer)
- 10 boss levels with objective-gated spawns
- HUD objective strip with enemy icons and remaining counts
- 12 power-ups, including ribbon laser (15s)
- Level transition reset: each new level starts with basic weapon

## Key Systems

- Enemy progression uses family unlocks plus stage-based spawn weighting
- Boss progression uses small/medium/heavy objective requirements
- Stored power-ups max 3; consumed with E
- Auto-fire toggle with F

## Depth Order

| Depth | Content |
|---|---|
| -3 | Nebula background |
| -2 | Far stars |
| -1 | Near stars |
| 0 | Default gameplay entities |
| 3 | Boss glow |
| 4 | Boss |
| 5 | Player |
| 14-16 | Laser layers |
| 19 | Touch controls |
| 20 | HUD |
| 22 | Floating text |
| 25 | Combo text |
| 30 | Boss warning banner |
