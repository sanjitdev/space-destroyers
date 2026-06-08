# Adding Features

## New Power-Up Type

1. Add string literal to `PowerUpType` union in `Constants.ts`
2. Add to `POWER_UP_TYPES` array (satisfies check will enforce completeness)
3. Add entry to `POWER_UP_LABELS` record
4. Add entry to `POWER_UP_TINTS` record
5. Draw texture block in `BootScene.create()`:
   ```typescript
   // key must be exactly `powerup-{typeKey}`
   graphics.fillStyle(COLOR, 1);
   graphics.fillPoints(diam28, true);   // diamond base
   // draw white symbol...
   graphics.generateTexture('powerup-myType', 28, 28);
   graphics.clear();
   ```
6. Handle the effect in `GameScene`:
   - If instant (like `extraLife`): add a branch in the power-up overlap callback
   - If timed: check `powerUpManager.isActive('myType')` each frame in `update()`
   - If it should be storable during boss fights: no changes needed (auto-stored by default)
   - If it should bypass storage (like `laser`, `extraLife`): add an `else if` before the storage check in the overlap callback

## New Enemy Type

1. Add string literal to `EnemyType` union in `Constants.ts`
2. Add config entry to `ENEMY_CONFIGS` record
3. Draw texture in `BootScene.create()` (key: `enemy-{id}`)
4. Update `DifficultyManager.getEnemyWeights()` to include the new type

## New Boss Ability

1. Add string literal to `BossSpecialAbility` union in `Constants.ts`
2. Add a `BossLevelConfig` entry that uses it (or assign to an existing level)
3. In `Boss.ts`:
   - If periodic: add a case to `periodicInterval()` and call `onSpecial()` when timer fires
   - If attack-pattern: add a branch in `performAttack()`
4. In `GameScene.handleBossSpecial()`: add a case for the new ability
5. In `GameScene.handleBossPhase2Transition()`: add a case if it needs a transition effect

## New Scene

1. Extend `Phaser.Scene`, pass key string to `super('MyScene')`
2. Register in the `scene` array in `main.ts` (boot order matters)
3. Transition: `this.scene.start('MyScene', dataPayload)`

## New Ship

1. Add a `ShipConfig` entry to `SHIP_CONFIGS` in `Constants.ts`
2. Draw texture in `BootScene.create()` (key: `ship-{id}`)
3. Set appropriate `gameScale` and `previewScale` (default procedural ships use 3.0)

## Coding Conventions

- **One class per file**, filename matches class name exactly
- **No external assets** — textures generated in `BootScene`, audio synthesised
- **No magic numbers** — every constant belongs in `Constants.ts`
- **`import type`** for type-only imports (enforced by `verbatimModuleSyntax`)
- **No `const enum`** — use plain `enum` or `as const` objects (`erasableSyntaxOnly`)
- **TextShadow** always uses `offsetX`/`offsetY`, never `x`/`y`
- **`delta` capped at 50 ms** in `GameScene.update()` as `frameDelta` (physics tunneling prevention)
- **Managers**: plain classes, no Phaser base class unless Phaser APIs are required
- **Entities**: extend `Phaser.Physics.Arcade.Sprite` or `.Image`, call `scene.add.existing(this)` + `scene.physics.add.existing(this)` in constructor

## Build Commands

```bash
npm run dev      # Vite dev server (HMR) — typically http://localhost:5173
npm run build    # tsc type-check + Vite production build
npm run preview  # Serve the production build locally
npx tsc --noEmit # Type-check only, no output
```

Dev mode exposes game instance as `window.__SPACE_BLASTER__` for console debugging.
