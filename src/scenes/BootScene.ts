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
    graphics.destroy();

    this.scene.start('MenuScene');
  }
}
