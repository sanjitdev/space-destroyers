import Phaser from 'phaser';
import { POWER_UP_SPEED, POWER_UP_TINTS, type PowerUpType } from '../utils/Constants';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType = 'rapidFire';

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, 'powerup-rapidFire');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
  }

  configure(type: PowerUpType, x: number, y: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.powerUpType = type;
    body.enable = true;
    body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setTexture(`powerup-${type}`);
    this.setTint(POWER_UP_TINTS[type]);
    this.setAngle(0);
    this.setVelocity(0, POWER_UP_SPEED);
  }

  getPowerUpType(): PowerUpType {
    return this.powerUpType;
  }

  collect(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setActive(false);
    this.setVisible(false);
    body.stop();
    body.enable = false;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.active) {
      return;
    }

    this.angle += 3;
    if (this.y > this.scene.scale.height + 32) {
      this.collect();
    }
  }
}
