# Project Overview

**Space Destroyers** — a Phaser 3 space shooter written in TypeScript, bundled with Vite.

## Tech Stack
| | |
|---|---|
| Game framework | Phaser 3.90 |
| Language | TypeScript 6 (strict, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Bundler | Vite 8 |
| Target | ES2023, bundler module resolution |
| Assets | Zero external image/audio files — all textures procedural (BootScene), all audio synthesised (Web Audio API). Exception: `public/assets/ship-falcon.png` (80×134 px) |

## Canvas
480 × 800 px, Phaser Arcade physics.

## Scene Flow
```
BootScene → MenuScene → GameScene → GameOverScene → MenuScene
```

## File Structure
```
src/
  main.ts                 Phaser config; scene registration
  style.css
  scenes/
    BootScene.ts          Generates all textures; loads PNG; → MenuScene
    MenuScene.ts          Ship selector, theme picker, mode buttons, mute
    GameScene.ts          Main game loop; wires all entities and managers
    GameOverScene.ts      Grade badge, stats card, play-again / menu
  entities/
    Player.ts
    Enemy.ts
    Boss.ts
    Bullet.ts
    EnemyBullet.ts
    PowerUp.ts
  managers/
    AudioManager.ts
    BossManager.ts
    ComboManager.ts
    DifficultyManager.ts
    EnemySpawnManager.ts
    PowerUpManager.ts
    ScoreManager.ts
    StatsManager.ts
    TimerManager.ts
  ui/
    HUD.ts
    FloatingText.ts
  utils/
    Constants.ts          Single source of truth for all tunable values and types
    Random.ts             mulberry32 PRNG + weighted pick helpers
    Storage.ts            localStorage wrapper
public/
  assets/
    ship-falcon.png       80×134 px; Phaser texture key 'player'
context/                  ← you are here
```

## Depth Order
| Depth | Content |
|---|---|
| −3 | `backgroundNebula` (slow parallax 0.07/frame) |
| −2 | `backgroundFar` (medium parallax 0.35/frame) |
| −1 | `background` (near stars, fast parallax 0.9/frame, theme-tinted) |
| 0 | Default entities (enemies, bullets, power-ups) |
| 3 | Boss glow aura (additive blend) |
| 4 | Boss sprite |
| 5 | Player |
| 14–16 | Laser beam layers |
| 19 | Touch UI |
| 20 | HUD |
| 22 | FloatingText |
| 25 | Combo text (in HUD header) |
| 30 | Boss warning banner |

## Game Modes
| Mode | Timer | Ends when |
|---|---|---|
| `'timed'` | 60 s countdown | Timer hits 0 or player dies |
| `'infinite'` | Counts up (HUD shows ∞) | Player dies |

## Design System
- Font: `Arial Black, sans-serif`
- Dark glass panels: `0x030a18` / `0x04101e`
- Cyan accent: `#6cf3ff`
- Gold highlight: `#ffe050`
- TextShadow: always use `offsetX`/`offsetY` (NOT `x`/`y`)
