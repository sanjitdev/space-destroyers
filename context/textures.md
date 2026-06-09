# Textures

Most textures are generated in `BootScene.create()` using Phaser Graphics.
Exception: `player` (Falcon) is loaded from `public/assets/ship-falcon.png`.

## Background Layers

| Key | Size | Notes |
|---|---|---|
| `space-nebula` | 256x256 | Clouded deep-space layer |
| `space-bg-far` | 512x512 | Sparse far stars |
| `space-bg` | 384x384 | Dense near stars + spike stars |

## Enemy Textures

| Key | Family |
|---|---|
| `enemy-small` | Meteor scout |
| `enemy-medium` | Delta fighter |
| `enemy-heavy` | Dreadnought |
| `enemy-striker` | Fast interceptor |
| `enemy-bomber` | Armored bomber |
| `enemy-destroyer` | Elite warship |

## Power-Up Textures

All power-ups use `powerup-{type}` keys and are generated as icon-style symbols.

Current keys:

- `powerup-rapidFire`
- `powerup-tripleShot`
- `powerup-doubleShot`
- `powerup-shield`
- `powerup-scoreMultiplier`
- `powerup-slowTime`
- `powerup-laser`
- `powerup-extraLife`
- `powerup-nuke`
- `powerup-piercingShot`
- `powerup-magnetShield`
- `powerup-ribbonLaser`

## Projectile / FX Textures

- `bullet`
- `enemy-bullet`
- `particle`

## Boss Textures

Boss sprites are generated in BootScene and referenced by `boss-1` through `boss-10`.
