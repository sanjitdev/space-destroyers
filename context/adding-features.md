# Adding Features

## Add a New Power-Up

1. Extend `PowerUpType` in `src/utils/Constants.ts`.
2. Add to `POWER_UP_TYPES`, `POWER_UP_LABELS`, `POWER_UP_TINTS`, and weight map.
3. Add `powerup-{type}` texture generation in `BootScene`.
4. Handle pickup logic in `GameScene`:
   - immediate effect branch, or
   - activated effect via `PowerUpManager`.
5. If timed, implement timer logic in `PowerUpManager.update`.

## Add a New Enemy Family

1. Extend `EnemyType` union and `ENEMY_CONFIGS` in constants.
2. Generate texture key `enemy-{id}` in `BootScene`.
3. Add spawn weighting in `DifficultyManager.getEnemyWeights`.
4. Gate unlock by progression in `EnemySpawnManager` if needed.
5. Add movement and firing behavior in `Enemy`.

## Add a New Boss Ability

1. Add type to `BossSpecialAbility`.
2. Use in `BOSS_LEVEL_CONFIGS`.
3. Implement attack logic in `Boss` and handling in `GameScene`.

## Update Boss Objective Logic

Boss gating lives in `BossManager`:

- requirement formula: `getGateRequirements(level)`
- progress increments: `onEnemyKilled(type)`
- UI data: `getCurrentGateRequirements`, `getCurrentGateProgress`, `getNextBossLevel`

## Conventions

- One class per file.
- Avoid magic numbers when values are reused.
- Keep gameplay balances centralized where possible (`Constants.ts` or manager-level constants).
- After gameplay changes, run `npm run build`.
