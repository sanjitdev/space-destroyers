import Phaser from 'phaser';
import { BULLET_SPEED, GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';

export class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
  }

  fire(x: number, y: number, velocityX = 0): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocity(velocityX, BULLET_SPEED);
  }

  deactivate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setActive(false);
    this.setVisible(false);
    body.stop();
    body.enable = false;
  }

  preUpdate(_time: number, _delta: number): void {
    if (!this.active) {
      return;
    }

    if (this.y < -24 || this.x < -24 || this.x > GAME_WIDTH + 24 || this.y > GAME_HEIGHT + 24) {
      this.deactivate();
    }
  }
}
