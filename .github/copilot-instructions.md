# Space Destroyers — Copilot Instructions

## Project Overview

A **Phaser 3** space shooter written in **TypeScript**, bundled with **Vite**. The game runs in a 480×800 canvas. Textures are all procedurally generated in `BootScene` using Phaser graphics — there are no external image or audio assets.

**Stack:** Phaser 3.90, TypeScript 6, Vite 8, ES2023 target, bundler module resolution.

---

## Architecture

```
src/
  main.ts              # Phaser game config; registers all scenes; exposes window.__SPACE_BLASTER__ in dev
  style.css
  scenes/
    BootScene.ts       # Generates all textures; transitions to MenuScene
    MenuScene.ts       # Ship selector, theme picker, mode buttons, mute toggle
    GameScene.ts       # Main game loop; wires all entities and managers
    GameOverScene.ts   # Grade badge, score block, stats card, play-again / menu buttons
  entities/
    Player.ts          # Arcade.Sprite; keyboard + touch input; ship stats applied
    Enemy.ts           # Arcade.Sprite; optional return fire timer
    EnemyBullet.ts     # Arcade.Image; deactivates on leaving screen
    Bullet.ts          # Arcade.Image; player projectile
    PowerUp.ts         # Arcade.Image; diamond shape; tinted by type
    Boss.ts            # Arcade.Sprite; two-phase AI; side-sweep + shooting
  managers/
    AudioManager.ts    # Web Audio API synth; no audio files
    DifficultyManager.ts    # Spawn interval, speed multiplier, enemy type weights by stage
    EnemySpawnManager.ts    # Owns spawn timer; creates Enemy instances
    PowerUpManager.ts       # Tracks active power-up types and remaining duration
    ScoreManager.ts         # Score accumulation; combo + doubler multipliers
    TimerManager.ts         # Elapsed / remaining; infinite-mode aware
    ComboManager.ts         # Kill streak counter; ×1–5 multipliers; 3s idle reset
    BossManager.ts          # Stages boss spawns; tracks active boss
    StatsManager.ts         # Shot/kill/damage tracking; computes run grade
  ui/
    HUD.ts             # Glass panel overlay; score, timer, lives, power-up strip, boss bar
    FloatingText.ts    # Scale-punch + float-up-fade popup text
  utils/
    Constants.ts       # Single source of truth for all tunable values and types
    Random.ts          # Seeded random helpers
    Storage.ts         # localStorage wrapper (high score, muted, theme, ship index)
```

### Scene flow
`BootScene` → `MenuScene` → `GameScene` → `GameOverScene` → `MenuScene`

### Layer depth order
| Depth | Content |
|---|---|
| −2 | `backgroundFar` (sparse stars, slow parallax) |
| −1 | `background` (dense stars, fast parallax) |
| 0 | default entities (enemies, bullets, power-ups) |
| 4 | Boss |
| 5 | Player |
| 14–16 | Laser beam layers |
| 19 | Touch UI |
| 20 | HUD |
| 22 | FloatingText |
| 25 | Combo text |
| 30 | Boss warning banner |

---

## Key Constants (`src/utils/Constants.ts`)

```
GAME_WIDTH = 480, GAME_HEIGHT = 800
GAME_DURATION_MS = 60_000
PLAYER_LIVES = 3
PLAYER_SPEED = 360
PLAYER_FIRE_COOLDOWN_MS = 220   (× ship cooldownMod; halved during rapidFire)
PLAYER_INVULNERABILITY_MS = 1_200
BULLET_SPEED = -680             (negative = upward)
POWER_UP_DROP_CHANCE = 0.22
POWER_UP_DURATION_MS = 10_000
POWER_UP_SPEED = 180
DIFFICULTY_STEP_MS = 10_000     (10-second stages)
```

---

## Systems Reference

### Game Modes
| Mode | Timer | Boss spawns | Score |
|---|---|---|---|
| `'timed'` | 60-second countdown | Every 10 s after stage 1 | Normal |
| `'infinite'` | Counts up (HUD shows ∞) | Every 10 s elapsed | Normal |

### Enemy Types
| Type | HP | Speed | Points | Fires back? | Interval |
|---|---|---|---|---|---|
| `small` | 1 | 170 | 10 | No | — |
| `medium` | 2 | 135 | 25 | Yes | 3200 ms |
| `heavy` | 5 | 92 | 50 | Yes | 2000 ms |

### Power-up Types
| Type | Label | Effect |
|---|---|---|
| `rapidFire` | Rapid Fire | Halves fire cooldown |
| `tripleShot` | Triple Shot | Fires 3 bullets per shot |
| `shield` | Shield | Blocks one hit |
| `scoreMultiplier` | 2× Score | Doubles points awarded |
| `slowTime` | Slow Time | Halves enemy speed |
| `laser` | MEGA LASER | One-shot full-width sweep beam destroying all enemies on path |

### Ships (`SHIP_CONFIGS`)
| ID | Unlock Score | Speed Mod | Cooldown Mod | Description |
|---|---|---|---|---|
| `falcon` | 0 | 1.00× | 1.00× | Balanced |
| `viper` | 500 | 1.20× | 1.10× | Fast · Standard fire |
| `nova` | 1500 | 0.90× | 0.65× | Rapid fire · Slower |
| `phantom` | 3000 | 1.15× | 0.80× | Agile · Fast fire |
| `titan` | 6000 | 0.85× | 0.55× | Heavy · Rapid fire |

