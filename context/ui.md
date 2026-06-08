# UI

## HUD (`src/ui/HUD.ts`)

Extends `Phaser.GameObjects.Container`. `scrollFactor(0)`, depth 20.

### Layout (480×128 px glass panel at y=0)

```
┌──────────────────────────────────────────────────┐  y=0
│  SCORE          │  ♥ ♥ ♥              [🔊] [AUTO]│
│  0              │  60                            │
│                 │    (timer)    ×3 COMBO (12)    │
│  BEST: 0        │  SECONDS                       │
│  ⚡ Rapid Fire 8s · Shield 4s                    │  y=108
├──────────────────────────────────────────────────┤  y=127 (accent line)
│ [slot] [slot] [slot]   (stored power-up slots)   │  y=132
└──────────────────────────────────────────────────┘

[— LV.3 PULSAR ────────────────────────────────]   y=138 (boss HP bar, only visible during boss)
```

### Components

| Field | Type | Description |
|---|---|---|
| `scoreValueText` | Text | Large score value, left block |
| `highValueText` | Text | Best score below main score |
| `livesText` | Text | `♥ ♥ ♥` hearts (red when lives=1) |
| `timeValueText` | Text | Remaining seconds or `∞` |
| `muteBtn` | Text | 🔊/🔇, interactive tap |
| `autoFireBadge` | Text | Green `AUTO` badge, hidden when off |
| `powerUpRow` | Text | Active power-ups with countdown |
| `storedSlots[3]` | Rectangle[] | Grey bordered slot backgrounds |
| `storedIcons[3]` | Rectangle[] | Tinted fill shows stored type color |
| `bossBarBg` | Rectangle | Dark boss HP bar background |
| `bossBarFill` | Rectangle | Colored fill (green→orange→red) |
| `bossBarLabel` | Text | `— LV.N BOSSNAME —` |

### Key Methods

```typescript
sync(score, highScore, lives, timeRemaining, powerUps, muted, stored, autoFire)
setBossHp(fraction | null, bossName?, bossLevel?)
```

`setBossHp(null)` hides the entire boss bar section.

---

## FloatingText (`src/ui/FloatingText.ts`)

Spawns a self-destroying text popup at a world position.

```typescript
new FloatingText(scene, x, y, text, color)
```

Animation:
1. Scale punch: 1.35 → 1.0 over 110 ms (`Back.easeOut`)
2. Float up 48 px + fade to 0 over 680 ms

Font: 20px `Arial Black`; glow shadow; depth 22.

---

## Combo Text

A `Phaser.GameObjects.Text` instance managed directly in `GameScene` (not a separate class). Sits at `(GAME_WIDTH/2, 66)` inside the HUD panel at depth 25, `scrollFactor(0)`. Visible when streak ≥ 3.

Format: `×N COMBO (streak)` in gold `#ffe050`.

---

## Touch Fire Button

Created in `GameScene.createTouchControls()`. Circle at `(GAME_WIDTH − 68, GAME_HEIGHT − 78)`, radius 46, depth 19. "FIRE" label in white. Not a separate class — inline in GameScene.

---

## Boss Warning Banner

Temporary `Text` created in `GameScene.showBossWarning()`. Format: `⚠ LV.N BOSSNAME ⚠`. Alpha tweens 0→1→0 four times over 4×300 ms, then self-destroys. Depth 30.
