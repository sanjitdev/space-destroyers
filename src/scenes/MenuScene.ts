import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SHIP_CONFIGS,
  THEME_IDS,
  THEMES,
  getPlayerLevel,
  type GameMode,
} from '../utils/Constants';
import { Storage } from '../utils/Storage';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const highScore = Storage.getHighScore();
    const theme = THEMES[Storage.getTheme()];

    const bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint);
    this.tweens.add({ targets: bg, alpha: 0.85, duration: 1800, yoyo: true, repeat: -1 });

    // Title
    this.add.text(GAME_WIDTH / 2, 68, 'SPACE DESTROYERS', {
      align: 'center',
      color: '#6cf3ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '42px',
      stroke: '#09101f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // High score + level
    const level = getPlayerLevel(highScore);
    this.add.text(GAME_WIDTH / 2, 152, `High Score: ${highScore}   •   Level ${level + 1}`, {
      color: '#f4f7ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // ── Ship selector ──────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, 205, 'SELECT SHIP', {
      color: '#aaccff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '15px',
      stroke: '#09101f',
      strokeThickness: 3,
    }).setOrigin(0.5);

    let selectedShipIdx = Storage.getSelectedShipIndex();
    const shipPreviewY = 268;

    const shipImage = this.add
      .image(GAME_WIDTH / 2, shipPreviewY, SHIP_CONFIGS[selectedShipIdx].texture)
      .setScale(2.8);
    const shipNameText = this.add.text(GAME_WIDTH / 2, shipPreviewY + 54, '', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const shipDescText = this.add.text(GAME_WIDTH / 2, shipPreviewY + 82, '', {
      color: '#dbe7ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      stroke: '#09101f',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const refreshShip = (): void => {
      const config = SHIP_CONFIGS[selectedShipIdx];
      const locked = highScore < config.unlockScore;
      shipImage.setTexture(config.texture).setTint(locked ? 0x445566 : 0xffffff).setAlpha(locked ? 0.45 : 1);
      shipNameText.setText(config.label);
      shipDescText.setText(locked ? `🔒 Reach ${config.unlockScore} pts` : config.description);
      if (!locked) Storage.setSelectedShipIndex(selectedShipIdx);
    };

    const arrowStyle = {
      color: '#6cf3ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '30px',
      stroke: '#09101f',
      strokeThickness: 5,
    };
    this.add.text(52, shipPreviewY, '◄', arrowStyle).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { selectedShipIdx = (selectedShipIdx - 1 + SHIP_CONFIGS.length) % SHIP_CONFIGS.length; refreshShip(); });
    this.add.text(GAME_WIDTH - 52, shipPreviewY, '►', arrowStyle).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { selectedShipIdx = (selectedShipIdx + 1) % SHIP_CONFIGS.length; refreshShip(); });

    refreshShip();

    // ── Theme picker ───────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, 378, 'THEME', {
      color: '#aaccff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '15px',
      stroke: '#09101f',
      strokeThickness: 3,
    }).setOrigin(0.5);

    let selectedThemeId = Storage.getTheme();
    const themeY = 418;
    const spacing = 58;
    const themeStartX = GAME_WIDTH / 2 - ((THEME_IDS.length - 1) * spacing) / 2;
    const selectionRings: Phaser.GameObjects.Arc[] = [];

    THEME_IDS.forEach((id, i) => {
      const x = themeStartX + i * spacing;
      const ring = this.add.circle(x, themeY, 21).setStrokeStyle(3, 0xffffff, id === selectedThemeId ? 1 : 0);
      selectionRings.push(ring);
      this.add
        .circle(x, themeY, 17, THEMES[id].bgTint)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          selectedThemeId = id;
          Storage.setTheme(id);
          bg.setTint(THEMES[id].bgTint);
          selectionRings.forEach((r, j) =>
            r.setStrokeStyle(3, 0xffffff, THEME_IDS[j] === selectedThemeId ? 1 : 0),
          );
        });
    });

    // ── Mode buttons ───────────────────────────────────────────────
    const startGame = (mode: GameMode): void => {
      const effectiveIdx =
        highScore >= SHIP_CONFIGS[selectedShipIdx].unlockScore
          ? selectedShipIdx
          : Storage.getSelectedShipIndex();
      Storage.setSelectedShipIndex(effectiveIdx);
      this.scene.start('GameScene', { mode });
    };

    this.add
      .rectangle(GAME_WIDTH / 2, 500, 260, 60, 0x182c52, 0.95)
      .setStrokeStyle(3, 0x6cf3ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => startGame('timed'));
    this.add.text(GAME_WIDTH / 2, 500, 'TIMED — 60s', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      stroke: '#09101f',
      strokeThickness: 5,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => startGame('timed'));

    this.add
      .rectangle(GAME_WIDTH / 2, 578, 260, 60, 0x1a1040, 0.95)
      .setStrokeStyle(3, 0xc492ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => startGame('infinite'));
    this.add.text(GAME_WIDTH / 2, 578, '∞  ENDLESS', {
      color: '#d4b0ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      stroke: '#09101f',
      strokeThickness: 5,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => startGame('infinite'));

    // ── Mute toggle ────────────────────────────────────────────────
    const muteText = this.add.text(
      GAME_WIDTH / 2,
      658,
      Storage.getMuted() ? 'Sound: Off (tap to toggle)' : 'Sound: On (tap to toggle)',
      {
        color: '#f5f1a6',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        stroke: '#09101f',
        strokeThickness: 4,
      },
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    muteText.on('pointerdown', () => {
      const muted = !Storage.getMuted();
      Storage.setMuted(muted);
      muteText.setText(muted ? 'Sound: Off (tap to toggle)' : 'Sound: On (tap to toggle)');
    });

    this.input.keyboard?.once('keydown-SPACE', () => startGame('timed'));
  }
}

