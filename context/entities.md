# Entities

One class per file. All entities extend Phaser Arcade physics classes and call `scene.add.existing(this)` + `scene.physics.add.existing(this)` in their constructor.

---

## Player (`src/entities/Player.ts`)

Extends `Phaser.Physics.Arcade.Sprite`. Texture key determined by selected ship config.

### Constructor
```
Player(scene, x, y, ship: ShipConfig)
```
- Speed = `PLAYER_SPEED × ship.speedMod`
- Physics body sized to `displayWidth × 0.52, displayHeight × 0.48` (excludes wing extremities)
- `setCollideWorldBounds(true)`, `allowGravity = false`, depth 5

### Key Methods
| Method | Description |
|---|---|
| `update(deltaMs, horizontalInput, touchTargetX)` | Move + invulnerability flash |
| `canFire()` | True when fire cooldown expired |
| `consumeFireCooldown(rapidFire)` | Reset cooldown; halved if rapidFire active |
| `takeDamage(shielded)` | Returns true if a life was lost; sets 1200 ms invulnerability |
| `addLife()` | +1 life, capped at `PLAYER_MAX_LIVES` (5). Returns false if already at max |
| `getLives()` | Current life count |
| `isOutOfLives()` | True when lives ≤ 0 |
| `toggleAutoFire()` / `isAutoFireEnabled()` | F key toggle |
| `setPowerGlow(activeTypes)` | Tints sprite to active power-up color |

### Key Constants
- `PLAYER_LIVES = 3` (starting lives)
- `PLAYER_MAX_LIVES = 5`
- `PLAYER_SPEED = 360`
- `PLAYER_FIRE_COOLDOWN_MS = 220` (× cooldownMod; halved during rapidFire)
- `PLAYER_INVULNERABILITY_MS = 1_200`

---

## Enemy (`src/entities/Enemy.ts`)

Extends `Phaser.Physics.Arcade.Sprite`.

### Constructor
```
Enemy(scene, x, y, type: EnemyType, speedMultiplier)
```

### Enemy Types
| Type | HP | Base Speed | Points | Fires? | Fire interval |
|---|---|---|---|---|---|
| `small` | 1 | 170 | 10 | No | — |
| `medium` | 2 | 135 | 25 | Yes | 3200 ms |
| `heavy` | 5 | 92 | 50 | Yes | 2000 ms |
| `striker` | 3 | 215 | 40 | Yes | 2200 ms |
| `bomber` | 7 | 118 | 80 | Yes | 1450 ms |
| `destroyer` | 12 | 84 | 130 | Yes | 1250 ms |

Actual speed = `baseSpeed × speedMultiplier` (from DifficultyManager).

### Key Methods
| Method | Description |
|---|---|
| `configure(type, speedMultiplier)` | Reconfigure a pooled enemy |
| `damage(amount)` | Returns true if destroyed; flashes white on hit |
| `applyMovementFactor(factor)` | Scales movement (used by slowTime) |
| `updateShootTimer(deltaMs, onFire)` | Emits family-specific shot patterns |
| `getPoints()` / `getTintColor()` / `getEnemyType()` | Accessors |

### Movement patterns

- `small`: gentle lateral drift
- `medium`: moderate sine weave
- `heavy`: slow lateral sway
- `striker`: aggressive high-frequency weave
- `bomber`: wide, slower sweep
- `destroyer`: heavy low-frequency sweep

### Shooting patterns

- `medium`: single straight shot
- `heavy`: 3-shot spread
- `striker`: dual diagonal shots
- `bomber`: 3-shot fan
- `destroyer`: dense 3-shot heavy spread

---

## Boss (`src/entities/Boss.ts`)

Extends `Phaser.Physics.Arcade.Sprite`. Constructed with a `BossLevelConfig`.

### Constructor
```
Boss(scene, config: BossLevelConfig)
```
- Spawns at y = −80, slides to y = 240 via BossManager tween
- Has an additive-blend glow sprite (depth 3) that pulses 2.35→2.65 scale
- depth 4, scale 2.0

### Key Methods
| Method | Description |
|---|---|
| `update(deltaMs, playerX, playerY, onFire, onSpecial)` | Lateral sweep, bob, teleport, fire, specials |
| `damage(amount)` | Returns true if dead; triggers phase-2 transition internally |
| `checkJustEnteredPhase2()` | Returns true once on phase-2 entry (consumed on read) |
| `getHpFraction()` | 0–1 for boss HP bar |
| `getLevel()` / `getName()` / `getSpecialAbility()` | Metadata |
| `isPhase2()` | Phase check |

### Attack patterns (by `specialAbility`)
| Ability | Phase 1 | Phase 2 |
|---|---|---|
| `none` | Single shot down | 3-wide spread |
| `drone_spawn` | Single shot | 3-wide + spawns 2 drones (via GameScene) |
| `emp_pulse` | Single shot | 3-wide + EMP clears player power-ups every 8 s |
| `aimed` | Aimed at player | 3-way aimed |
| `meteor_shower` | Single shot | 5-wide + meteor shower (via GameScene) |
| `teleport` | Single + teleport every 4 s | 3-wide + teleport |
| `summon` | Single shot | 3-wide + summons 2 medium aliens (via GameScene) |
| `homing` | Single shot | 3-wide + homing missile every 6 s |
| `bulletHell` | Single shot | 7-way spread (−90° ±22° steps) |
| `omega` | Aimed + teleport | 7-way aimed + teleport |

### Phase 2 transition
Phase 2 triggers when HP drops to `config.phase2Hp`. Speed and fire rate increase; body tinted deep red; glow shifts to `phase2GlowTint`.

---

## Bullet (`src/entities/Bullet.ts`)

Extends `Phaser.Physics.Arcade.Image`. Player projectile. Deactivates when off-screen. Fired upward at `BULLET_SPEED = −680`.

---

## EnemyBullet (`src/entities/EnemyBullet.ts`)

Extends `Phaser.Physics.Arcade.Image`. Enemy/boss projectile. Supports arbitrary `(vx, vy)` velocity (used by aimed shots, homing, spread). Deactivates off-screen.

---

## PowerUp (`src/entities/PowerUp.ts`)

Extends `Phaser.Physics.Arcade.Sprite`. Each type has its own named texture (`powerup-rapidFire`, `powerup-shield`, etc.). Rotates 3°/frame while falling. Speed `POWER_UP_SPEED = 180`.

### `configure(type, x, y)`
Sets texture to `powerup-${type}`, activates, sets velocity.

### `getPowerUpType()` / `collect()`
Collect deactivates and stops the body.
