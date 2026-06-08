import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';

export class EnemyBullet extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, 'enemy-bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
  }

  fire(x: number, y: number, velocityX: number, velocityY: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
    this.setActive(true).setVisible(true);
    this.setVelocity(velocityX, velocityY);
  }

  deactivate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setActive(false).setVisible(false);
    body.stop();
    body.enable = false;
  }

  preUpdate(_time: number, _delta: number): void {
    if (!this.active) return;
    if (this.y > GAME_HEIGHT + 24 || this.x < -24 || this.x > GAME_WIDTH + 24) {
      this.deactivate();
    }
  }
}
