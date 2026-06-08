# Textures

All textures are procedurally generated in `BootScene.create()` using a single `Phaser.GameObjects.Graphics` instance (cleared between each). Exception: `player` loaded from `public/assets/ship-falcon.png`.

## Background Layers

| Key | Size | Description |
|---|---|---|
| `space-nebula` | 256×256 | 8 gas cloud clusters (purple/indigo/teal/crimson), 32 embedded stars |
| `space-bg-far` | 512×512 | Transparent base; 140 randomly scattered stars, 6 color variants |
| `space-bg` | 384×384 | Dark fill; 220 random stars + 10 spike stars (cross-glint effect) |

Star positions use **mulberry32** seeded PRNG:
- `space-bg-far` seed: `0xdeadbeef`
- `space-bg` seed: `0xcafebabe`
- Spike stars seed: `0x1337c0de`

## Ship Textures

| Key | Source | Scale in-game | Notes |
|---|---|---|---|
| `player` | `public/assets/ship-falcon.png` (80×134 px) | `gameScale: 1.0` | Loaded via `preload()` |
| `ship-viper` | Procedural | `gameScale: 3.0` | Orange-red ship |
| `ship-nova` | Procedural | `gameScale: 3.0` | Cyan wide ship |
| `ship-phantom` | Procedural | `gameScale: 3.0` | Purple kite ship |
| `ship-titan` | Procedural | `gameScale: 3.0` | Gold heavy ship |

## Enemy Textures

| Key | Size | Description |
|---|---|---|
| `enemy-small` | 22×20 | Reddish-brown jagged meteor with crater and highlight |
| `enemy-medium` | 38×30 | Toxic green delta-wing alien fighter; glowing orb cockpit |
| `enemy-heavy` | 52×44 | Electric blue dreadnought; armour plates, bridge dome, twin cannons |

## Power-Up Textures (7 types)

All 28×28. Diamond base filled with type color; white symbol on top.

| Key | Base color | Symbol |
|---|---|---|
| `powerup-rapidFire` | Cyan | Two speed chevrons ⋀⋀ |
| `powerup-tripleShot` | Green | Three staggered upward arrows |
| `powerup-shield` | Blue | Kite shield with cross |
| `powerup-scoreMultiplier` | Gold | 5-point star |
| `powerup-slowTime` | Purple | Hourglass |
| `powerup-laser` | Periwinkle | Crosshair beam + |
| `powerup-extraLife` | Pink | Heart |

## Boss Texture

| Key | Size | Description |
|---|---|---|
| `boss` | 96×80 | Demon skull — curved wings, body hull, 3 horns, 3-ring glowing eyes with slit pupils, nasal cavity, 8-fang jaw, chest energy core |

Boss glow is a runtime `Phaser.GameObjects.Sprite` using the same `boss` texture with `BlendModes.ADD` tinted per `BossLevelConfig.glowTint`.

## Projectile & Effect Textures

| Key | Size | Description |
|---|---|---|
| `bullet` | Procedural | Yellow player projectile |
| `enemy-bullet` | 8×14 | Red teardrop enemy projectile |
| `particle` | 6×6 | Small white dot for explosion particles |

## Conventions

- Always `graphics.clear()` after each `generateTexture()` call
- Use `new Phaser.Math.Vector2(x, y)` for polygon points in `fillPoints()`
- `lineStyle()` + `strokeRect()` for detail lines (draw after fills)
- Additive blend effects done at runtime via `setBlendMode(Phaser.BlendModes.ADD)`, not baked into textures
