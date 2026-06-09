# UI

## HUD (`src/ui/HUD.ts`)

Fixed overlay container (depth 20) with:

- score and best score blocks
- lives and timer block
- mute icon + auto-fire badge
- active power-up row
- objective strip for next boss
- stored power-up slots (3)
- boss HP bar

### Objective Strip

The objective strip now shows:

- status text (`NEXT BOSS LV.X` or boss-active text)
- small/medium/heavy enemy icons
- remaining counts next to each icon

This replaced the old `S/M/H` text-only format.

### Sync API

`HUD.sync(...)` receives:

- score/high score/lives/time
- active power-up labels
- objective status text
- objective counts tuple (`[small, medium, heavy]`) or `null`
- mute + stored + auto-fire flags

## FloatingText (`src/ui/FloatingText.ts`)

Animated world-space popup for score, warnings, and power-up feedback.

## Other In-Scene UI

- Countdown (3,2,1,GO)
- Pause panel
- Tutorial overlay
- Boss warning banner
- Touch FIRE button
