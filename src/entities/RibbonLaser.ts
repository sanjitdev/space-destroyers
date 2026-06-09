import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { EnemyBullet } from './EnemyBullet';

export class RibbonLaser {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly history: { x: number }[] = [];
  private readonly maxHistory = 28;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics()
      .setDepth(8)
      .setBlendMode(Phaser.BlendModes.ADD);
  }

  update(shipX: number, shipY: number): void {
    this.history.unshift({ x: shipX });
    if (this.history.length > this.maxHistory) this.history.pop();
    this.redraw(shipX, shipY);
  }

  private getRibbonX(atY: number, shipY: number): number {
    if (this.history.length === 0) return 0;
    // t=0 at top of screen, t=1 at ship position
    const t = Phaser.Math.Clamp(atY / shipY, 0, 1);
    const histIdx = Math.floor(t * (this.history.length - 1));
    return this.history[Math.min(histIdx, this.history.length - 1)].x;
  }

  private redraw(shipX: number, shipY: number): void {
    this.graphics.clear();
    if (this.history.length < 2) return;

    const STEPS = 48;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const py = t * shipY;
      const histIdx = Math.floor((1 - t) * (this.history.length - 1));
      const px = this.history[Math.min(histIdx, this.history.length - 1)].x;
      points.push({ x: px, y: py });
    }

    const drawPath = (): void => {
      this.graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.graphics.lineTo(points[i].x, points[i].y);
      }
    };

    // Wide outer glow
    this.graphics.lineStyle(22, 0xff44ff, 0.10);
    this.graphics.beginPath();
    drawPath();
    this.graphics.strokePath();

    // Mid glow
    this.graphics.lineStyle(10, 0xff88ff, 0.32);
    this.graphics.beginPath();
    drawPath();
    this.graphics.strokePath();

    // Inner bright ribbon
    this.graphics.lineStyle(4, 0xffaaff, 0.75);
    this.graphics.beginPath();
    drawPath();
    this.graphics.strokePath();

    // Bright white core
    this.graphics.lineStyle(2, 0xffffff, 0.95);
    this.graphics.beginPath();
    drawPath();
    this.graphics.strokePath();

    // Tip spark at top
    this.graphics.fillStyle(0xffffff, 0.9);
    this.graphics.fillCircle(this.history[this.history.length - 1].x, 2, 4);

    // Base glow at ship
    this.graphics.fillStyle(0xff44ff, 0.6);
    this.graphics.fillCircle(shipX, shipY - 20, 6);
  }

  checkCollisions(
    enemies: Phaser.Physics.Arcade.Group,
    enemyBullets: Phaser.Physics.Arcade.Group,
    shipY: number,
  ): { enemies: Enemy[]; bullets: EnemyBullet[] } {
    const HIT_RADIUS = 16;
    const hitEnemies: Enemy[] = [];
    const hitBullets: EnemyBullet[] = [];

    if (this.history.length < 2) return { enemies: hitEnemies, bullets: hitBullets };

    for (const child of enemies.getChildren()) {
      const e = child as Enemy;
      if (!e.active || e.y >= shipY) continue;
      const rx = this.getRibbonX(e.y, shipY);
      if (Math.abs(e.x - rx) < HIT_RADIUS) hitEnemies.push(e);
    }
    for (const child of enemyBullets.getChildren()) {
      const eb = child as EnemyBullet;
      if (!eb.active || eb.y >= shipY) continue;
      const rx = this.getRibbonX(eb.y, shipY);
      if (Math.abs(eb.x - rx) < HIT_RADIUS) hitBullets.push(eb);
    }
    return { enemies: hitEnemies, bullets: hitBullets };
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
