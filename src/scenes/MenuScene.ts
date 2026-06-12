import Phaser from 'phaser';
import {
  DIFFICULTY_IDS,
  DIFFICULTY_PRESETS,
  GAME_HEIGHT,
  GAME_WIDTH,
  POWER_UP_TYPES,
  SHIP_CONFIGS,
  THEME_IDS,
  THEMES,
  type DifficultyId,
  type GameMode,
} from '../utils/Constants';
import { DailyChallengeManager } from '../managers/DailyChallengeManager';
import { Storage } from '../utils/Storage';

const FONT = 'Arial Black, sans-serif';
const PANEL = 0x04101e;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const highScore = Storage.getHighScore();
    const unlockedShipLevel = Storage.getMaxUnlockedShipLevel();
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
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#9fd8ee',
      letterSpacing: 4,
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── High score + level ───────────────────────────────────────
    const level = unlockedShipLevel;
    this.add.text(GAME_WIDTH / 2, 132, `HIGH  ${highScore.toLocaleString()}`, {
      fontFamily: FONT, fontSize: '18px', color: '#ffe050',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 8, fill: true },
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 158, `LEVEL  ${level + 1}`, {
      fontFamily: FONT, fontSize: '13px', color: '#b7ddf2', letterSpacing: 3,
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Section divider helper ───────────────────────────────────
    const sectionLabel = (y: number, text: string): void => {
      this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 40, 1, 0x1a3060, 0.7).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, y - 8, `  ${text}  `, {
        fontFamily: FONT, fontSize: '11px', color: '#9ac8e8', letterSpacing: 4,
        backgroundColor: '#060e1c',
        padding: { x: 6, y: 2 },
        stroke: '#04101e', strokeThickness: 3,
      }).setOrigin(0.5, 1);
    };

    // ── Ship selector ────────────────────────────────────────────
    sectionLabel(222, 'SELECT SHIP');

    // Card frame
    this.add.rectangle(GAME_WIDTH / 2, 298, GAME_WIDTH - 36, 160, PANEL, 0.82)
      .setStrokeStyle(1, 0x0f2a48, 0.9);

    let selectedShipIdx = Math.min(Storage.getSelectedShipIndex(), unlockedShipLevel - 1);

    const shipImage = this.add.image(GAME_WIDTH / 2, 268, SHIP_CONFIGS[selectedShipIdx].texture).setScale(3);
    const shipNameText = this.add.text(GAME_WIDTH / 2, 316, '', {
      fontFamily: FONT, fontSize: '20px', color: '#e8faff',
      stroke: '#060c1a', strokeThickness: 4,
    }).setOrigin(0.5);
    const shipDescText = this.add.text(GAME_WIDTH / 2, 342, '', {
      fontFamily: FONT, fontSize: '14px', color: '#bfe1f4',
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5);
    const shipBestText = this.add.text(GAME_WIDTH / 2, 362, '', {
      fontFamily: FONT, fontSize: '11px', color: '#ffe050', letterSpacing: 1,
    }).setOrigin(0.5);

    const refreshShip = (): void => {
      const cfg = SHIP_CONFIGS[selectedShipIdx];
      const locked = selectedShipIdx >= unlockedShipLevel;
      shipImage.setTexture(cfg.texture).setScale(cfg.previewScale).setTint(locked ? 0x334455 : 0xffffff).setAlpha(locked ? 0.4 : 1);
      shipNameText.setText(cfg.label).setColor(locked ? '#446677' : '#e8faff');
      shipDescText
        .setText(locked ? `🔒  Reach Level ${selectedShipIdx + 1} to unlock` : cfg.description)
        .setColor(locked ? '#6f91aa' : '#bfe1f4');
      const best = Storage.getShipBest(selectedShipIdx);
      shipBestText.setText(locked ? '' : best > 0 ? `★  Best  ${best.toLocaleString()}` : '').setVisible(!locked && best > 0);
      if (!locked) Storage.setSelectedShipIndex(selectedShipIdx);
    };

    const arrowCfg = { fontFamily: FONT, fontSize: '28px', color: '#6cf3ff', stroke: '#09101f', strokeThickness: 4 };
    const leftArrow  = this.add.text(32, 268, '‹', arrowCfg).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const rightArrow = this.add.text(GAME_WIDTH - 32, 268, '›', arrowCfg).setOrigin(0.5).setInteractive({ useHandCursor: true });

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

    // ── Game mode buttons ────────────────────────────────────────
    sectionLabel(400, 'GAME MODE');

    const startGame = (mode: GameMode): void => {
      this.scene.start('GameScene', { mode, difficulty: Storage.getDifficulty() });
    };

    const modeCardW = 210;
    const modeCardH = 112;
    const modeCardGap = 12;
    const modeStartX = (GAME_WIDTH - (modeCardW * 2 + modeCardGap)) / 2;
    const modeCardY = 416;

    const modeDefs: Array<{
      mode: GameMode;
      icon: string;
      title: string;
      subtitle: string;
      detail: string;
      bg: number;
      accentHex: number;
      textCol: string;
    }> = [
      { mode: 'timed',    icon: '⏱', title: 'TIMED',   subtitle: '60 SECONDS',   detail: 'Race the clock. Fight for score.', bg: 0x081830, accentHex: 0x6cf3ff, textCol: '#6cf3ff' },
      { mode: 'infinite', icon: '∞',  title: 'ENDLESS', subtitle: 'NO TIME LIMIT', detail: 'Survive as long as you can.',      bg: 0x100820, accentHex: 0xc492ff, textCol: '#c492ff' },
    ];

    modeDefs.forEach(({ mode, icon, title, subtitle, detail, bg: cardBg, accentHex, textCol }, i) => {
      const cx = modeStartX + i * (modeCardW + modeCardGap);
      const cy = modeCardY;
      const gfx = this.add.graphics().setPosition(cx, cy);

      const drawCard = (hover: boolean): void => {
        gfx.clear();
        // Background
        gfx.fillStyle(cardBg, hover ? 0.98 : 0.88);
        gfx.fillRoundedRect(0, 0, modeCardW, modeCardH, 14);
        // Top accent bar
        gfx.fillStyle(accentHex, hover ? 0.55 : 0.28);
        gfx.fillRoundedRect(0, 0, modeCardW, 5, { tl: 14, tr: 14, bl: 0, br: 0 });
        // Bottom glow strip
        gfx.fillStyle(accentHex, hover ? 0.18 : 0.07);
        gfx.fillRoundedRect(0, modeCardH - 5, modeCardW, 5, { tl: 0, tr: 0, bl: 14, br: 14 });
        // Side glow bars
        gfx.fillStyle(accentHex, hover ? 0.10 : 0.04);
        gfx.fillRect(0, 5, 3, modeCardH - 10);
        gfx.fillRect(modeCardW - 3, 5, 3, modeCardH - 10);
        // Outer border
        gfx.lineStyle(hover ? 2 : 1.5, accentHex, hover ? 0.90 : 0.35);
        gfx.strokeRoundedRect(0, 0, modeCardW, modeCardH, 14);
        // Inner gloss
        gfx.lineStyle(1, 0xffffff, hover ? 0.14 : 0.05);
        gfx.strokeRoundedRect(2, 2, modeCardW - 4, modeCardH - 4, 12);
      };

      drawCard(false);

      // Icon
      this.add.text(cx + modeCardW / 2, cy + 26, icon, {
        fontFamily: FONT, fontSize: '26px', color: textCol,
        shadow: { offsetX: 0, offsetY: 0, color: textCol, blur: 18, fill: true },
      }).setOrigin(0.5);

      // Title
      this.add.text(cx + modeCardW / 2, cy + 56, title, {
        fontFamily: FONT, fontSize: '18px', color: textCol,
        stroke: '#020810', strokeThickness: 4,
      }).setOrigin(0.5);

      // Subtitle badge
      this.add.text(cx + modeCardW / 2, cy + 78, subtitle, {
        fontFamily: FONT, fontSize: '10px', color: textCol, letterSpacing: 2,
      }).setOrigin(0.5).setAlpha(0.65);

      // Detail line
      this.add.text(cx + modeCardW / 2, cy + 97, detail, {
        fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#a9cee6',
        stroke: '#04101e', strokeThickness: 2,
      }).setOrigin(0.5);

      // Hit zone
      this.add.rectangle(cx + modeCardW / 2, cy + modeCardH / 2, modeCardW, modeCardH, 0, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => drawCard(true))
        .on('pointerout',  () => drawCard(false))
        .on('pointerdown', () => {
          this.tweens.add({ targets: gfx, scaleX: 0.94, scaleY: 0.94, duration: 65, yoyo: true, ease: 'Sine.easeIn' });
          this.time.delayedCall(100, () => startGame(mode));
        });
    });

    // ── Bottom icon bar: Settings · Power-ups · Daily ──────────
    const iconBarY = 624;
    const iconBtnStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#a8d3e8',
      letterSpacing: 1,
      stroke: '#04101e',
      strokeThickness: 3,
    };
    const divStyle = { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a3050' };

    const settingsBtn = this.add.text(GAME_WIDTH / 2 - 148, iconBarY, '⚙️  Settings', iconBtnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => settingsBtn.setColor('#aaccdd'));
    settingsBtn.on('pointerout',  () => settingsBtn.setColor('#a8d3e8'));
    settingsBtn.on('pointerdown', () => this.showSettingsOverlay(bg));

    this.add.text(GAME_WIDTH / 2 - 68, iconBarY + 1, '|', divStyle).setOrigin(0.5);

    const infoBtn = this.add.text(GAME_WIDTH / 2, iconBarY, 'ⓘ  Power-Ups', iconBtnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    infoBtn.on('pointerover', () => infoBtn.setColor('#6cf3ff'));
    infoBtn.on('pointerout',  () => infoBtn.setColor('#a8d3e8'));
    infoBtn.on('pointerdown', () => this.showPowerUpOverlay());

    this.add.text(GAME_WIDTH / 2 + 68, iconBarY + 1, '|', divStyle).setOrigin(0.5);

    const dailyBtn = this.add.text(GAME_WIDTH / 2 + 148, iconBarY, '📅  Daily', iconBtnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    dailyBtn.on('pointerover', () => dailyBtn.setColor('#ffe050'));
    dailyBtn.on('pointerout',  () => dailyBtn.setColor('#a8d3e8'));
    dailyBtn.on('pointerdown', () => this.showDailyChallengesOverlay());

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '← → to move  ·  SPACE or FIRE button to shoot', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#b0d8ee',
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => startGame('timed'));
  }

  private showSettingsOverlay(bgSprite: Phaser.GameObjects.TileSprite): void {
    const W = GAME_WIDTH;
    const panelW = 420;
    const panelH = 460;
    const panelX = (W - panelW) / 2;
    const panelY = (GAME_HEIGHT - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(60).setAlpha(0);

    const backdrop = this.add.rectangle(W / 2, GAME_HEIGHT / 2, W, GAME_HEIGHT, 0x000000, 0.78).setInteractive();
    container.add(backdrop);

    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x030c1c, 0.97);
    panelGfx.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    panelGfx.lineStyle(1.5, 0x0f2a50, 1);
    panelGfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
    panelGfx.lineStyle(1, 0x6cf3ff, 0.18);
    panelGfx.strokeRoundedRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 16);
    container.add(panelGfx);

    container.add(this.add.text(W / 2, panelY + 26, 'SETTINGS', {
      fontFamily: FONT, fontSize: '20px', color: '#6cf3ff',
      stroke: '#09101f', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 14, fill: true },
    }).setOrigin(0.5));

    container.add(this.add.rectangle(W / 2, panelY + 48, panelW - 36, 1, 0x1a3060, 0.8));

    // ── Colour Theme ────────────────────────────────────────────
    container.add(this.add.text(panelX + 22, panelY + 62, 'COLOUR THEME', {
      fontFamily: FONT, fontSize: '10px', color: '#9ac8e8', letterSpacing: 3,
      stroke: '#04101e', strokeThickness: 3,
    }));

    const CARD_W = 66;
    const CARD_H = 80;
    const CARD_GAP = 10;
    const totalW = THEME_IDS.length * CARD_W + (THEME_IDS.length - 1) * CARD_GAP;
    const cardsStartX = (W - totalW) / 2;
    const cardsY = panelY + 78;

    let selectedThemeId = Storage.getTheme();
    const cardGfxList: Phaser.GameObjects.Graphics[] = [];
    const cardLabels: Phaser.GameObjects.Text[] = [];
    const cardChecks: Phaser.GameObjects.Text[] = [];

    const drawCard = (gfx: Phaser.GameObjects.Graphics, id: typeof THEME_IDS[number], selected: boolean, hover = false): void => {
      const col = THEMES[id].bgTint;
      const bul = THEMES[id].bulletTint;
      gfx.clear();
      gfx.fillStyle(0x050e1c, selected ? 0.98 : hover ? 0.88 : 0.70);
      gfx.fillRoundedRect(0, 0, CARD_W, CARD_H, 10);
      gfx.fillStyle(col, selected ? 0.92 : hover ? 0.72 : 0.50);
      gfx.fillRoundedRect(0, 0, CARD_W, 46, { tl: 10, tr: 10, bl: 0, br: 0 });
      gfx.fillStyle(bul, selected ? 1.0 : hover ? 0.80 : 0.55);
      gfx.fillRect(12, 32, CARD_W - 24, 5);
      gfx.fillStyle(0xffffff, selected ? 0.10 : 0.05);
      gfx.fillRoundedRect(4, 3, CARD_W - 8, 16, { tl: 8, tr: 8, bl: 0, br: 0 });
      if (selected) {
        gfx.lineStyle(2.5, col, 1.0);
        gfx.strokeRoundedRect(0, 0, CARD_W, CARD_H, 10);
        gfx.lineStyle(1, 0xffffff, 0.22);
        gfx.strokeRoundedRect(2, 2, CARD_W - 4, CARD_H - 4, 8);
      } else {
        gfx.lineStyle(hover ? 1.5 : 1, hover ? col : 0x1a3060, hover ? 0.55 : 0.60);
        gfx.strokeRoundedRect(0, 0, CARD_W, CARD_H, 10);
      }
    };

    THEME_IDS.forEach((id, i) => {
      const cx = cardsStartX + i * (CARD_W + CARD_GAP);
      const gfx = this.add.graphics().setPosition(cx, cardsY);
      cardGfxList.push(gfx);
      drawCard(gfx, id, id === selectedThemeId);
      container.add(gfx);

      const lbl = this.add.text(cx + CARD_W / 2, cardsY + 56, THEMES[id].label.toUpperCase(), {
        fontFamily: FONT, fontSize: '8px',
        color: id === selectedThemeId ? '#d7eefc' : '#7fa8c0', letterSpacing: 1,
        stroke: '#04101e', strokeThickness: 2,
      }).setOrigin(0.5, 0);
      cardLabels.push(lbl);
      container.add(lbl);

      const chk = this.add.text(cx + CARD_W / 2, cardsY + 68, '✓', {
        fontFamily: FONT, fontSize: '10px', color: '#6cf3ff',
      }).setOrigin(0.5, 0).setVisible(id === selectedThemeId);
      cardChecks.push(chk);
      container.add(chk);

      const hit = this.add.rectangle(cx + CARD_W / 2, cardsY + CARD_H / 2, CARD_W, CARD_H, 0, 0)
        .setInteractive({ useHandCursor: true });
      container.add(hit);

      hit.on('pointerover', () => { if (id !== selectedThemeId) drawCard(gfx, id, false, true); });
      hit.on('pointerout',  () => { drawCard(gfx, id, id === selectedThemeId); });
      hit.on('pointerdown', () => {
        selectedThemeId = id;
        Storage.setTheme(id);
        bgSprite.setTint(THEMES[id].bgTint);
        cardGfxList.forEach((g, j) => drawCard(g, THEME_IDS[j], THEME_IDS[j] === selectedThemeId));
        cardLabels.forEach((l, j) => l.setColor(THEME_IDS[j] === selectedThemeId ? '#d7eefc' : '#7fa8c0'));
        cardChecks.forEach((c, j) => c.setVisible(THEME_IDS[j] === selectedThemeId));
      });
    });

    // ── Divider + Difficulty ────────────────────────────────────
    const difficultyLineY = panelY + 182;
    container.add(this.add.rectangle(W / 2, difficultyLineY, panelW - 36, 1, 0x1a3060, 0.6));
    container.add(this.add.text(panelX + 22, difficultyLineY + 12, 'DIFFICULTY', {
      fontFamily: FONT, fontSize: '10px', color: '#9ac8e8', letterSpacing: 3,
      stroke: '#04101e', strokeThickness: 3,
    }));

    let selectedDifficulty: DifficultyId = Storage.getDifficulty();
    const difficultyButtons: Array<{ id: DifficultyId; gfx: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; desc: Phaser.GameObjects.Text }> = [];

    const diffCardW = 118;
    const diffCardH = 56;
    const diffGap = 10;
    const diffStartX = panelX + 22;
    const diffY = difficultyLineY + 32;

    const drawDifficultyCard = (item: { id: DifficultyId; gfx: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; desc: Phaser.GameObjects.Text }, hover = false): void => {
      const isSelected = item.id === selectedDifficulty;
      const preset = DIFFICULTY_PRESETS[item.id];
      const accent = item.id === 'easy' ? 0x6bffa2 : item.id === 'hard' ? 0xff7a66 : 0x6cf3ff;

      item.gfx.clear();
      item.gfx.fillStyle(0x071223, isSelected ? 0.96 : hover ? 0.86 : 0.72);
      item.gfx.fillRoundedRect(0, 0, diffCardW, diffCardH, 10);
      item.gfx.fillStyle(accent, isSelected ? 0.24 : hover ? 0.14 : 0.08);
      item.gfx.fillRoundedRect(0, 0, diffCardW, 6, { tl: 10, tr: 10, bl: 0, br: 0 });
      item.gfx.lineStyle(isSelected ? 2 : 1, accent, isSelected ? 0.95 : hover ? 0.65 : 0.35);
      item.gfx.strokeRoundedRect(0, 0, diffCardW, diffCardH, 10);

      item.label.setText(preset.label.toUpperCase()).setColor(isSelected ? '#f5fcff' : '#9cc7dd');
      item.desc.setText(preset.description).setColor(isSelected ? '#bfe8ff' : '#7fa8c0');
    };

    DIFFICULTY_IDS.forEach((id, index) => {
      const x = diffStartX + index * (diffCardW + diffGap);
      const gfx = this.add.graphics().setPosition(x, diffY);
      const label = this.add.text(x + diffCardW / 2, diffY + 14, '', {
        fontFamily: FONT, fontSize: '10px', color: '#9cc7dd', letterSpacing: 2,
        stroke: '#04101e', strokeThickness: 3,
      }).setOrigin(0.5, 0);
      const desc = this.add.text(x + diffCardW / 2, diffY + 33, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#7fa8c0',
        stroke: '#04101e', strokeThickness: 2,
      }).setOrigin(0.5, 0);
      const hit = this.add.rectangle(x + diffCardW / 2, diffY + diffCardH / 2, diffCardW, diffCardH, 0, 0)
        .setInteractive({ useHandCursor: true });

      const item = { id, gfx, label, desc };
      difficultyButtons.push(item);

      container.add(gfx);
      container.add(label);
      container.add(desc);
      container.add(hit);

      drawDifficultyCard(item);

      hit.on('pointerover', () => drawDifficultyCard(item, true));
      hit.on('pointerout', () => drawDifficultyCard(item));
      hit.on('pointerdown', () => {
        selectedDifficulty = id;
        Storage.setDifficulty(id);
        difficultyButtons.forEach(button => drawDifficultyCard(button));
      });
    });

    // ── Divider + Mute ──────────────────────────────────────────
    const muteLineY = panelY + 292;
    container.add(this.add.rectangle(W / 2, muteLineY, panelW - 36, 1, 0x1a3060, 0.6));
    container.add(this.add.text(panelX + 22, muteLineY + 12, 'SOUND', {
      fontFamily: FONT, fontSize: '10px', color: '#9ac8e8', letterSpacing: 3,
      stroke: '#04101e', strokeThickness: 3,
    }));

    const muteLbl = this.add.text(panelX + panelW - 22, muteLineY + 12, '', {
      fontFamily: FONT, fontSize: '14px', color: '#6cf3ff',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    container.add(muteLbl);

    const refreshMuteToggle = (): void => {
      muteLbl.setText(Storage.getMuted() ? '🔇  Off' : '🔊  On');
    };
    refreshMuteToggle();
    muteLbl.on('pointerdown', () => {
      Storage.setMuted(!Storage.getMuted());
      refreshMuteToggle();
    });

    // ── Volume controls ────────────────────────────────────────
    const makeVolumeRow = (labelText: string, rowY: number, getVol: () => number, setVol: (v: number) => void): void => {
      container.add(this.add.text(panelX + 22, rowY, labelText, {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#7fa8c0', letterSpacing: 2,
        stroke: '#04101e', strokeThickness: 2,
      }));

      const volLbl = this.add.text(panelX + panelW - 22, rowY, `${Math.round(getVol() * 100)}%`, {
        fontFamily: FONT, fontSize: '12px', color: '#6cf3ff',
      }).setOrigin(1, 0);
      container.add(volLbl);

      const barW = panelW - 120;
      const barX = panelX + 58;
      const barY = rowY + 18;

      const barBg = this.add.graphics();
      barBg.fillStyle(0x0a1a2c, 1);
      barBg.fillRoundedRect(barX, barY, barW, 6, 3);
      container.add(barBg);

      const barFill = this.add.graphics();
      const redrawBar = (): void => {
        barFill.clear();
        barFill.fillStyle(0x2a7fcc, 1);
        barFill.fillRoundedRect(barX, barY, barW * getVol(), 6, 3);
      };
      redrawBar();
      container.add(barFill);

      // Draggable hit area
      const hitBar = this.add.rectangle(barX + barW / 2, barY + 3, barW, 20, 0, 0)
        .setInteractive({ useHandCursor: true });
      container.add(hitBar);
      hitBar.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        const fraction = Phaser.Math.Clamp((ptr.x - barX) / barW, 0, 1);
        const snapped = Math.round(fraction * 10) / 10;
        setVol(snapped);
        volLbl.setText(`${Math.round(snapped * 100)}%`);
        redrawBar();
      });
    };

    const volumeLineY = muteLineY + 48;
    container.add(this.add.rectangle(W / 2, volumeLineY - 4, panelW - 36, 1, 0x1a3060, 0.5));
    container.add(this.add.text(panelX + 22, volumeLineY + 6, 'VOLUME', {
      fontFamily: FONT, fontSize: '10px', color: '#9ac8e8', letterSpacing: 3,
      stroke: '#04101e', strokeThickness: 3,
    }));
    makeVolumeRow('Music', volumeLineY + 28, () => Storage.getMusicVolume(), v => Storage.setMusicVolume(v));
    makeVolumeRow('SFX',   volumeLineY + 62, () => Storage.getSfxVolume(),   v => Storage.setSfxVolume(v));

    this.tweens.add({ targets: container, alpha: 1, duration: 160 });

    const close = (): void => {
      escKey?.off('down', close);
      this.tweens.add({ targets: container, alpha: 0, duration: 120, onComplete: () => container.destroy() });
    };
    backdrop.on('pointerdown', close);
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.once('down', close);
  }

  private showPowerUpOverlay(): void {
    const W = GAME_WIDTH;
    const panelW = 430;
    const panelH = 666;
    const panelX = (W - panelW) / 2;
    const panelY = (GAME_HEIGHT - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(60).setAlpha(0);

    // Semi-transparent backdrop — tap to close
    const backdrop = this.add.rectangle(W / 2, GAME_HEIGHT / 2, W, GAME_HEIGHT, 0x000000, 0.78)
      .setInteractive();
    container.add(backdrop);

    // Glass panel
    const gfx = this.add.graphics();
    gfx.fillStyle(0x030c1c, 0.97);
    gfx.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1.5, 0x0f2a50, 1);
    gfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1, 0x6cf3ff, 0.18);
    gfx.strokeRoundedRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 16);
    container.add(gfx);

    // Title
    container.add(this.add.text(W / 2, panelY + 26, 'POWER-UPS', {
      fontFamily: FONT, fontSize: '20px', color: '#6cf3ff',
      stroke: '#09101f', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 14, fill: true },
    }).setOrigin(0.5));

    // Divider
    container.add(this.add.rectangle(W / 2, panelY + 48, panelW - 36, 1, 0x1a3060, 0.8));

    // Keep descriptions centralized so every defined power-up appears in the list.
    const powerUpDescriptions: Record<(typeof POWER_UP_TYPES)[number], string> = {
      rapidFire: 'Halves fire cooldown until you are hit',
      tripleShot: '3 bullets per shot until you are hit',
      doubleShot: '2 bullets per shot until you are hit',
      shield: 'Blocks hits and stacks up to 3 charges',
      scoreMultiplier: 'Doubles kill points for 10 s',
      slowTime: 'Halves all enemy speed for 10 s',
      laser: 'Fires an instant full-width beam',
      extraLife: 'Gain one life (max 5)',
      nuke: 'Destroys every enemy on screen instantly',
      piercingShot: 'Bullets pierce through enemies for 10 s',
      magnetShield: 'Absorbs nearby bullets & hits for 10 s',
      ribbonLaser: 'Summons rotating ribbons that shred enemies',
    };

    const rows = POWER_UP_TYPES.map((type) => ({
      key: `powerup-${type}`,
      label: type === 'scoreMultiplier'
        ? '2× Score'
        : type === 'extraLife'
          ? '+1 Life'
          : type === 'laser'
            ? 'Mega Laser'
            : type === 'nuke'
              ? 'Nuke'
              : type.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      desc: powerUpDescriptions[type],
    }));

    const startY = panelY + 58;
    const rowH   = 44;
    const iconX  = panelX + 36;
    const textX  = panelX + 66;

    rows.forEach(({ key, label, desc }, i) => {
      const y = startY + i * rowH;

      // Alternating row tint
      if (i % 2 === 0) {
        container.add(
          this.add.rectangle(W / 2, y + rowH / 2, panelW - 16, rowH, 0x061222, 0.55).setOrigin(0.5),
        );
      }

      container.add(this.add.image(iconX, y + rowH / 2, key).setScale(0.80));

      container.add(this.add.text(textX, y + rowH / 2 - 12, label, {
        fontFamily: FONT, fontSize: '14px', color: '#d8f0ff',
        stroke: '#09101f', strokeThickness: 3,
      }));

      container.add(this.add.text(textX, y + rowH / 2 + 8, desc, {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#b3d8ee',
        stroke: '#04101e', strokeThickness: 2,
      }));
    });

    // Boss-storage note
    const noteY = panelY + panelH - 52;
    container.add(this.add.rectangle(W / 2, noteY + 14, panelW - 36, 1, 0x1a3060, 0.5));
    container.add(this.add.text(W / 2, noteY + 22, 'During boss fights, power-ups are banked (max 3).  Press  E  to use the first stored one instantly.', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#b3d8ee',
      align: 'center', wordWrap: { width: panelW - 48 },
      stroke: '#04101e', strokeThickness: 2,
    }).setOrigin(0.5, 0));

    // Fade in
    this.tweens.add({ targets: container, alpha: 1, duration: 160 });

    const close = (): void => {
      escKey?.off('down', close);
      this.tweens.add({
        targets: container, alpha: 0, duration: 120,
        onComplete: () => container.destroy(),
      });
    };

    backdrop.on('pointerdown', close);
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.once('down', close);
  }

  private showDailyChallengesOverlay(): void {
    const W = GAME_WIDTH;
    const manager = new DailyChallengeManager();
    const challenges = manager.getChallenges();

    const panelW = 400;
    const panelH = 340;
    const panelX = (W - panelW) / 2;
    const panelY = (GAME_HEIGHT - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(60).setAlpha(0);
    const backdrop = this.add.rectangle(W / 2, GAME_HEIGHT / 2, W, GAME_HEIGHT, 0x000000, 0.78).setInteractive();
    container.add(backdrop);

    const gfx = this.add.graphics();
    gfx.fillStyle(0x030c1c, 0.97);
    gfx.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1.5, 0x1a3060, 1);
    gfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1, 0xffe050, 0.18);
    gfx.strokeRoundedRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 16);
    container.add(gfx);

    container.add(this.add.text(W / 2, panelY + 26, '📅  DAILY CHALLENGES', {
      fontFamily: FONT, fontSize: '18px', color: '#ffe050',
      stroke: '#09101f', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffcc00', blur: 14, fill: true },
    }).setOrigin(0.5));

    container.add(this.add.text(W / 2, panelY + 50, 'Complete all 3 for a score bonus', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#9ac8e8', letterSpacing: 1,
    }).setOrigin(0.5));

    container.add(this.add.rectangle(W / 2, panelY + 64, panelW - 36, 1, 0x1a3060, 0.8));

    const completedCount = challenges.filter(c => c.completed).length;
    const bonusMult = manager.getScoreMultiplierBonus();

    challenges.forEach((state, i) => {
      const rowY = panelY + 82 + i * 70;
      const isComplete = state.completed;
      const progress = Math.min(state.progress, state.def.target);
      const fraction = state.def.target > 0 ? progress / state.def.target : 0;

      // Row background
      const rowGfx = this.add.graphics();
      rowGfx.fillStyle(isComplete ? 0x0a2210 : 0x050d1a, 0.9);
      rowGfx.fillRoundedRect(panelX + 16, rowY, panelW - 32, 58, 8);
      rowGfx.lineStyle(1.5, isComplete ? 0x44ff88 : 0x1a3a60, 0.8);
      rowGfx.strokeRoundedRect(panelX + 16, rowY, panelW - 32, 58, 8);
      container.add(rowGfx);

      // Checkmark or number
      container.add(this.add.text(panelX + 30, rowY + 28, isComplete ? '✓' : `${i + 1}`, {
        fontFamily: FONT, fontSize: isComplete ? '20px' : '14px',
        color: isComplete ? '#44ff88' : '#4a7a9a',
        stroke: '#04101e', strokeThickness: 3,
      }).setOrigin(0.5));

      // Challenge label
      container.add(this.add.text(panelX + 50, rowY + 12, state.def.label, {
        fontFamily: FONT, fontSize: '13px',
        color: isComplete ? '#b0ffcc' : '#d8f0ff',
        stroke: '#04101e', strokeThickness: 3,
      }));

      // Progress text
      const progressLabel = state.def.type === 'no_damage'
        ? (isComplete ? 'No damage taken!' : 'Avoid all damage')
        : `${progress} / ${state.def.target}`;
      container.add(this.add.text(panelX + 50, rowY + 32, progressLabel, {
        fontFamily: 'Arial, sans-serif', fontSize: '11px',
        color: isComplete ? '#88ffaa' : '#7fa8c0',
        stroke: '#04101e', strokeThickness: 2,
      }));

      // Progress bar
      const barW = panelW - 112;
      const barX = panelX + 50;
      const barY = rowY + 46;
      const barGfx = this.add.graphics();
      barGfx.fillStyle(0x0a1a2c, 1);
      barGfx.fillRoundedRect(barX, barY, barW, 5, 2);
      barGfx.fillStyle(isComplete ? 0x44ff88 : 0x2a6fcc, 1);
      barGfx.fillRoundedRect(barX, barY, barW * fraction, 5, 2);
      container.add(barGfx);
    });

    // Bonus line
    const bonusY = panelY + panelH - 54;
    container.add(this.add.rectangle(W / 2, bonusY, panelW - 36, 1, 0x1a3060, 0.5));
    container.add(this.add.text(W / 2, bonusY + 14, `${completedCount}/3 completed  ·  Score bonus  ×${bonusMult.toFixed(2)}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '12px',
      color: completedCount === 3 ? '#ffe050' : '#7fa8c0',
      stroke: '#04101e', strokeThickness: 2,
    }).setOrigin(0.5));

    container.add(this.add.text(W / 2, bonusY + 32, 'Challenges reset daily at midnight', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#4a6a8a', letterSpacing: 1,
    }).setOrigin(0.5));

    this.tweens.add({ targets: container, alpha: 1, duration: 160 });

    const close = (): void => {
      escKey?.off('down', close);
      this.tweens.add({ targets: container, alpha: 0, duration: 120, onComplete: () => container.destroy() });
    };
    backdrop.on('pointerdown', close);
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.once('down', close);
  }
}
