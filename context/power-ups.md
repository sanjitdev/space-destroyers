# Power-Ups

Drop chance per enemy kill: **22%** (`POWER_UP_DROP_CHANCE`). Boss kill always drops one.  
Duration for timed effects: **10 seconds** (`POWER_UP_DURATION_MS`).  
Fall speed: **180 px/s** (`POWER_UP_SPEED`).

## Types

| Type key | Label | Color | Icon | Effect |
|---|---|---|---|---|
| `rapidFire` | Rapid Fire | Cyan `#57e2e5` | Two speed chevrons ⋀⋀ | Halves fire cooldown |
| `tripleShot` | Triple Shot | Green `#7cff6b` | Three staggered arrows ↑↑↑ | Fires 3 bullets per shot (left/centre/right) |
| `shield` | Shield | Blue `#4dd2ff` | Kite shield with cross | Absorbs the next hit; invulnerability stays active |
| `scoreMultiplier` | 2× Score | Gold `#fff275` | 5-point star ★ | Doubles points awarded for kills |
| `slowTime` | Slow Time | Purple `#c492ff` | Hourglass ⏳ | All enemy speeds halved |
| `laser` | MEGA LASER | Periwinkle `#8899ff` | Crosshair beam + | Fires an instant full-width beam sweep (immediate, not stored) |
| `extraLife` | +1 Life | Pink `#ff5c8a` | Heart ♥ | +1 life up to max of 5; always applied instantly, never stored |

## Textures
Each type has its own 28×28 procedural texture (`powerup-{typeKey}`) generated in `BootScene`. The diamond base is filled with the type's tint color; a white symbol is drawn on top. No post-tinting is applied at runtime.

## Collection Behaviour

```
On pickup:
  if type === 'laser'     → fire immediately
  else if type === 'extraLife' → addLife() immediately
  else if boss is active AND stored slots < 3:
      → bank into PowerUpManager.storedPowerUps[]
      → FloatingText: "STORED: {label}"
  else:
      → PowerUpManager.activate(type) immediately
      → FloatingText: "{label}"
```

## Stored Power-Ups (Boss Fights)

During a boss fight up to **3** power-ups can be banked (laser and extraLife bypass storage).  
The HUD shows 3 small tinted slots below the header panel.

**`E` key** — use the first stored power-up immediately:
- Non-laser types activate normally (timed buff)
- Laser fires instantly

## Laser Beam Mechanics

Three layered Rectangles (glow / beam / core) anchored at player X, `origin(0.5, 1)`, `scaleY` tweens 0→1 over 600 ms (`Sine.easeIn`).

An `onUpdate` callback calculates the live beam top edge and destroys any enemy in path based on X distance threshold (`< beamWidth + 14`).

After travel: spread + fade tween (320 ms, `Cubic.easeOut`), then rectangles destroyed.

Side effects: camera shake 300 ms, camera flash blue, `playLaser()`.

## Adding a New Power-Up

1. Add the string literal to `PowerUpType` union in `Constants.ts`
2. Add to `POWER_UP_TYPES` array
3. Add entries to `POWER_UP_LABELS` and `POWER_UP_TINTS`
4. Draw the texture block in `BootScene.create()` (key: `powerup-{typeKey}`)
5. Handle the effect in `GameScene` — either in the overlap callback or `update()`
