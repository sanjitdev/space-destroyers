import Phaser from 'phaser';
import { type BossLevelConfig, type BossSpecialAbility, GAME_WIDTH } from '../utils/Constants';

export type BossTelegraphPattern = 'aimed' | 'fan' | 'volley';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  private hp: number;
  private phase: 1 | 2 = 1;
  private lateralDir = 1;
  private lateralSpeed: number;
  private fireTimerMs: number;
  private fireIntervalMs: number;
  private telegraphLeadMs = 260;
  private telegraphTriggered = false;
  private specialTimerMs: number;
  private teleportCooldownMs = 4_000;
  private justEnteredPhase2 = false;
  private readonly cfg: BossLevelConfig;
  private readonly glow: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, config: BossLevelConfig) {
    super(scene, GAME_WIDTH / 2, -80, config.texture);
    this.cfg = config;
    this.hp = config.maxHp;
    this.lateralSpeed = config.lateralSpeed;
    this.fireIntervalMs = config.fireIntervalMs;
    this.fireTimerMs = config.fireIntervalMs;
    this.specialTimerMs = Boss.periodicInterval(config.specialAbility);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.setScale(2.0).setDepth(4);
    if (config.bodyTint !== null) this.setTint(config.bodyTint);

    this.glow = scene.add.sprite(this.x, this.y, config.texture)
      .setScale(2.35).setAlpha(0.30)
      .setTint(config.glowTint).setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: this.glow,
      scaleX: 2.65, scaleY: 2.65,
      alpha: 0.12,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private static periodicInterval(ability: BossSpecialAbility): number {
    switch (ability) {
      case 'emp_pulse': return 8_000;
      case 'omega':     return 6_000;
      default:          return 0;
    }
  }

  update(
    deltaMs: number,
    playerX: number,
    playerY: number,
    onFire: (x: number, y: number, vx: number, vy: number) => void,
    onSpecial: (ability: BossSpecialAbility) => void,
    onTelegraph: (pattern: BossTelegraphPattern) => void,
  ): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Lateral sweep
    this.x += this.lateralDir * this.lateralSpeed * (deltaMs / 1_000);
    if (this.x > GAME_WIDTH - 80 || this.x < 80) this.lateralDir *= -1;

    // Phase-2 vertical bob (clamped below HUD)
    const bobVy = this.phase === 2 ? 40 * Math.sin(this.scene.time.now / 600) : 0;
    body.setVelocityY(bobVy);
    if (this.y < 200) body.setVelocityY(Math.abs(bobVy));

    // Teleport (Phantom + Omega)
    if (this.cfg.specialAbility === 'teleport' || this.cfg.specialAbility === 'omega') {
      this.teleportCooldownMs -= deltaMs;
      if (this.teleportCooldownMs <= 0) {
        this.teleportCooldownMs = 4_000;
        this.x = Phaser.Math.Between(80, GAME_WIDTH - 80);
      }
    }

    this.glow.setPosition(this.x, this.y);

    // Firing
    this.fireTimerMs -= deltaMs;
    if (!this.telegraphTriggered && this.fireTimerMs <= this.telegraphLeadMs) {
      this.telegraphTriggered = true;
      onTelegraph(this.getTelegraphPattern());
    }
    if (this.fireTimerMs <= 0) {
      this.fireTimerMs = this.fireIntervalMs;
      this.telegraphTriggered = false;
      this.performAttack(playerX, playerY, onFire);
    }

    // Periodic special abilities (EMP, Homing, Omega)
    if (this.specialTimerMs > 0) {
      this.specialTimerMs -= deltaMs;
      if (this.specialTimerMs <= 0) {
        this.specialTimerMs = this.cfg.specialAbility === 'homing'
          ? 6_000
          : Boss.periodicInterval(this.cfg.specialAbility);
        onSpecial(this.cfg.specialAbility);
      }
    }
  }

  /** Returns true exactly once after the boss transitions to phase 2. */
  checkJustEnteredPhase2(): boolean {
    if (this.justEnteredPhase2) {
      this.justEnteredPhase2 = false;
      return true;
    }
    return false;
  }

  getSpecialAbility(): BossSpecialAbility { return this.cfg.specialAbility; }
  getName(): string                        { return this.cfg.name; }
  getLevel(): number                       { return this.cfg.level; }
  getHpFraction(): number                  { return Math.max(0, this.hp / this.cfg.maxHp); }
  isPhase2(): boolean                      { return this.phase === 2; }
  getTintColor(): number                   { return 0xff3300; }

  damage(amount: number): boolean {
    this.hp -= amount;

    if (this.hp <= this.cfg.phase2Hp && this.phase === 1) {
      this.phase = 2;
      this.lateralSpeed = this.cfg.phase2LateralSpeed;
      this.fireIntervalMs = this.cfg.phase2FireIntervalMs;
      this.justEnteredPhase2 = true;
      this.setTint(0xff2200);
      this.glow.setTint(this.cfg.phase2GlowTint);
      // Activate homing timer for Devourer on phase-2 entry
      if (this.cfg.specialAbility === 'homing') {
        this.specialTimerMs = 6_000;
      }
    }

    if (this.hp <= 0) return true;

    // Hit flash
    this.setAlpha(0.12);
    this.glow.setAlpha(0.90);
    this.scene.time.delayedCall(85, () => {
      if (!this.active) return;
      this.setAlpha(1);
    });
    return false;
  }

  preDestroy(): void {
    this.glow.destroy();
  }

  // ── Attack patterns ───────────────────────────────────────────────────────

  private performAttack(
    playerX: number,
    playerY: number,
    onFire: (x: number, y: number, vx: number, vy: number) => void,
  ): void {
    const ability = this.cfg.specialAbility;
    const isAimed = ability === 'aimed' || ability === 'omega';
    const isBulletHell = ability === 'bulletHell' || ability === 'omega';

    if (isAimed) {
      this.fireAimed(playerX, playerY, onFire);
    } else if (isBulletHell && this.phase === 2) {
      this.fireBulletHell(this.cfg.phase2ShotCount, onFire);
    } else {
      this.fireDefault(onFire);
    }
  }

  private fireAimed(
    playerX: number,
    playerY: number,
    onFire: (x: number, y: number, vx: number, vy: number) => void,
  ): void {
    const speed = 280;
    const angle = Phaser.Math.Angle.Between(this.x, this.y + 32, playerX, playerY);
    onFire(this.x, this.y + 32, Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (this.phase === 2) {
      const spread = 0.28;
      onFire(this.x - 36, this.y + 26, Math.cos(angle - spread) * speed, Math.sin(angle - spread) * speed);
      onFire(this.x + 36, this.y + 26, Math.cos(angle + spread) * speed, Math.sin(angle + spread) * speed);
    }
  }

  private fireBulletHell(
    count: number,
    onFire: (x: number, y: number, vx: number, vy: number) => void,
  ): void {
    const speed = 260;
    const half = Math.floor(count / 2);
    for (let i = -half; i <= half; i++) {
      const angle = Phaser.Math.DegToRad(-90 + i * 22);
      onFire(this.x, this.y + 32, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  private fireDefault(
    onFire: (x: number, y: number, vx: number, vy: number) => void,
  ): void {
    onFire(this.x, this.y + 32, 0, 260);
    if (this.phase === 2) {
      const count = this.cfg.phase2ShotCount;
      if (count >= 3) {
        onFire(this.x - 36, this.y + 26, 0, 260);
        onFire(this.x + 36, this.y + 26, 0, 260);
      }
      if (count >= 5) {
        onFire(this.x - 68, this.y + 18, -80, 250);
        onFire(this.x + 68, this.y + 18,  80, 250);
      }
      if (count >= 7) {
        onFire(this.x - 90, this.y + 10, -130, 230);
        onFire(this.x + 90, this.y + 10,  130, 230);
      }
    }
  }

  private getTelegraphPattern(): BossTelegraphPattern {
    const ability = this.cfg.specialAbility;
    if (ability === 'aimed' || ability === 'omega') {
      return 'aimed';
    }
    if (ability === 'bulletHell' && this.phase === 2) {
      return 'fan';
    }
    return 'volley';
  }
}
