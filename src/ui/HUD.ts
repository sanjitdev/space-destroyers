import Phaser from 'phaser';
import { GAME_WIDTH, POWER_UP_TINTS, type PowerUpType } from '../utils/Constants';

const FONT = 'Arial Black, sans-serif';
const PANEL = 0x030a18;
const ACCENT = 0x6cf3ff;
const BORDER = 0x0f2040;

export class HUD extends Phaser.GameObjects.Container {
  private readonly scoreValueText: Phaser.GameObjects.Text;
  private readonly highValueText: Phaser.GameObjects.Text;
  private readonly livesText: Phaser.GameObjects.Text;
  private readonly timeValueText: Phaser.GameObjects.Text;
  private readonly powerUpRow: Phaser.GameObjects.Text;
  private readonly objectivePanel: Phaser.GameObjects.Rectangle;
  private readonly objectiveStatusText: Phaser.GameObjects.Text;
  private readonly objectiveIcons: Phaser.GameObjects.Image[];
  private readonly objectiveCountTexts: Phaser.GameObjects.Text[];
  private readonly muteBtn: Phaser.GameObjects.Text;
  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossBarLabel: Phaser.GameObjects.Text;
  private readonly autoFireBadge: Phaser.GameObjects.Text;
  private readonly storedSlots: Phaser.GameObjects.Rectangle[];
  private readonly storedIcons: Phaser.GameObjects.Rectangle[];

  private static readonly SLOT_SIZE = 22;
  private static readonly SLOT_GAP = 6;

  private static readonly BAR_W = GAME_WIDTH - 40;
  private static readonly BAR_H = 18;
  private static readonly BAR_Y = 162;
  private static readonly PANEL_H = 152;

  constructor(scene: Phaser.Scene, onToggleMute: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0).setDepth(20);

    // ── Glass panel backdrop ────────────────────────────────────
    const panel = scene.add
      .rectangle(0, 0, GAME_WIDTH, HUD.PANEL_H, PANEL, 0.86)
      .setOrigin(0)
      .setStrokeStyle(1, BORDER, 1);

    // Cyan accent line along the bottom edge of the panel
    const accentLine = scene.add
      .rectangle(0, HUD.PANEL_H - 1, GAME_WIDTH, 2, ACCENT, 0.55)
      .setOrigin(0);

    // Vertical divider between left and right blocks
    const divider = scene.add
      .rectangle(GAME_WIDTH / 2, 12, 1, HUD.PANEL_H - 24, BORDER, 0.9)
      .setOrigin(0.5, 0);

