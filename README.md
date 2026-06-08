# Space Destroyers

A browser-based space shooter built with **TypeScript**, **Phaser 3**, and **Vite**. All textures are procedurally generated — no external image or audio assets (except the Falcon ship PNG).

---

## Features

- **Two game modes** — 60-second timed survival or infinite endless mode
- **10-level boss system** — bosses spawn after kill milestones, each with unique abilities (EMP pulse, aimed shots, teleport, bullet hell, homing missiles, and more)
- **Three enemy classes** — meteor scouts, alien delta fighters, and alien dreadnoughts
- **7 power-ups** — Rapid Fire, Triple Shot, Shield, 2× Score, Slow Time, Mega Laser, and Extra Life (up to 5 lives)
- **Stored power-ups** — bank up to 3 power-ups during boss fights; use them with `E`
- **Auto-fire toggle** — hold to spray or press `F` to lock on
- **Combo system** — kill streaks up to ×5 multiplier
- **5 unlockable ships** — each with unique speed and fire-rate stats
- **5 visual themes** — tint the star field and bullets to your taste
- **Run grade** — S / A / B / C / D based on score, accuracy, boss kills, and combo
- **Synthesised audio** — all sounds generated via Web Audio API, no audio files
- **Rich parallax background** — three-layer nebula + seeded random star fields
- **LocalStorage persistence** — high score, mute state, theme, and selected ship

---

## Controls

### Keyboard

| Key | Action |
|---|---|
| ← / → Arrow | Move |
| Space | Fire (hold for continuous) |
| F | Toggle auto-fire |
| E | Use stored power-up |
| M | Toggle mute |

### Touch

| Zone | Action |
|---|---|
| Left half of screen | Move (pointer X tracks player) |
| Right half / FIRE button | Fire (hold for continuous) |

---

## Power-Ups

| Icon color | Type | Effect |
|---|---|---|
| Cyan | Rapid Fire | Halves fire cooldown |
| Green | Triple Shot | 3 bullets per shot |
| Blue | Shield | Blocks next hit |
| Gold | 2× Score | Doubles kill points |
| Purple | Slow Time | Halves enemy speed |
| Periwinkle | Mega Laser | Instant full-width beam |
| Pink | Extra Life | +1 life (max 5) |

During a boss fight, collected power-ups (except Laser and Extra Life) are banked into up to 3 storage slots shown in the HUD. Press **E** to use the first stored one instantly.

---

## Boss System

Bosses spawn after hitting total kill milestones — no time gate. There are 10 bosses in sequence:

| # | Name | Kills | Special |
|---|---|---|---|
| 1 | Sentinel | 15 | None |
| 2 | Hydra | 35 | Spawns drones on phase 2 |
| 3 | Pulsar | 60 | EMP pulse clears your power-ups |
| 4 | Reaper | 90 | Aimed bullets |
| 5 | Titan | 125 | Meteor shower on phase 2 |
| 6 | Phantom | 165 | Teleports every 4 s |
| 7 | Nexus | 210 | Summons alien ships on phase 2 |
| 8 | Devourer | 260 | Homing missiles in phase 2 |
| 9 | Apocalypse | 315 | 7-way bullet hell in phase 2 |
| 10 | Omega | 375 | Teleport + aimed 7-way spread |

Each boss has two phases — phase 2 triggers at half HP, increasing speed, fire rate, and shot count.

---

## Ships

Unlock ships by beating your high score thresholds:

| Ship | Unlock | Speed | Fire rate |
|---|---|---|---|
| Falcon | 0 | 1.00× | 1.00× |
| Viper | 500 | 1.20× | 1.10× |
| Nova | 1500 | 0.90× | 0.65× (rapid) |
| Phantom | 3000 | 1.15× | 0.80× |
| Titan | 6000 | 0.85× | 0.55× (rapid) |

---

## Development

```bash
npm install
npm run dev      # Vite dev server with HMR
```

The game instance is exposed as `window.__SPACE_BLASTER__` in dev mode for console debugging.

## Production Build

```bash
npm run build    # type-check + production bundle
npm run preview  # serve the built dist/ locally
```

## Deploying to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Ensure the repository name matches `space-destroyers` so the Vite `base` path is correct.
4. Push to `main` to publish the latest build automatically.

---

## Project Structure

```
src/
  scenes/       BootScene · MenuScene · GameScene · GameOverScene
  entities/     Player · Enemy · Boss · Bullet · EnemyBullet · PowerUp
  managers/     Audio · Boss · Combo · Difficulty · EnemySpawn · PowerUp · Score · Stats · Timer
  ui/           HUD · FloatingText
  utils/        Constants · Random · Storage
context/        Reference docs for every system
public/
  assets/       ship-falcon.png
```

See the [`context/`](context/) folder for detailed reference documentation on every system.
