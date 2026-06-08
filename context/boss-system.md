# Boss Level System

Bosses spawn based on **total enemy kills**, not elapsed time. `BossManager.checkSpawn(totalKills)` is called every frame. When kills reach a threshold, the next boss in the sequence slides in.

## 10-Level Sequence

| Lvl | Name | Kills req. | Max HP | Phase 2 HP | Lateral spd → P2 | Fire interval → P2 | P2 shots | Special Ability |
|---|---|---|---|---|---|---|---|---|
| 1 | Sentinel | 15 | 60 | 30 | 90 → 150 | 1400 → 800 ms | 3 | `none` |
| 2 | Hydra | 35 | 90 | 45 | 100 → 160 | 1200 → 700 ms | 3 | `drone_spawn` |
| 3 | Pulsar | 60 | 120 | 60 | 110 → 170 | 1000 → 600 ms | 3 | `emp_pulse` |
| 4 | Reaper | 90 | 150 | 75 | 120 → 180 | 900 → 550 ms | 3 | `aimed` |
| 5 | Titan | 125 | 190 | 95 | 100 → 165 | 800 → 500 ms | 5 | `meteor_shower` |
| 6 | Phantom | 165 | 230 | 115 | 130 → 190 | 700 → 450 ms | 3 | `teleport` |
| 7 | Nexus | 210 | 280 | 140 | 140 → 200 | 650 → 400 ms | 5 | `summon` |
| 8 | Devourer | 260 | 330 | 165 | 150 → 210 | 600 → 350 ms | 5 | `homing` |
| 9 | Apocalypse | 315 | 390 | 195 | 160 → 220 | 500 → 300 ms | 7 | `bulletHell` |
| 10 | Omega | 375 | 500 | 250 | 170 → 230 | 450 → 250 ms | 7 | `omega` |

## Special Ability Descriptions

| Ability | Effect |
|---|---|
| `none` | No special — intro boss |
| `drone_spawn` | On phase-2 entry: spawns 2 small meteors beside the boss |
| `emp_pulse` | Every 8 s: clears all player active power-ups; flashes blue screen |
| `aimed` | All bullets aimed directly at player position instead of straight down |
| `meteor_shower` | On phase-2 entry: 5 small meteors rain down with 250 ms stagger |
| `teleport` | Boss jumps to a random X every 4 s (both phases) |
| `summon` | On phase-2 entry: spawns 2 medium alien ships below the boss |
| `homing` | Phase 2 only: fires a slow homing missile (steers toward player) every 6 s |
| `bulletHell` | Phase 2: all shots become 7-way spread at −90° ±22° intervals |
| `omega` | Combines `teleport` + `aimed` + 7-way; the final boss |

## Phase 2 Transition
- Triggered when HP drops to `phase2Hp`
- Speed, fire interval and shot count all increase
- Sprite tinted deep red (`0xff2200`); glow shifts to `phase2GlowTint`
- `checkJustEnteredPhase2()` returns true once so GameScene can fire transition effects
- FloatingText: `"⚠ RAGE MODE ⚠"`

## Boss Entry
- Spawns at x = centre, y = −80
- Tweens to y = 240 over 1800 ms (`Back.easeOut`)
- Lateral bounce bounds: x = [80, GAME_WIDTH − 80]
- Phase-2 vertical bob: `40 × sin(time/600)`, clamped above y = 200

## Boss Death Rewards
- Score: `500 × comboMultiplier`
- Three explosion particles (offset positions)
- Camera shake 500 ms + flash
- Guaranteed power-up drop
- FloatingText: `"BOSS DOWN! +N"`
