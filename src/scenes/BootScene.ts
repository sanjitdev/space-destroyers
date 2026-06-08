import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.setVisible(false);

    graphics.fillStyle(0x040814, 1);
    graphics.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 36; i += 1) {
      graphics.fillStyle(i % 3 === 0 ? 0xaed9ff : 0xffffff, 0.8);
      graphics.fillCircle((i * 13) % 64, (i * 29) % 64, i % 5 === 0 ? 1.4 : 0.8);
    }
    graphics.generateTexture('space-bg', 64, 64);
    graphics.clear();

    // Sparser, dimmer far-layer parallax stars
    graphics.fillStyle(0x000000, 0);
    graphics.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 24; i += 1) {
      graphics.fillStyle(0xaed9ff, 0.35 + (i % 3) * 0.1);
      graphics.fillCircle((i * 31 + 7) % 128, (i * 47 + 13) % 128, 0.7);
    }
    graphics.generateTexture('space-bg-far', 128, 128);
    graphics.clear();

    graphics.fillStyle(0x6cf3ff, 1);
    graphics.fillTriangle(18, 0, 0, 34, 18, 26);
    graphics.fillTriangle(18, 0, 36, 34, 18, 26);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(16, 14, 4, 14);
    graphics.generateTexture('player', 36, 34);
    graphics.clear();

    graphics.fillStyle(0xfff275, 1);
    graphics.fillRect(0, 0, 6, 18);
    graphics.generateTexture('bullet', 6, 18);
    graphics.clear();

    graphics.fillStyle(0xff5c8a, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(7, 6, 3);
    graphics.generateTexture('enemy-small', 20, 20);
    graphics.clear();

    graphics.fillStyle(0xffc857, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(12, 0),
      new Phaser.Math.Vector2(24, 6),
      new Phaser.Math.Vector2(24, 18),
      new Phaser.Math.Vector2(12, 24),
      new Phaser.Math.Vector2(0, 18),
      new Phaser.Math.Vector2(0, 6),
    ], true);
    graphics.generateTexture('enemy-medium', 24, 24);
    graphics.clear();

    graphics.fillStyle(0xb084ff, 1);
    graphics.fillRoundedRect(0, 0, 28, 28, 6);
    graphics.fillStyle(0xffffff, 0.22);
    graphics.fillRoundedRect(5, 4, 18, 7, 4);
    graphics.generateTexture('enemy-heavy', 28, 28);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(12, 0),
      new Phaser.Math.Vector2(24, 12),
      new Phaser.Math.Vector2(12, 24),
      new Phaser.Math.Vector2(0, 12),
    ], true);
    graphics.generateTexture('powerup', 24, 24);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(3, 3, 3);
    graphics.generateTexture('particle', 6, 6);
    graphics.clear();

    // Enemy bullet — small red teardrop
    graphics.fillStyle(0xff4444, 1);
    graphics.fillRect(1, 0, 6, 14);
    graphics.fillStyle(0xff8888, 0.8);
    graphics.fillRect(2, 0, 4, 6);
    graphics.generateTexture('enemy-bullet', 8, 14);
    graphics.clear();

    // Boss — large menacing skull-ish shape
    graphics.fillStyle(0xff3366, 1);
    graphics.fillRoundedRect(2, 8, 60, 44, 8);
    graphics.fillTriangle(10, 8, 18, 0, 26, 8);
    graphics.fillTriangle(36, 8, 44, 0, 52, 8);
    graphics.fillStyle(0x0a0018, 1);
    graphics.fillEllipse(17, 28, 16, 16);
    graphics.fillEllipse(47, 28, 16, 16);
    graphics.fillStyle(0xff88aa, 0.9);
    graphics.fillEllipse(17, 26, 8, 8);
    graphics.fillEllipse(47, 26, 8, 8);
    graphics.fillStyle(0xff3366, 0.7);
    graphics.fillRect(12, 44, 40, 5);
    graphics.fillStyle(0x0a0018, 1);
    graphics.fillRect(20, 44, 6, 5);
    graphics.fillRect(36, 44, 6, 5);
    graphics.generateTexture('boss', 64, 52);
    graphics.clear();

    // ── Viper — slender, fast (orange-red, 1.2× speed) ────────────
    graphics.fillStyle(0xff6030, 1);
    graphics.fillTriangle(18, 0, 6, 36, 30, 36);
    graphics.fillStyle(0xffaa44, 1);
    graphics.fillRect(17, 8, 2, 22);
    graphics.generateTexture('ship-viper', 36, 36);
    graphics.clear();

    // ── Nova — wide hull, rapid fire (cyan, 0.65× cooldown) ───────
    graphics.fillStyle(0x18c8ff, 1);
    graphics.fillTriangle(18, 0, 0, 34, 36, 34);
    graphics.fillStyle(0x0a3050, 1);
    graphics.fillRect(0, 28, 12, 8);
    graphics.fillRect(24, 28, 12, 8);
    graphics.fillStyle(0xffffff, 0.65);
    graphics.fillEllipse(18, 14, 10, 7);
    graphics.generateTexture('ship-nova', 36, 36);
    graphics.clear();

    // ── Phantom — stealth kite, agile (purple, 0.8× cooldown) ─────
    graphics.fillStyle(0xaa60ff, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(18, 0),
      new Phaser.Math.Vector2(36, 18),
      new Phaser.Math.Vector2(28, 36),
      new Phaser.Math.Vector2(8, 36),
      new Phaser.Math.Vector2(0, 18),
    ], true);
    graphics.fillStyle(0xddaaff, 0.55);
    graphics.fillRect(16, 10, 4, 16);
    graphics.generateTexture('ship-phantom', 36, 36);
    graphics.clear();

    // ── Titan — heavy bruiser (gold, 0.55× cooldown) ──────────────
    graphics.fillStyle(0xffcc22, 1);
    graphics.fillTriangle(18, 0, 8, 12, 28, 12);
    graphics.fillRect(6, 10, 24, 26);
    graphics.fillRect(0, 16, 8, 20);
    graphics.fillRect(28, 16, 8, 20);
    graphics.fillStyle(0xff9900, 1);
    graphics.fillRect(0, 16, 2, 20);
    graphics.fillRect(34, 16, 2, 20);
    graphics.fillStyle(0x0a2040, 0.65);
    graphics.fillRect(14, 12, 8, 12);
    graphics.generateTexture('ship-titan', 36, 36);
    graphics.destroy();

    this.scene.start('MenuScene');
  }
}