    // ── Left block — Score ──────────────────────────────────────
    scene.add.text(22, 14, 'SCORE', {
      fontFamily: FONT, fontSize: '11px', color: '#9ac8e8', letterSpacing: 4,
      stroke: '#000014', strokeThickness: 3,
    });
    this.scoreValueText = scene.add.text(22, 28, '0', {
      fontFamily: FONT, fontSize: '34px', color: '#ffffff',
      stroke: '#000014', strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 20, fill: true },
    });
    scene.add.text(22, 80, 'BEST', {
      fontFamily: FONT, fontSize: '11px', color: '#9ac8e8', letterSpacing: 4,
      stroke: '#000014', strokeThickness: 3,
    });
    this.highValueText = scene.add.text(22, 94, '0', {
      fontFamily: FONT, fontSize: '18px', color: '#d6efff',
      stroke: '#000014', strokeThickness: 4,
    });

    // ── Right block — Lives + Timer ─────────────────────────────
    this.livesText = scene.add.text(GAME_WIDTH - 22, 14, '♥ ♥ ♥', {
      fontFamily: FONT, fontSize: '17px', color: '#ff5c8a',
      stroke: '#000000', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff2244', blur: 12, fill: true },
    }).setOrigin(1, 0);

    this.timeValueText = scene.add.text(GAME_WIDTH - 22, 38, '60', {
      fontFamily: FONT, fontSize: '40px', color: '#6cf3ff',
      stroke: '#000014', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 22, fill: true },
    }).setOrigin(1, 0);

    scene.add.text(GAME_WIDTH - 22, 92, 'SECONDS', {
      fontFamily: FONT, fontSize: '11px', color: '#9ac8e8', letterSpacing: 3,
      stroke: '#000014', strokeThickness: 3,
    }).setOrigin(1, 0);

    // ── Mute icon ───────────────────────────────────────────────
    this.muteBtn = scene.add.text(GAME_WIDTH / 2, 10, '🔊', {
      fontFamily: FONT, fontSize: '20px',
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', onToggleMute);

    // ── Auto-fire badge ─────────────────────────────────────────
    this.autoFireBadge = scene.add.text(GAME_WIDTH / 2 + 26, 10, 'AUTO', {
      fontFamily: FONT, fontSize: '9px', color: '#7cff6b', letterSpacing: 2,
      stroke: '#000000', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#44ff88', blur: 8, fill: true },
    }).setOrigin(0, 0).setVisible(false);

    // ── Power-up strip ──────────────────────────────────────────
    this.powerUpRow = scene.add.text(GAME_WIDTH / 2, 108, '', {
      fontFamily: FONT, fontSize: '12px', color: '#e8f7ff', letterSpacing: 1,
      stroke: '#000014', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#57e2e5', blur: 10, fill: true },
    }).setOrigin(0.5, 0);

    this.objectivePanel = scene.add.rectangle(GAME_WIDTH / 2, 136, GAME_WIDTH - 52, 20, 0x061222, 0.92)
      .setStrokeStyle(1, 0x1a3060, 0.95);
    this.objectiveStatusText = scene.add.text(92, 136, 'NEXT BOSS LV.1', {
      fontFamily: FONT, fontSize: '10px', color: '#dff4ff', letterSpacing: 1,
      stroke: '#000014', strokeThickness: 3,
    }).setOrigin(0, 0.5);

    const objectiveStartX = GAME_WIDTH - 128;
    const objectiveStepX = 40;
    const objectiveIconKeys = ['enemy-small', 'enemy-medium', 'enemy-heavy'] as const;
    this.objectiveIcons = objectiveIconKeys.map((key, index) =>
      scene.add.image(objectiveStartX + index * objectiveStepX, 136, key).setScale(0.34).setOrigin(0.5),
    );
    this.objectiveCountTexts = objectiveIconKeys.map((_, index) =>
      scene.add.text(objectiveStartX + 12 + index * objectiveStepX, 136, '0', {
        fontFamily: FONT, fontSize: '10px', color: '#dff4ff',
        stroke: '#000014', strokeThickness: 3,
      }).setOrigin(0, 0.5),
    );

    // ── Stored power-up slots (3 slots below panel) ─────────────
    this.storedSlots = [];
    this.storedIcons = [];
    const slotSize = HUD.SLOT_SIZE;
    const totalSlotsWidth = 3 * slotSize + 2 * HUD.SLOT_GAP;
    const slotStartX = (GAME_WIDTH - totalSlotsWidth) / 2;
    for (let i = 0; i < 3; i++) {
      const sx = slotStartX + i * (slotSize + HUD.SLOT_GAP);
      const sy = HUD.PANEL_H + 4;
      const bg = scene.add.rectangle(sx, sy, slotSize, slotSize, 0x040e20, 0.85)
        .setOrigin(0).setStrokeStyle(1, 0x1a3060, 1);
      const icon = scene.add.rectangle(sx + 3, sy + 3, slotSize - 6, slotSize - 6, 0x0088ff, 0.0)
        .setOrigin(0);
      this.storedSlots.push(bg);
      this.storedIcons.push(icon);
    }

    // ── Boss HP bar ─────────────────────────────────────────────
    this.bossBarBg = scene.add
      .rectangle(20, HUD.BAR_Y, HUD.BAR_W, HUD.BAR_H, 0x1a000c)
      .setOrigin(0).setStrokeStyle(1, 0x550022, 0.9).setVisible(false);
    this.bossBarFill = scene.add
      .rectangle(20, HUD.BAR_Y, HUD.BAR_W, HUD.BAR_H, 0xff3366)
      .setOrigin(0).setVisible(false);
    this.bossBarLabel = scene.add.text(GAME_WIDTH / 2, HUD.BAR_Y + HUD.BAR_H / 2, '— BOSS —', {
      fontFamily: FONT, fontSize: '11px', color: '#ffbbcc', letterSpacing: 3,
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.add([
      panel, accentLine, divider,
      this.scoreValueText, this.highValueText,
      this.livesText, this.timeValueText,
      this.muteBtn, this.autoFireBadge, this.powerUpRow, this.objectivePanel, this.objectiveStatusText,
      ...this.objectiveIcons, ...this.objectiveCountTexts,
      ...this.storedSlots, ...this.storedIcons,
      this.bossBarBg, this.bossBarFill, this.bossBarLabel,
    ]);
  }

  flashPowerUpRow(): void {
    this.powerUpRow.setColor('#ffee44');
    this.scene.time.delayedCall(180, () => this.powerUpRow.setColor('#e8f7ff'));
  }

  sync(
    score: number,
    highScore: number,
    lives: number,
    timeRemaining: number,
    powerUps: string[],
    bossObjectiveStatusText: string,
    bossObjectiveCounts: [number, number, number] | null,
    muted: boolean,
    stored: readonly PowerUpType[],
    autoFire: boolean,
  ): void {
    this.scoreValueText.setText(score.toLocaleString());
    this.highValueText.setText(highScore.toLocaleString());
    this.livesText
      .setText('♥ '.repeat(Math.max(0, lives)).trimEnd() || '✕')
      .setColor(lives === 1 ? '#ff2244' : '#ff5c8a');
    this.timeValueText.setText(timeRemaining < 0 ? '∞' : String(timeRemaining));
    this.powerUpRow.setText(powerUps.length > 0 ? `⚡  ${powerUps.join('   ·   ')}` : '');
    this.objectiveStatusText.setText(bossObjectiveStatusText);
    this.objectiveIcons.forEach((icon, index) => {
      const visible = bossObjectiveCounts !== null;
      icon.setVisible(visible);
      this.objectiveCountTexts[index]
        .setVisible(visible)
        .setText(visible ? String(bossObjectiveCounts[index]) : '');
    });
    this.muteBtn.setText(muted ? '🔇' : '🔊');
    this.autoFireBadge.setVisible(autoFire);

    // Update stored slots
    for (let i = 0; i < 3; i++) {
      const type = stored[i];
      if (type) {
        this.storedSlots[i].setStrokeStyle(1, POWER_UP_TINTS[type], 1);
        this.storedIcons[i].setFillStyle(POWER_UP_TINTS[type], 0.55);
      } else {
        this.storedSlots[i].setStrokeStyle(1, 0x1a3060, 1);
        this.storedIcons[i].setFillStyle(0x0088ff, 0.0);
      }
    }
  }

  setBossHp(fraction: number | null, bossName?: string, bossLevel?: number): void {
    const visible = fraction !== null;
    this.bossBarBg.setVisible(visible);
    this.bossBarFill.setVisible(visible);
    this.bossBarLabel.setVisible(visible);
    if (fraction !== null) {
      this.bossBarFill
        .setDisplaySize(Math.max(2, HUD.BAR_W * fraction), HUD.BAR_H)
        .setFillStyle(fraction > 0.5 ? 0xff3366 : fraction > 0.25 ? 0xff7700 : 0xff1100);
      if (bossName && bossLevel !== undefined) {
        this.bossBarLabel.setText(`— LV.${bossLevel} ${bossName.toUpperCase()} —`);
      }
    }
  }
}

