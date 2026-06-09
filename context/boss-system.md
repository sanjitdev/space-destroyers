# Boss Level System

Bosses are objective-gated. A boss can spawn only after the current level requirements for small, medium, and heavy kills are all met.

## Spawn Logic

- `BossManager.checkSpawn()` runs each update
- Boss objective progress is tracked through `onEnemyKilled(type)`
- Only `small`, `medium`, `heavy` kills count toward objective gates
- Objective progress resets after each boss spawn

## Gate Requirements

`getGateRequirements(level)` currently uses:

- level 1: tuned for earlier first boss
- level 2+ : increasing small/medium/heavy requirements
- heavy count increases more slowly than small/medium

See `src/managers/BossManager.ts` for exact constants.

## HP Scaling

Bosses use scaled stats at spawn time:

- Levels 1-5: steeper HP increase
- Levels 6+: gentler increase per level

Scaling is applied to both `maxHp` and `phase2Hp` before creating the `Boss` entity.

## Sequence and Abilities

10 bosses are still used from `BOSS_LEVEL_CONFIGS` in order:

- Sentinel (`none`)
- Hydra (`drone_spawn`)
- Pulsar (`emp_pulse`)
- Reaper (`aimed`)
- Titan (`meteor_shower`)
- Phantom (`teleport`)
- Nexus (`summon`)
- Devourer (`homing`)
- Apocalypse (`bulletHell`)
- Omega (`omega`)

## Phase 2

- Trigger: HP <= `phase2Hp`
- Effects: faster movement and fire cadence, stronger attack profile
- Visuals: red tint and glow shift

## Player Feedback

- HUD objective strip shows remaining counts by icon
- Boss warning banner appears on spawn
- Boss HP bar and label shown while boss is active
