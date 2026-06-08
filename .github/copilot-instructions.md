# Space Destroyers — Copilot Instructions

## Project Overview

A **Phaser 3** space shooter game written in **TypeScript**, bundled with **Vite**. The game runs in a 480×800 canvas, lasts 60 seconds per round, and escalates in difficulty every 10 seconds. Textures are all procedurally generated in `BootScene` using Phaser graphics — there are no external image assets.

**Stack:** Phaser 3.90, TypeScript 6, Vite 8, ES2023 target, bundler module resolution.

---

## Architecture

The codebase is split into five layers under `src/`:

| Layer | Path | Purpose |
|---|---|---|
| Scenes | `src/scenes/` | Phaser scene lifecycle (boot → menu → game → game-over) |
| Entities | `src/entities/` | Arcade-physics sprites (Player, Enemy, Bullet, PowerUp) |
| Managers | `src/managers/` | Pure stateful logic, no Phaser dependencies except where noted |
| UI | `src/ui/` | HUD overlay and floating score text |
| Utils | `src/utils/` | Constants, random helpers, localStorage wrapper |

### Scene flow
`BootScene` → `MenuScene` → `GameScene` → `GameOverScene` → back to `MenuScene`

### Manager responsibilities
- **ScoreManager** — score accumulation and high-score persistence via `Storage`.
- **TimerManager** — tracks elapsed ms; signals game completion at `GAME_DURATION_MS`.
- **DifficultyManager** — computes spawn interval, enemy speed multiplier, and weighted enemy type distribution based on elapsed time in 10-second stages.
- **EnemySpawnManager** — owns the spawn timer; creates `Enemy` instances using `DifficultyManager` weights and applies the speed multiplier.
- **PowerUpManager** — tracks active power-up types and their remaining durations.
- **AudioManager** — synthesises sound effects via the Web Audio API (no audio files).

---

## Key Constants (`src/utils/Constants.ts`)

All tunable values live here. Always import from this file — never use raw magic numbers.

```
GAME_WIDTH = 480, GAME_HEIGHT = 800
GAME_DURATION_MS = 60_000
PLAYER_LIVES = 3, PLAYER_SPEED = 360
PLAYER_FIRE_COOLDOWN_MS = 220 (halved during rapidFire)
BULLET_SPEED = -680 (negative = upward)
POWER_UP_DROP_CHANCE = 0.22, POWER_UP_DURATION_MS = 10_000
DIFFICULTY_STEP_MS = 10_000
```

**Enemy types:** `small` (1 hp, 10 pts), `medium` (2 hp, 25 pts), `heavy` (5 hp, 50 pts).

**Power-up types:** `rapidFire`, `tripleShot`, `shield`, `scoreMultiplier`, `slowTime`.

---

## Coding Conventions

- **No external assets** — all textures generated procedurally in `BootScene.create()` via `graphics.generateTexture(key, w, h)`.
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. Use `import type` for type-only imports.
- **`erasableSyntaxOnly`** — no `const enum`; use plain `enum` or `as const` objects.
- **One class per file**, filename matches the class name exactly.
- **Managers are plain classes** — no Phaser base class unless Phaser APIs are needed. Constructed in `GameScene.create()`, updated in `GameScene.update()`.
- **Entities extend `Phaser.Physics.Arcade.Sprite`** — register with `scene.add.existing(this)` and `scene.physics.add.existing(this)` in the constructor.
- **No magic numbers** — every literal belongs in `Constants.ts`.
- **`delta` capped at 50 ms** in `GameScene.update()` as `frameDelta` to prevent physics tunneling on tab blur.
- **Touch input** — two pointers: left half controls movement (`movePointerId`), right half fires (`firePointerId`). Touch target X is passed to `Player.update()`.
- **Mute toggle** — `M` key or HUD button; `AudioManager` owns the muted state.

---

## Adding Features

### New power-up type
1. Add the string literal to `PowerUpType` union and `POWER_UP_TYPES` array in `Constants.ts`.
2. Add entries to `POWER_UP_LABELS` and `POWER_UP_TINTS`.
3. Implement the effect in `GameScene.update()` by checking `powerUpManager.isActive('yourType')`.

### New enemy type
1. Add the string literal to `EnemyType` union in `Constants.ts`.
2. Add a config entry to `ENEMY_CONFIGS`.
3. Add the texture generation block in `BootScene.create()`.
4. Update `DifficultyManager.getEnemyWeights()` to include the new type.

### New scene
- Extend `Phaser.Scene`, pass the key string to `super()`.
- Register it in the `scene` array in `main.ts` (order matters for boot).
- Transition with `this.scene.start('SceneName', dataPayload)`.

---

## Build & Dev

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # tsc type-check + Vite production build
npm run preview  # Serve the production build locally
```

The game instance is exposed as `window.__SPACE_BLASTER__` in dev mode for console debugging.
