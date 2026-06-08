# Space Blaster

A production-ready browser shooter built with TypeScript, Phaser 3, and Vite.

## Features

- 60-second arcade survival run with score chasing
- Three enemy classes with increasing difficulty
- Object-pooled bullets for smooth firing
- Five timed power-ups with HUD tracking
- Synthesized sound effects and looping background music
- LocalStorage-backed high score and mute state
- Keyboard and mobile touch controls
- GitHub Pages-ready Vite and Actions configuration

## Controls

- **Left / Right Arrow**: Move
- **Space**: Fire
- **M**: Toggle mute
- **Touch**: Drag to move and use the on-screen fire button

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploying to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Ensure the repository name matches `space-destroyers` so the configured Vite `base` path is correct.
4. Push to `main` (or trigger the workflow manually) to publish the latest `dist` build.
