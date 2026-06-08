import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/Constants';

const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial Black, sans-serif',
  fontSize: '20px',
  color: '#f4f7ff',
  stroke: '#050816',
  strokeThickness: 4,
};

export class HUD extends Phaser.GameObjects.Container {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly highScoreText: Phaser.GameObjects.Text;
  private readonly livesText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly powerUpText: Phaser.GameObjects.Text;
  private readonly muteText: Phaser.GameObjects.Text;
  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossLabel: Phaser.GameObjects.Text;

  private static readonly BOSS_BAR_W = GAME_WIDTH - 40;
  private static readonly BOSS_BAR_H = 14;
  private static readonly BOSS_BAR_Y = 140;

  constructor(scene: Phaser.Scene, onToggleMute: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(20);

    const topBar = scene.add.rectangle(12, 12, GAME_WIDTH - 24, 112, 0x0a1326, 0.72).setOrigin(0).setStrokeStyle(2, 0x1e2d50, 0.9);
    this.scoreText = scene.add.text(24, 24, 'Score: 0', textStyle);
    this.highScoreText = scene.add.text(24, 52, 'High: 0', textStyle);
    this.livesText = scene.add.text(250, 24, 'Lives: 3', textStyle);
    this.timeText = scene.add.text(250, 52, 'Time: 60', textStyle);
    this.powerUpText = scene.add.text(24, 86, 'Power-Ups: None', { ...textStyle, fontSize: '15px' });
    this.muteText = scene.add.text(GAME_WIDTH - 24, 24, '🔊', { ...textStyle, fontSize: '26px' }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.muteText.on('pointerdown', onToggleMute);

    // Boss health bar (hidden by default)
    this.bossBarBg = scene.add.rectangle(20, HUD.BOSS_BAR_Y, HUD.BOSS_BAR_W, HUD.BOSS_BAR_H, 0x330011).setOrigin(0).setVisible(false);
    this.bossBarFill = scene.add.rectangle(20, HUD.BOSS_BAR_Y, HUD.BOSS_BAR_W, HUD.BOSS_BAR_H, 0xff3366).setOrigin(0).setVisible(false);
    this.bossLabel = scene.add.text(GAME_WIDTH / 2, HUD.BOSS_BAR_Y - 16, 'BOSS', {
      ...textStyle, fontSize: '13px', color: '#ff88aa',
    }).setOrigin(0.5, 0).setVisible(false);

    this.add([topBar, this.scoreText, this.highScoreText, this.livesText, this.timeText, this.powerUpText, this.muteText, this.bossBarBg, this.bossBarFill, this.bossLabel]);
  }

  sync(score: number, highScore: number, lives: number, timeRemaining: number, powerUps: string[], muted: boolean): void {
    this.scoreText.setText(`Score: ${score}`);
    this.highScoreText.setText(`High: ${highScore}`);
    this.livesText.setText(`Lives: ${lives}`);
    this.timeText.setText(timeRemaining < 0 ? 'Time: ∞' : `Time: ${timeRemaining}`);
    this.powerUpText.setText(`Power-Ups: ${powerUps.length > 0 ? powerUps.join(' • ') : 'None'}`);
    this.muteText.setText(muted ? '🔇' : '🔊');
  }

  setBossHp(fraction: number | null): void {
    const visible = fraction !== null;
    this.bossBarBg.setVisible(visible);
    this.bossBarFill.setVisible(visible);
    this.bossLabel.setVisible(visible);
    if (fraction !== null) {
      this.bossBarFill.setDisplaySize(
        Math.max(0, HUD.BOSS_BAR_W * fraction),
        HUD.BOSS_BAR_H,
      );
      this.bossBarFill.setFillStyle(fraction > 0.5 ? 0xff3366 : 0xff8800);
    }
  }
}
