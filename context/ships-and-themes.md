# Ships & Themes

## Ships

Selected in MenuScene. Unlocked by high score. Index stored in `localStorage` via `Storage.getSelectedShipIndex()`.

| ID | Label | Unlock Score | Speed Mod | Cooldown Mod | Description | gameScale | previewScale |
|---|---|---|---|---|---|---|---|
| `falcon` | Falcon | 0 | 1.00× | 1.00× | Balanced | 1.0 | 1.5 |
| `viper` | Viper | 500 | 1.20× | 1.10× | Fast · Standard fire | 3.0 | 3.0 |
| `nova` | Nova | 1500 | 0.90× | 0.65× | Rapid fire · Slower | 3.0 | 3.0 |
| `phantom` | Phantom | 3000 | 1.15× | 0.80× | Agile · Fast fire | 3.0 | 3.0 |
| `titan` | Titan | 6000 | 0.85× | 0.55× | Heavy · Rapid fire | 3.0 | 3.0 |

- `gameScale` applies to the in-game sprite scale
- `previewScale` applies to the MenuScene ship selector preview
- `getPlayerLevel(highScore)` returns the 0-based index of the highest unlocked ship
- Effective speed = `PLAYER_SPEED (360) × speedMod`
- Effective cooldown = `PLAYER_FIRE_COOLDOWN_MS (220) × cooldownMod` (halved during rapidFire)

Falcon uses the real PNG `public/assets/ship-falcon.png` (80×134 px). All other ships use procedural textures.

---

## Themes

Selected in MenuScene. Stored in `localStorage` via `Storage.getTheme()`.

| ID | Label | `bgTint` | `bulletTint` |
|---|---|---|---|
| `blue` | Blue | `0x78a6ff` | `0x57e2e5` |
| `purple` | Purple | `0xb088ff` | `0xd0a0ff` |
| `red` | Red | `0xff9080` | `0xff6699` |
| `green` | Green | `0x80ffa0` | `0x90ff70` |
| `gold` | Gold | `0xffd070` | `0xffe060` |

- `bgTint` applied to the near-star `background` TileSprite
- `bulletTint` applied to each player bullet via `setTint()`
- Near-star layer alpha: 0.85 in GameScene, 0.9 in MenuScene/GameOverScene

---

## Storage Keys

| Key | Default | Accessor |
|---|---|---|
| `space-destroyers-high-score` | `0` | `Storage.getHighScore / setHighScore` |
| `space-destroyers-muted` | `false` | `Storage.getMuted / setMuted` |
| `space-destroyers-theme` | `'blue'` | `Storage.getTheme / setTheme` |
| `space-destroyers-ship` | `0` | `Storage.getSelectedShipIndex / setSelectedShipIndex` |

All reads wrapped in `try/catch` to handle `localStorage` unavailability.
