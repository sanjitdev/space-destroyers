import Phaser from 'phaser';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';
import { AudioManager } from '../managers/AudioManager';
import { DifficultyManager } from '../managers/DifficultyManager';
import { EnemySpawnManager } from '../managers/EnemySpawnManager';
import { PowerUpManager } from '../managers/PowerUpManager';
import { ScoreManager } from '../managers/ScoreManager';
import { TimerManager } from '../managers/TimerManager';
import { FloatingText } from '../ui/FloatingText';
import { HUD } from '../ui/HUD';
import { GAME_HEIGHT, GAME_WIDTH, POWER_UP_LABELS } from '../utils/Constants';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private hud!: HUD;
  private scoreManager!: ScoreManager;
  private timerManager!: TimerManager;
  private difficultyManager!: DifficultyManager;
  private powerUpManager!: PowerUpManager;
  private enemySpawnManager!: EnemySpawnManager;
  private audioManager!: AudioManager;
  private background!: Phaser.GameObjects.TileSprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey?: Phaser.Input.Keyboard.Key;
  private movePointerId: number | null = null;
  private firePointerId: number | null = null;
  private touchMoveX: number | null = null;
  private shootHeld = false;
  private gameFinished = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(0x78a6ff);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.input.addPointer(2);

    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 60, runChildUpdate: true });
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.powerUps = this.physics.add.group({ classType: PowerUp, maxSize: 16, runChildUpdate: true });

    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 72);
    this.scoreManager = new ScoreManager();
    this.timerManager = new TimerManager();
    this.difficultyManager = new DifficultyManager();
    this.powerUpManager = new PowerUpManager();
    this.enemySpawnManager = new EnemySpawnManager(this, this.enemies, this.difficultyManager);
    this.audioManager = new AudioManager(this);
    this.hud = new HUD(this, () => this.toggleMute());

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.fireKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', () => this.toggleMute());

    this.createTouchControls();
    this.createCollisions();
    this.syncHud();
  }

  update(_time: number, delta: number): void {
    if (this.gameFinished) {
      return;
    }

    const frameDelta = Math.min(delta, 50);

    this.background.tilePositionY -= 0.9;
    this.audioManager.update(frameDelta);
    this.timerManager.update(frameDelta);
    this.powerUpManager.update(frameDelta);
    this.difficultyManager.update(this.timerManager.getElapsedMs());
    this.enemySpawnManager.update(frameDelta);

    const horizontalInput = this.getHorizontalInput();
    this.player.update(frameDelta, horizontalInput, this.touchMoveX);
    this.player.setPowerGlow(this.powerUpManager.getActiveTypes());

    const slowFactor = this.powerUpManager.isActive('slowTime') ? 0.5 : 1;
    for (const child of this.enemies.getChildren()) {
      (child as Enemy).applyMovementFactor(slowFactor);
    }

    if (this.shouldFire()) {
      this.fireVolley();
    }

    this.syncHud();

    if (this.timerManager.isComplete()) {
      this.finishGame();
    }
  }

  shutdown(): void {
    this.audioManager.destroy();
  }

  private createCollisions(): void {
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => {
      const bullet = bulletObject as Bullet;
      const enemy = enemyObject as Enemy;
      if (!bullet.active || !enemy.active) {
        return;
      }

      bullet.deactivate();
      const destroyed = enemy.damage(1);
      if (destroyed) {
        this.destroyEnemy(enemy);
      }
    });

    this.physics.add.overlap(this.player, this.enemies, (_playerObject, enemyObject) => {
      const enemy = enemyObject as Enemy;
      if (!enemy.active) {
        return;
      }

      enemy.destroy();
      this.createExplosion(enemy.x, enemy.y, enemy.getTintColor());

      const damaged = this.player.takeDamage(this.powerUpManager.isActive('shield'));
      if (damaged) {
        this.audioManager.playDamage();
        this.cameras.main.shake(140, 0.006);
        new FloatingText(this, this.player.x, this.player.y - 28, '-1 Life', '#ff8ba7');
      }

      if (this.player.isOutOfLives()) {
        this.finishGame();
      }
    });

    this.physics.add.overlap(this.player, this.powerUps, (_playerObject, powerUpObject) => {
      const powerUp = powerUpObject as PowerUp;
      if (!powerUp.active) {
        return;
      }

      powerUp.collect();
      const type = powerUp.getPowerUpType();
      this.powerUpManager.activate(type);
      this.audioManager.playPowerUp();
      new FloatingText(this, this.player.x, this.player.y - 40, POWER_UP_LABELS[type], '#f5f7a6');
      this.syncHud();
    });
  }

  private createTouchControls(): void {
    const fireButton = this.add.circle(GAME_WIDTH - 68, GAME_HEIGHT - 78, 46, 0xff5c8a, 0.28)
      .setStrokeStyle(3, 0xff96b0, 0.85)
      .setScrollFactor(0)
      .setDepth(19);
    this.add.text(fireButton.x, fireButton.y, 'FIRE', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      stroke: '#09101f',
      strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(19);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isFireArea(pointer.x, pointer.y)) {
        this.firePointerId = pointer.id;
        this.shootHeld = true;
        return;
      }

      this.movePointerId = pointer.id;
      this.touchMoveX = Phaser.Math.Clamp(pointer.x, 24, GAME_WIDTH - 24);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.movePointerId && pointer.isDown) {
        this.touchMoveX = Phaser.Math.Clamp(pointer.x, 24, GAME_WIDTH - 24);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id == this.movePointerId) {
        this.movePointerId = null;
        this.touchMoveX = null;
      }
      if (pointer.id == this.firePointerId) {
        this.firePointerId = null;
        this.shootHeld = false;
      }
    });
  }

  private getHorizontalInput(): number {
    if (!this.cursors) {
      return 0;
    }

    if (this.cursors.left.isDown) {
      return -1;
    }
    if (this.cursors.right.isDown) {
      return 1;
    }
    return 0;
  }

  private shouldFire(): boolean {
    const keyboardFiring = Boolean(this.fireKey?.isDown);
    return this.player.canFire() && (keyboardFiring || this.shootHeld);
  }

  private fireVolley(): void {
    const rapidFire = this.powerUpManager.isActive('rapidFire');
    const tripleShot = this.powerUpManager.isActive('tripleShot');

    this.spawnBullet(this.player.x, this.player.y - 24, 0);
    if (tripleShot) {
      this.spawnBullet(this.player.x - 10, this.player.y - 18, -170);
      this.spawnBullet(this.player.x + 10, this.player.y - 18, 170);
    }

    this.player.consumeFireCooldown(rapidFire);
    this.audioManager.playShoot();
  }

  private spawnBullet(x: number, y: number, velocityX: number): void {
    let bullet = this.bullets.get(x, y) as Bullet | null;
    if (!bullet) {
      bullet = new Bullet(this, x, y);
      this.bullets.add(bullet);
    }

    bullet.fire(x, y, velocityX);
  }

  private destroyEnemy(enemy: Enemy): void {
    const awarded = this.scoreManager.add(enemy.getPoints(), this.powerUpManager.isActive('scoreMultiplier'));
    const x = enemy.x;
    const y = enemy.y;
    const tint = enemy.getTintColor();

    this.createExplosion(x, y, tint);
    this.audioManager.playExplosion();
    this.cameras.main.shake(90, 0.003);
    new FloatingText(this, x, y, `+${awarded}`, '#ffffff');

    enemy.destroy();

    if (this.powerUpManager.shouldDrop()) {
      this.spawnPowerUp(x, y);
    }
  }

  private createExplosion(x: number, y: number, tint: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 180 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [tint, 0xffffff],
      lifespan: 320,
      quantity: 12,
      blendMode: 'ADD',
    });

    this.time.delayedCall(350, () => particles.destroy());
  }

  private spawnPowerUp(x: number, y: number): void {
    const type = this.powerUpManager.getRandomType();
    let powerUp = this.powerUps.get(x, y) as PowerUp | null;
    if (!powerUp) {
      powerUp = new PowerUp(this, x, y);
      this.powerUps.add(powerUp);
    }

    powerUp.configure(type, x, y);
  }

  private isFireArea(x: number, y: number): boolean {
    return Phaser.Math.Distance.Between(x, y, GAME_WIDTH - 68, GAME_HEIGHT - 78) <= 54;
  }

  private toggleMute(): void {
    this.audioManager.toggleMute();
    this.syncHud();
  }

  private syncHud(): void {
    this.hud.sync(
      this.scoreManager.getScore(),
      this.scoreManager.getHighScore(),
      this.player.getLives(),
      this.timerManager.getRemainingSeconds(),
      this.powerUpManager.getDisplayItems(),
      this.audioManager.isMuted(),
    );
  }

  private finishGame(): void {
    if (this.gameFinished) {
      return;
    }

    this.gameFinished = true;
    this.audioManager.destroy();
    this.scene.start('GameOverScene', {
      score: this.scoreManager.getScore(),
      highScore: this.scoreManager.getHighScore(),
    });
  }
}
