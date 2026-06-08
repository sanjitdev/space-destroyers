# Controls

## Keyboard

| Key | Action |
|---|---|
| ← / → Arrow | Move player left / right |
| Space | Fire (hold to auto-fire while key is held) |
| F | Toggle **Auto-Fire** (continuous fire without holding Space) |
| E | Use first **stored power-up** immediately |
| M | Toggle mute |

## Touch

The screen is split into two zones:

| Zone | Action |
|---|---|
| Left half of screen | Movement — pointer X controls player X (clamped to canvas) |
| Right half / FIRE button | Fire — held for continuous shooting |

FIRE button is a circle at bottom-right (`x = GAME_WIDTH − 68, y = GAME_HEIGHT − 78, r = 46`).  
Multiple simultaneous pointers are supported (move + fire at the same time).

Pointer IDs are tracked independently (`movePointerId`, `firePointerId`) to prevent cross-interference.

## HUD Interactions

| Element | Interaction |
|---|---|
| 🔊 / 🔇 mute icon (top-centre of HUD) | Tap/click to toggle mute |

## Auto-Fire

When enabled (F key), the player fires every cooldown tick regardless of any key or touch input.  
HUD shows a green `AUTO` badge next to the mute icon when active.

## Key Bindings Reference (GameScene)

```typescript
cursors            = createCursorKeys()          // ← →
fireKey            = SPACE
usePowerUpKey      = E
M key.on('down')   → toggleMute()
F key.on('down')   → player.toggleAutoFire() + syncHud()
```
