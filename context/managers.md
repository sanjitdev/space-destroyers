# Managers

Plain classes constructed in `GameScene.create()` and ticked in `GameScene.update()`. No Phaser base class unless Phaser APIs are required.

---

## AudioManager (`src/managers/AudioManager.ts`)

Web Audio API synthesiser — no audio files. All sounds generated procedurally.

| Method | Sound |
|---|---|
| `playShoot()` | Player fire |
| `playExplosion()` | Enemy/boss destruction |
| `playDamage()` | Player hit |
| `playPowerUp()` | Power-up collected |
| `playLaser()` | Laser blast |
| `toggleMute()` / `isMuted()` | Mute state |
| `update(deltaMs)` | Internal update |
| `destroy()` | Clean up on scene shutdown |

---

## BossManager (`src/managers/BossManager.ts`)

Objective-gated boss spawner. Tracks which `BOSS_LEVEL_CONFIGS` entry spawns next and when gate progress is complete.

| Method | Description |
|---|---|
| `checkSpawn()` | Spawns next boss when current objective gate is complete |
| `onEnemyKilled(type)` | Increments gate progress for small/medium/heavy |
| `getCurrentGateRequirements()` | Returns objective requirements for next boss |
| `getCurrentGateProgress()` | Returns current objective progress |
| `getNextBossLevel()` | Returns next boss level or null |
| `getBoss()` | Returns live Boss or null |
| `getActiveBossName()` / `getActiveBossLevel()` | Metadata for HUD |
| `destroyBoss()` | Stops enter tween, destroys sprite |

Bosses slide in from y = −80 to y = 240 over 1800 ms (`Back.easeOut`).

---

## ComboManager (`src/managers/ComboManager.ts`)

Kill streak tracker. Resets after 3 s of no kills or on player damage.

| Kills | Multiplier |
|---|---|
| < 5 | ×1 |
| ≥ 5 | ×2 |
| ≥ 10 | ×3 |
| ≥ 20 | ×4 |
| ≥ 40 | ×5 |

| Method | Description |
|---|---|
| `update(deltaMs)` | Advances idle timer |
| `onKill()` | Increments count, resets idle |
| `onDamage()` | Resets combo to 0 |
| `crossedThreshold()` | Returns the tier just hit (for FloatingText announcement) or null |
| `.multiplier` / `.streak` | Getters |

---

## DifficultyManager (`src/managers/DifficultyManager.ts`)

Stage advances every `DIFFICULTY_STEP_MS = 10_000` ms of elapsed time.

| Method | Formula |
|---|---|
| `getSpawnIntervalMs()` | `max(320, 920 − stage × 110)` |
| `getEnemySpeedMultiplier()` | `1 + stage × 0.18` |
| `getEnemyWeights()` | stage-based weights across small/medium/heavy/striker/bomber/destroyer |

---

## EnemySpawnManager (`src/managers/EnemySpawnManager.ts`)

Owns the spawn timer. Uses `DifficultyManager` for interval and weights.

| Method | Description |
|---|---|
| `update(deltaMs)` | Decrements cooldown; calls `spawnEnemy()` when ready (handles catch-up) |
| `setProgressionLevel(level)` | Unlocks higher enemy families over level progression |

Enemy spawns at random X in `[36, GAME_WIDTH − 36]`, y = −32.

---

## PowerUpManager (`src/managers/PowerUpManager.ts`)

Tracks active and stored power-ups.

### Active power-ups
```typescript
activate(type)       // activate effect
isActive(type)       // checked each frame by GameScene
clearActive()        // used by EMP Pulse boss special
getDisplayItems()    // returns HUD labels
consumeShieldCharge()// shield stack consumption
```

Current timing model:

- Most power-ups are persistent until player takes damage or level resets
- `ribbonLaser` has a dedicated 15-second timer
- Shield stacks up to 3 charges

### Stored power-ups (max 3, used during boss fights)
```typescript
tryStore(type)       // returns false if storage full
useStored()          // pops first slot; activates it (or triggers laser); returns type or null
getStored()          // readonly PowerUpType[] for HUD slots
hasStoredSlot()      // true if < 3 stored
clearStored()        // clear all stored entries
```

### Drop RNG
```typescript
shouldDrop()         // chance(POWER_UP_DROP_CHANCE = 0.22)
getRandomType()      // weighted pick from POWER_UP_WEIGHTS
```

---

## ScoreManager (`src/managers/ScoreManager.ts`)

```typescript
add(points, doubled, comboMultiplier)   // returns awarded points; updates high score in Storage
getScore() / getHighScore()
```

Awarded = `points × comboMultiplier × (doubled ? 2 : 1)`.

---

## StatsManager (`src/managers/StatsManager.ts`)

Tracks per-run stats for grade calculation.

| Method | Description |
|---|---|
| `recordShot()` | Shot fired |
| `recordKill()` | Enemy destroyed |
| `recordBossKill()` | Boss destroyed |
| `recordDamage()` | Player lost a life |
| `recordCombo(n)` | Updates peak combo |
| `getEnemiesKilled()` | Total kills (run summary metric) |
| `getAccuracy()` | `min(1, enemiesKilled / shotsFired)` |
| `computeGrade(score)` | Returns `'S'|'A'|'B'|'C'|'D'` |
| `getSummary()` | Object with all stats for GameOverScene |

### Grade formula
```
gradeScore = score × (1 + accuracy × 0.5)
           + bossesKilled × 500
           − livesLost × 200
           + peakCombo × 20

S ≥ 8000  |  A ≥ 4000  |  B ≥ 2000  |  C ≥ 800  |  D < 800
```

---

## TimerManager (`src/managers/TimerManager.ts`)

```typescript
update(deltaMs)
getRemainingSeconds()   // returns −1 in infinite mode
getElapsedMs()          // always increases
isComplete()            // false in infinite mode
```
