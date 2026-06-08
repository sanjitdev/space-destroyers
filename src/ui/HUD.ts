import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/Constants';

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
  private readonly muteBtn: Phaser.GameObjects.Text;
  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossBarLabel: Phaser.GameObjects.Text;

  private static readonly BAR_W = GAME_WIDTH - 40;
  private static readonly BAR_H = 18;
  private static readonly BAR_Y = 138;
  private static readonly PANEL_H = 128;

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
      fontFamily: FONT, fontSize: '10px', color: '#3a6080', letterSpacing: 3,
    });
    this.scoreValueText = scene.add.text(22, 28, '0', {
      fontFamily: FONT, fontSize: '34px', color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 16, fill: true },
    });
    scene.add.text(22, 80, 'BEST', {
      fontFamily: FONT, fontSize: '10px', color: '#3a6080', letterSpacing: 3,
    });
    this.highValueText = scene.add.text(22, 94, '0', {
      fontFamily: FONT, fontSize: '18px', color: '#7aaccc',
    });

    // ── Right block — Lives + Timer ─────────────────────────────
    this.livesText = scene.add.text(GAME_WIDTH - 22, 14, '♥ ♥ ♥', {
      fontFamily: FONT, fontSize: '16px', color: '#ff5c8a',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff2244', blur: 10, fill: true },
    }).setOrigin(1, 0);

    this.timeValueText = scene.add.text(GAME_WIDTH - 22, 38, '60', {
      fontFamily: FONT, fontSize: '40px', color: '#6cf3ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 18, fill: true },
    }).setOrigin(1, 0);

    scene.add.text(GAME_WIDTH - 22, 92, 'SECONDS', {
      fontFamily: FONT, fontSize: '10px', color: '#3a6080', letterSpacing: 3,
    }).setOrigin(1, 0);

    // ── Mute icon ───────────────────────────────────────────────
    this.muteBtn = scene.add.text(GAME_WIDTH / 2, 10, '🔊', {
      fontFamily: FONT, fontSize: '20px',
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', onToggleMute);

    // ── Power-up strip ──────────────────────────────────────────
    this.powerUpRow = scene.add.text(GAME_WIDTH / 2, 108, '', {
      fontFamily: FONT, fontSize: '11px', color: '#a8d8f0', letterSpacing: 1,
      shadow: { offsetX: 0, offsetY: 0, color: '#57e2e5', blur: 6, fill: true },
    }).setOrigin(0.5, 0);

    // ── Boss HP bar ─────────────────────────────────────────────
    this.bossBarBg = scene.add
      .rectangle(20, HUD.BAR_Y, HUD.BAR_W, HUD.BAR_H, 0x1a000c)
      .setOrigin(0).setStrokeStyle(1, 0x550022, 0.9).setVisible(false);
    this.bossBarFill = scene.add
      .rectangle(20, HUD.BAR_Y, HUD.BAR_W, HUD.BAR_H, 0xff3366)
      .setOrigin(0).setVisible(false);
    this.bossBarLabel = scene.add.text(GAME_WIDTH / 2, HUD.BAR_Y + HUD.BAR_H / 2, '— BOSS —', {
      fontFamily: FONT, fontSize: '11px', color: '#ffbbcc', letterSpacing: 3,
      stroke: '#09101f', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.add([
      panel, accentLine, divider,
      this.scoreValueText, this.highValueText,
      this.livesText, this.timeValueText,
      this.muteBtn, this.powerUpRow,
      this.bossBarBg, this.bossBarFill, this.bossBarLabel,
    ]);
  }

  sync(score: number, highScore: number, lives: number, timeRemaining: number, powerUps: string[], muted: boolean): void {
    this.scoreValueText.setText(score.toLocaleString());
    this.highValueText.setText(highScore.toLocaleString());
    this.livesText
      .setText('♥ '.repeat(Math.max(0, lives)).trimEnd() || '✕')
      .setColor(lives === 1 ? '#ff2244' : '#ff5c8a');
    this.timeValueText.setText(timeRemaining < 0 ? '∞' : String(timeRemaining));
    this.powerUpRow.setText(powerUps.length > 0 ? `⚡  ${powerUps.join('   ·   ')}` : '');
    this.muteBtn.setText(muted ? '🔇' : '🔊');
  }

  setBossHp(fraction: number | null): void {
    const visible = fraction !== null;
    this.bossBarBg.setVisible(visible);
    this.bossBarFill.setVisible(visible);
    this.bossBarLabel.setVisible(visible);
    if (fraction !== null) {
      this.bossBarFill
        .setDisplaySize(Math.max(2, HUD.BAR_W * fraction), HUD.BAR_H)
        .setFillStyle(fraction > 0.5 ? 0xff3366 : fraction > 0.25 ? 0xff7700 : 0xff1100);
    }
  }
}

