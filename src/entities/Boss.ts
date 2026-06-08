import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/Constants';

export const BOSS_MAX_HP = 60;
const BOSS_TINT = 0xff3366;

export class Boss extends Phaser.Physics.Arcade.Sprite {
  private hp = BOSS_MAX_HP;
  private phase: 1 | 2 = 1;
  private lateralDir = 1;
  private lateralSpeed = 90;
  private fireTimerMs = 0;
  private fireIntervalMs = 1_400;

  constructor(scene: Phaser.Scene) {
    super(scene, GAME_WIDTH / 2, -80, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.setScale(2.2).setTint(BOSS_TINT).setDepth(4);
  }

  update(deltaMs: number, onFire: (x: number, y: number) => void): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Sweep side-to-side
    this.x += this.lateralDir * this.lateralSpeed * (deltaMs / 1000);
    if (this.x > GAME_WIDTH - 52 || this.x < 52) {
      this.lateralDir *= -1;
    }

    // Patrol vertically between y=90 and y=160
    body.setVelocityY(this.phase === 2 ? 30 * Math.sin(this.scene.time.now / 600) : 0);

    // Fire rhythm
    this.fireTimerMs -= deltaMs;
    if (this.fireTimerMs <= 0) {
      this.fireTimerMs = this.fireIntervalMs;
      onFire(this.x, this.y + 24);
      if (this.phase === 2) {
        onFire(this.x - 28, this.y + 20);
        onFire(this.x + 28, this.y + 20);
      }
    }
  }

  damage(amount: number): boolean {
    this.hp -= amount;

    // Enter phase 2 at half health
    if (this.hp <= BOSS_MAX_HP / 2 && this.phase === 1) {
      this.phase = 2;
      this.lateralSpeed = 150;
      this.fireIntervalMs = 800;
      this.setTint(0xff0044);
    }

    if (this.hp <= 0) return true;

    // Flash white on hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active) this.setTint(this.phase === 2 ? 0xff0044 : BOSS_TINT);
    });
    return false;
  }

  getHpFraction(): number {
    return Math.max(0, this.hp / BOSS_MAX_HP);
  }

  isPhase2(): boolean {
    return this.phase === 2;
  }

  getTintColor(): number {
    return BOSS_TINT;
  }
}
