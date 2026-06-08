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

Kill-based boss spawner. Tracks which of the 10 `BOSS_LEVEL_CONFIGS` entries to spawn next.

| Method | Description |
|---|---|
| `checkSpawn(totalKills)` | Compares kills against `cfg.killsRequired`; spawns + returns true when threshold crossed |
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
| `getEnemyWeights()` | small weight decreases, medium/heavy increase per stage |

---

## EnemySpawnManager (`src/managers/EnemySpawnManager.ts`)

Owns the spawn timer. Uses `DifficultyManager` for interval and weights.

| Method | Description |
|---|---|
| `update(deltaMs)` | Decrements cooldown; calls `spawnEnemy()` when ready (handles catch-up) |

Enemy spawns at random X in `[36, GAME_WIDTH − 36]`, y = −32.

---

## PowerUpManager (`src/managers/PowerUpManager.ts`)

Tracks active (timed) and stored (boss-fight inventory) power-ups.

### Active power-ups
```typescript
activate(type)       // starts POWER_UP_DURATION_MS = 10_000 ms countdown
isActive(type)       // checked each frame by GameScene
clearActive()        // used by EMP Pulse boss special
getDisplayItems()    // returns "Label Xs" strings for HUD strip
```

### Stored power-ups (max 3, used during boss fights)
```typescript
tryStore(type)       // returns false if storage full
useStored()          // pops first slot; activates it (or triggers laser); returns type or null
getStored()          // readonly PowerUpType[] for HUD slots
hasStoredSlot()      // true if < 3 stored
```

### Drop RNG
```typescript
shouldDrop()         // chance(POWER_UP_DROP_CHANCE = 0.22)
getRandomType()      // pickOne(POWER_UP_TYPES)
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
| `getEnemiesKilled()` | Total kills (used by BossManager) |
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
