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

const FONT = 'Arial Black, sans-serif';
const PANEL = 0x04101e;

/** Rounded, glossy button with ambient glow and press animation. */
function makeBtn(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  fillHex: number, strokeHex: number,
  text: string, textColor: string,
  onPress: () => void,
): void {
  const r = 14;
  const gfx = scene.add.graphics().setPosition(x, y);

  const draw = (glow: number, fill: number): void => {
    gfx.clear();
    // Ambient outer glow
    gfx.fillStyle(strokeHex, 0.10 * glow);
    gfx.fillRoundedRect(-w / 2 - 9, -h / 2 - 7, w + 18, h + 14, r + 9);
    // Main fill
    gfx.fillStyle(fillHex, fill);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // Bottom shadow strip (3-D depth)
    gfx.fillStyle(0x000000, 0.22);
    gfx.fillRoundedRect(-w / 2 + 3, h / 2 - 8, w - 6, 7, { tl: 0, tr: 0, bl: r - 3, br: r - 3 });
    // Top gloss strip
    gfx.fillStyle(0xffffff, 0.10);
    gfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.40, { tl: r - 3, tr: r - 3, bl: 0, br: 0 });
    // Outer border
    gfx.lineStyle(2, strokeHex, 0.82 * glow);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    // Inner border (emboss)
    gfx.lineStyle(1, strokeHex, 0.22 * glow);
    gfx.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, r - 2);
  };

  draw(0.85, 0.90);

  const label = scene.add.text(x, y, text, {
    fontFamily: FONT, fontSize: '24px', color: textColor,
    stroke: '#060c1a', strokeThickness: 4,
    shadow: { offsetX: 0, offsetY: 0, color: textColor, blur: 18, fill: true },
  }).setOrigin(0.5).setAlpha(0.9);

  // Invisible hit area (slightly larger for touch comfort)
  const hit = scene.add.rectangle(x, y, w + 14, h + 14, 0, 0)
    .setInteractive({ useHandCursor: true });

  hit.on('pointerover', () => { draw(1, 0.96); label.setAlpha(1); });
  hit.on('pointerout',  () => { draw(0.85, 0.90); label.setAlpha(0.9); });
  hit.on('pointerdown', () => {
    scene.tweens.add({
      targets: [gfx, label], scaleX: 0.93, scaleY: 0.93,
      duration: 65, yoyo: true, ease: 'Sine.easeIn',
    });
    onPress();
  });
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const highScore = Storage.getHighScore();
    const theme = THEMES[Storage.getTheme()];

    // ── Parallax background ──────────────────────────────────────
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-nebula').setOrigin(0).setAlpha(0.88);
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg-far').setOrigin(0).setAlpha(0.65);
    const bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint).setAlpha(0.9);
    this.tweens.add({ targets: bg, alpha: 0.75, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // ── Title ────────────────────────────────────────────────────
    // Wide diffuse glow halo (largest, most transparent)
    this.add.text(GAME_WIDTH / 2, 58, 'SPACE DESTROYERS', {
      fontFamily: FONT, fontSize: '36px', color: '#6cf3ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00aaff', blur: 80, fill: true },
    }).setOrigin(0.5).setAlpha(0.18);

    // Mid glow layer
    this.add.text(GAME_WIDTH / 2, 58, 'SPACE DESTROYERS', {
      fontFamily: FONT, fontSize: '36px', color: '#6cf3ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 36, fill: true },
    }).setOrigin(0.5).setAlpha(0.45);

    // Sharp foreground
    const titleFg = this.add.text(GAME_WIDTH / 2, 58, 'SPACE DESTROYERS', {
      fontFamily: FONT, fontSize: '36px', color: '#ffffff',
      stroke: '#1a9fff', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 3, color: '#001830', blur: 6, fill: true },
    }).setOrigin(0.5);

    // Shimmer tween: title pulses between bright white and ice blue
    this.tweens.add({
      targets: titleFg,
      alpha: 0.88,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle tagline
    this.add.text(GAME_WIDTH / 2, 90, 'DEFEND  ·  SURVIVE  ·  CONQUER', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#4a8aaa',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // ── High score + level ───────────────────────────────────────
    const level = getPlayerLevel(highScore);
    this.add.text(GAME_WIDTH / 2, 132, `HIGH  ${highScore.toLocaleString()}`, {
      fontFamily: FONT, fontSize: '18px', color: '#ffe050',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 8, fill: true },
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 158, `LEVEL  ${level + 1}`, {
      fontFamily: FONT, fontSize: '13px', color: '#5588aa', letterSpacing: 3,
    }).setOrigin(0.5);

    // ── Section divider helper ───────────────────────────────────
    const sectionLabel = (y: number, text: string): void => {
      this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 40, 1, 0x1a3060, 0.7).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, y - 8, `  ${text}  `, {
        fontFamily: FONT, fontSize: '11px', color: '#3a6080', letterSpacing: 4,
        backgroundColor: '#060e1c',
        padding: { x: 6, y: 2 },
      }).setOrigin(0.5, 1);
    };

    // ── Ship selector ────────────────────────────────────────────
    sectionLabel(182, 'SELECT SHIP');

    // Card frame
    this.add.rectangle(GAME_WIDTH / 2, 258, GAME_WIDTH - 36, 160, PANEL, 0.82)
      .setStrokeStyle(1, 0x0f2a48, 0.9);

    let selectedShipIdx = Storage.getSelectedShipIndex();

    const shipImage = this.add.image(GAME_WIDTH / 2, 228, SHIP_CONFIGS[selectedShipIdx].texture).setScale(3);
    const shipNameText = this.add.text(GAME_WIDTH / 2, 276, '', {
      fontFamily: FONT, fontSize: '20px', color: '#e8faff',
      stroke: '#060c1a', strokeThickness: 4,
    }).setOrigin(0.5);
    const shipDescText = this.add.text(GAME_WIDTH / 2, 302, '', {
      fontFamily: FONT, fontSize: '14px', color: '#7aaabb',
    }).setOrigin(0.5);

    const refreshShip = (): void => {
      const cfg = SHIP_CONFIGS[selectedShipIdx];
      const locked = highScore < cfg.unlockScore;
      shipImage.setTexture(cfg.texture).setScale(cfg.previewScale).setTint(locked ? 0x334455 : 0xffffff).setAlpha(locked ? 0.4 : 1);
      shipNameText.setText(cfg.label).setColor(locked ? '#446677' : '#e8faff');
      shipDescText
        .setText(locked ? `🔒  Unlock at ${cfg.unlockScore.toLocaleString()} pts` : cfg.description)
        .setColor(locked ? '#445566' : '#7aaabb');
      if (!locked) Storage.setSelectedShipIndex(selectedShipIdx);
    };

    const arrowCfg = { fontFamily: FONT, fontSize: '28px', color: '#6cf3ff', stroke: '#09101f', strokeThickness: 4 };
    const leftArrow  = this.add.text(32, 228, '‹', arrowCfg).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const rightArrow = this.add.text(GAME_WIDTH - 32, 228, '›', arrowCfg).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leftArrow
      .on('pointerover', () => leftArrow.setColor('#ffffff'))
      .on('pointerout',  () => leftArrow.setColor('#6cf3ff'))
      .on('pointerdown', () => {
        selectedShipIdx = (selectedShipIdx - 1 + SHIP_CONFIGS.length) % SHIP_CONFIGS.length;
        this.tweens.add({ targets: shipImage, scaleX: 0, duration: 80, yoyo: true, ease: 'Sine.easeInOut', onYoyo: refreshShip });
      });
    rightArrow
      .on('pointerover', () => rightArrow.setColor('#ffffff'))
      .on('pointerout',  () => rightArrow.setColor('#6cf3ff'))
      .on('pointerdown', () => {
        selectedShipIdx = (selectedShipIdx + 1) % SHIP_CONFIGS.length;
        this.tweens.add({ targets: shipImage, scaleX: 0, duration: 80, yoyo: true, ease: 'Sine.easeInOut', onYoyo: refreshShip });
      });

    refreshShip();

    // ── Theme picker ─────────────────────────────────────────────
    sectionLabel(348, 'COLOUR THEME');

    let selectedThemeId = Storage.getTheme();
    const themeY = 390;
    const spacing = (GAME_WIDTH - 60) / (THEME_IDS.length - 1);
    const selRings: Phaser.GameObjects.Arc[] = [];

    THEME_IDS.forEach((id, i) => {
      const x = 30 + i * spacing;
      const ring = this.add.circle(x, themeY, 22).setStrokeStyle(2.5, 0xffffff, id === selectedThemeId ? 1 : 0);
      selRings.push(ring);
      // Outer subtle glow halo
      this.add.circle(x, themeY, 26, THEMES[id].bgTint, 0.18);
      // Main swatch
      this.add.circle(x, themeY, 18, THEMES[id].bgTint)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          selectedThemeId = id;
          Storage.setTheme(id);
          bg.setTint(THEMES[id].bgTint);
          selRings.forEach((r, j) => r.setStrokeStyle(2.5, 0xffffff, THEME_IDS[j] === selectedThemeId ? 1 : 0));
        });
      this.add.text(x, themeY + 30, THEMES[id].label, {
        fontFamily: FONT, fontSize: '9px', color: '#446688', letterSpacing: 1,
      }).setOrigin(0.5, 0);
    });

    // ── Game mode buttons ────────────────────────────────────────
    sectionLabel(428, 'GAME MODE');

    const startGame = (mode: GameMode): void => {
      const effectiveIdx = highScore >= SHIP_CONFIGS[selectedShipIdx].unlockScore
        ? selectedShipIdx
        : Storage.getSelectedShipIndex();
      Storage.setSelectedShipIndex(effectiveIdx);
      this.scene.start('GameScene', { mode });
    };

    makeBtn(this, GAME_WIDTH / 2, 475, 280, 58, 0x0b1e3a, 0x6cf3ff, 'TIMED — 60s', '#6cf3ff', () => startGame('timed'));
    makeBtn(this, GAME_WIDTH / 2, 548, 280, 58, 0x0e0825, 0xc492ff, '∞  ENDLESS', '#c492ff', () => startGame('infinite'));

    // ── Mute + hint ──────────────────────────────────────────────
    const muteText = this.add.text(GAME_WIDTH / 2, 624, '', {
      fontFamily: FONT, fontSize: '14px', color: '#5a7a8a',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const refreshMute = (): void => {
      muteText.setText(Storage.getMuted() ? '🔇  Sound Off' : '🔊  Sound On');
    };
    refreshMute();
    muteText.on('pointerdown', () => {
      Storage.setMuted(!Storage.getMuted());
      refreshMute();
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '← → to move  ·  SPACE or FIRE button to shoot', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#2a4060',
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => startGame('timed'));
  }
}