Ships are unlocked by high score. `getPlayerLevel(highScore)` returns the 0-based index of the highest unlocked ship.

### Themes (`THEMES`)
| ID | Label | bgTint | bulletTint |
|---|---|---|---|
| `blue` | Blue | 0x78a6ff | 0x57e2e5 |
| `purple` | Purple | 0xb088ff | 0xd0a0ff |
| `red` | Red | 0xff9080 | 0xff6699 |
| `green` | Green | 0x80ffa0 | 0x90ff70 |
| `gold` | Gold | 0xffd070 | 0xffe060 |

### Combo System (`ComboManager`)
- Resets after 3 s of no kills or on player damage
- Multiplier tiers: ×1 (default) → ×2 at 5 kills → ×3 at 10 → ×4 at 20 → ×5 at 40
- `crossedThreshold()` returns the tier just hit so `GameScene` can announce it via `FloatingText`

### Boss System (`Boss` + `BossManager`)
- Spawns at elapsed stages 1, 2, 3, 4, 5 (i.e. every 10 s from the 10 s mark)
- **Phase 1** (HP > 30): sweeps at 90 px/s, fires single shot every 1400 ms
- **Phase 2** (HP ≤ 30): tint turns deep red, speed 150 px/s, fires 3-wide every 800 ms
- HP = 60 (`BOSS_MAX_HP`). Depth 4.
- Death: 500 pts + combo multiplier, triple explosion, camera shake + flash, guaranteed power-up drop

### Grade System (`StatsManager`)
```
gradeScore = score × (1 + accuracy × 0.5) + bossesKilled × 500 − livesLost × 200 + peakCombo × 20
S ≥ 8000  |  A ≥ 4000  |  B ≥ 2000  |  C ≥ 800  |  D < 800
```
Grade colors — S: gold `#ffe050`, A: green `#7cff6b`, B: cyan `#57e2e5`, C: white `#e0e8ff`, D: pink `#ff8ba7`

### Difficulty Progression (`DifficultyManager`)
Stages advance every `DIFFICULTY_STEP_MS` (10 s). Each stage increases:
- Enemy spawn rate (interval shrinks)
- Enemy speed multiplier
- Probability weight toward heavier enemy types

### Laser Power-up (`GameScene.fireLaserBlast`)
Three layered `Rectangle` objects (glow / beam / core) anchored at player position. `setScale(1, 0)` → `scaleY: 1` tween sweeps the beam upward. An `onUpdate` callback calculates the live beam top edge and destroys any enemy/boss in the path, recording kills + combo.

---

## Textures (all procedurally generated in `BootScene.create()`)

| Key | Size | Description |
|---|---|---|
| `space-bg` | 64×64 | Dense near-star field |
| `space-bg-far` | 128×128 | Sparse far-star field (parallax layer 2) |
| `player` | — | Cyan fighter ship (Falcon) |
| `ship-viper` | — | Orange-red ship |
| `ship-nova` | — | Cyan wide ship |
| `ship-phantom` | — | Purple kite ship |
| `ship-titan` | — | Gold heavy ship |
| `bullet` | — | Yellow player projectile |
| `enemy-small` | — | Pink circle |
| `enemy-medium` | — | Yellow hexagon |
| `enemy-heavy` | — | Purple rounded rect |
| `enemy-bullet` | 8×14 | Red teardrop enemy projectile |
| `powerup` | — | Diamond shape; tinted per type |
| `particle` | — | Small dot for explosions |
| `boss` | 64×52 | Skull silhouette with glowing eyes |

---

## Storage Keys (`Storage.ts`)
| Method | Key | Default |
|---|---|---|
| `getHighScore / setHighScore` | `sd_highscore` | 0 |
| `getMuted / setMuted` | `sd_muted` | false |
| `getTheme / setTheme` | `sd_theme` | `'blue'` |
| `getSelectedShipIndex / setSelectedShipIndex` | `sd_ship` | 0 |

---

## Coding Conventions

- **No external assets** — all textures generated procedurally in `BootScene.create()`.
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. Use `import type` for type-only imports.
- **`erasableSyntaxOnly`** — no `const enum`; use plain `enum` or `as const` objects.
- **One class per file**, filename matches the class name exactly.
- **Managers are plain classes** — no Phaser base class unless Phaser APIs are required. Constructed in `GameScene.create()`, ticked in `GameScene.update()`.
- **Entities extend `Phaser.Physics.Arcade.Sprite`** or `Phaser.Physics.Arcade.Image` — call `scene.add.existing(this)` and `scene.physics.add.existing(this)` in the constructor.
- **No magic numbers** — every literal constant belongs in `Constants.ts`.
- **`delta` capped at 50 ms** in `GameScene.update()` as `frameDelta` to prevent physics tunneling on tab blur.
- **Touch input** — left-half pointer controls movement (`movePointerId`), right-half fires (`firePointerId`). Touch target X passed to `Player.update()`.
- **`shadow` type** — Phaser uses `offsetX` / `offsetY`, not `x` / `y`. Always use `{ offsetX: 0, offsetY: 0, color, blur, fill: true }`.
- **Design system** — font: `'Arial Black, sans-serif'`; dark glass panels `0x030a18` / `0x04101e`; cyan accent `#6cf3ff`; gold highlight `#ffe050`.

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
