# Power-Ups

Drop chance per enemy kill: 22% (`POWER_UP_DROP_CHANCE`). Boss defeats also spawn a reward drop.
Fall speed: 180 px/s (`POWER_UP_SPEED`).

## Types

| Type key | Label | Effect |
|---|---|---|
| `rapidFire` | Rapid Fire | Halves fire cooldown until cleared |
| `tripleShot` | Triple Shot | Fires 3 bullets per volley |
| `doubleShot` | Double Shot | Fires 2 bullets per volley |
| `shield` | Shield | Blocks hits, stacks to 3 charges |
| `scoreMultiplier` | 2x Score | Doubles score gain |
| `slowTime` | Slow Time | Halves enemy movement speed |
| `laser` | MEGA LASER | Immediate beam sweep |
| `extraLife` | +1 Life | Gain one life up to cap |
| `nuke` | NUKE | Destroy all enemies on screen |
| `piercingShot` | Piercing Shot | Piercing bullet behavior |
| `magnetShield` | Magnet Shield | Pulls in/clears nearby bullets |
| `ribbonLaser` | Ribbon Laser | Rotating ribbon lasers for 15 seconds |

## Timing and Persistence

- Persistent buffs: most power-ups stay active until player damage or level reset.
- Timed buff: `ribbonLaser` expires after 15000 ms.
- Shield is charge-based and not timer-based.

## Storage Rules

- During boss fights, up to 3 non-instant power-ups can be stored.
- Use `E` to consume the first stored slot.
- Stored slots are shown in HUD as tinted mini-slots.

## Collection Flow

- `laser` and `nuke`: execute immediately.
- `extraLife`: applies immediately.
- During active boss, storable types go to storage if slots are available.
- Otherwise, picked power-up activates instantly.

## Level Transition Rule

At each new level start, active and stored power-ups are cleared so the player starts with the basic weapon loadout.
