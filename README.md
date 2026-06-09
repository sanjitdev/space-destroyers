# Space Destroyers

A browser-based space shooter built with TypeScript, Phaser 3, and Vite.

- All gameplay textures are procedural except the Falcon ship PNG in public/assets/ship-falcon.png.
- Audio is synthesised with the Web Audio API.

## Features

- Two game modes: timed (60s) and infinite
- 10-level boss progression with level objectives before each boss
- Boss objective HUD strip with enemy icons and remaining kill counts
- 6 enemy families: small, medium, heavy, striker, bomber, destroyer
- 12 power-ups including storage, laser, nuke, and ribbon laser
- Level reset rule: each new level starts with the basic weapon
- Combo system with multipliers up to x5
- Ship unlocks and theme selection
- Persistent progress and settings via localStorage

## Controls

### Keyboard

| Key | Action |
|---|---|
| Arrow Keys | Move |
| Space | Fire |
| F | Toggle auto-fire |
| E | Use stored power-up |
| M | Toggle mute |
| ESC / P | Pause |

### Touch

| Zone | Action |
|---|---|
| Left half | Move |
| Right half / FIRE button | Fire |

## Enemy Families

| Type | Role |
|---|---|
| small | Basic meteor scout |
| medium | Early shooter |
| heavy | Durable spread shooter |
| striker | Fast weaver, diagonal shots |
| bomber | Mid-speed spread attacker |
| destroyer | Elite slow mover, dense spread |

## Power-Ups

Current set:

- rapidFire
- tripleShot
- doubleShot
- shield (stacks to 3)
- scoreMultiplier
- slowTime
- laser
- extraLife
- nuke
- piercingShot
- magnetShield
- ribbonLaser (15 seconds)

Storage behavior:

- During boss fights, storable power-ups are banked up to 3 slots.
- Press E to consume the oldest stored entry.

## Boss Progression

- Bosses no longer spawn from a single total-kills number.
- Each boss level requires objective kills by type (small/medium/heavy).
- Objective progress is shown on HUD.
- Boss HP scaling increases by level with a gentler ramp after level 5.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project Structure

```text
src/
  scenes/       BootScene, MenuScene, GameScene, GameOverScene
  entities/     Player, Enemy, Boss, Bullet, EnemyBullet, PowerUp, RibbonLaser
  managers/     Audio, Boss, Combo, Difficulty, EnemySpawn, PowerUp, Score, Stats, Timer, Achievement
  ui/           HUD, FloatingText
  utils/        Constants, Random, Storage
context/        System reference docs
public/assets/  ship-falcon.png
```

See context/ for full subsystem details.
