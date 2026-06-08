import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';
import { AudioManager } from '../managers/AudioManager';
import { BossManager } from '../managers/BossManager';
import { ComboManager } from '../managers/ComboManager';
import { DifficultyManager } from '../managers/DifficultyManager';
import { EnemySpawnManager } from '../managers/EnemySpawnManager';
import { PowerUpManager } from '../managers/PowerUpManager';
import { ScoreManager } from '../managers/ScoreManager';
import { StatsManager } from '../managers/StatsManager';
import { TimerManager } from '../managers/TimerManager';
import { FloatingText } from '../ui/FloatingText';
import { HUD } from '../ui/HUD';
import { GAME_HEIGHT, GAME_WIDTH, POWER_UP_LABELS, SHIP_CONFIGS, THEMES, type BossSpecialAbility, type EnemyType, type GameMode } from '../utils/Constants';
import { Storage } from '../utils/Storage';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private bossGroup!: Phaser.Physics.Arcade.Group;
  private hud!: HUD;
  private scoreManager!: ScoreManager;
  private timerManager!: TimerManager;
  private difficultyManager!: DifficultyManager;
  private powerUpManager!: PowerUpManager;
  private enemySpawnManager!: EnemySpawnManager;
  private audioManager!: AudioManager;
  private comboManager!: ComboManager;
  private bossManager!: BossManager;
  private statsManager!: StatsManager;
  private backgroundNebula!: Phaser.GameObjects.TileSprite;
  private background!: Phaser.GameObjects.TileSprite;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private comboText!: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey?: Phaser.Input.Keyboard.Key;
  private usePowerUpKey?: Phaser.Input.Keyboard.Key;
  private homingBullets: EnemyBullet[] = [];
  private movePointerId: number | null = null;
  private firePointerId: number | null = null;
  private touchMoveX: number | null = null;
  private shootHeld = false;
  private gameFinished = false;
  private levelTransition = false;
  private mode: GameMode = 'timed';
  private themeBulletTint = 0xffffff;

  constructor() {
    super('GameScene');
  }

  create(data?: { mode?: GameMode }): void {
    this.gameFinished = false;
    this.movePointerId = null;
    this.firePointerId = null;
    this.touchMoveX = null;
    this.shootHeld = false;
    this.mode = data?.mode ?? 'timed';
    const theme = THEMES[Storage.getTheme()];
    this.themeBulletTint = theme.bulletTint;

    // Parallax backgrounds — three layers; nebula deepest, near stars shallowest
    this.backgroundNebula = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-nebula').setOrigin(0).setDepth(-3);
    this.backgroundFar = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg-far').setOrigin(0).setAlpha(0.70).setDepth(-2);
    this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint).setAlpha(0.85).setDepth(-1);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.input.addPointer(2);

    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 60, runChildUpdate: true });
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: EnemyBullet, maxSize: 40, runChildUpdate: true });
    this.powerUps = this.physics.add.group({ classType: PowerUp, maxSize: 16, runChildUpdate: true });
    this.bossGroup = this.physics.add.group();

    const ship = SHIP_CONFIGS[Storage.getSelectedShipIndex()];
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 72, ship);
    this.scoreManager = new ScoreManager();
    this.timerManager = new TimerManager(undefined, this.mode === 'infinite');
    this.difficultyManager = new DifficultyManager();
    this.powerUpManager = new PowerUpManager();
    this.enemySpawnManager = new EnemySpawnManager(this, this.enemies, this.difficultyManager);
    this.audioManager = new AudioManager(this);
    this.comboManager = new ComboManager();
    this.bossManager = new BossManager(this);
    this.statsManager = new StatsManager();
    this.hud = new HUD(this, () => this.toggleMute());

    // Combo counter — anchored in the HUD header, above all other HUD elements
    this.comboText = this.add.text(GAME_WIDTH / 2, 66, '', {
      color: '#ffe050',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      stroke: '#09101f',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(25).setAlpha(0).setScrollFactor(0);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.fireKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.usePowerUpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', () => this.toggleMute());
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F).on('down', () => {
      this.player.toggleAutoFire();
      this.syncHud();
    });

    this.createTouchControls();
    this.createCollisions();
    this.syncHud();
  }

  update(_time: number, delta: number): void {
    if (this.gameFinished) {
      return;
    }

    const frameDelta = Math.min(delta, 50);

    this.backgroundNebula.tilePositionY -= 0.07;
    this.backgroundFar.tilePositionY -= 0.35;
    this.background.tilePositionY -= 0.9;

    if (this.levelTransition) return;

    this.audioManager.update(frameDelta);
    this.timerManager.update(frameDelta);
    this.powerUpManager.update(frameDelta);
    this.comboManager.update(frameDelta);
    this.difficultyManager.update(this.timerManager.getElapsedMs());
    this.enemySpawnManager.update(frameDelta);

    // Boss spawn check — kill-based
    if (this.bossManager.checkSpawn(this.statsManager.getEnemiesKilled())) {
      const spawnedBoss = this.bossManager.getBoss();
      if (spawnedBoss) this.bossGroup.add(spawnedBoss);
      this.showBossWarning(
        this.bossManager.getActiveBossName(),
        this.bossManager.getActiveBossLevel(),
      );
    }
    const boss = this.bossManager.getBoss();
    if (boss?.active) {
      boss.update(
        frameDelta,
        this.player.x, this.player.y,
        (x, y, vx, vy) => this.spawnEnemyBullet(x, y, vx, vy),
        (ability) => this.handleBossSpecial(ability),
      );
      if (boss.checkJustEnteredPhase2()) this.handleBossPhase2Transition(boss);
      this.hud.setBossHp(boss.getHpFraction(), boss.getName(), boss.getLevel());
    } else {
      this.hud.setBossHp(null);
    }

    // E key — use stored power-up
    if (Phaser.Input.Keyboard.JustDown(this.usePowerUpKey!)) {
      this.useStoredPowerUp();
    }

    // Steer homing bullets toward player
    this.updateHomingBullets(frameDelta);

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

    // Enemy shooting — medium/heavy fire back periodically
    this.updateEnemyShooting(frameDelta);

    this.syncHud();
    this.updateComboDisplay();

    if (this.timerManager.isComplete()) {
      this.finishGame('time');
    }
  }

  shutdown(): void {
    this.audioManager.destroy();
  }

  private createCollisions(): void {
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => {
      const bullet = bulletObject as Bullet;
      const enemy = enemyObject as Enemy;
      if (!bullet.active || !enemy.active) return;

      bullet.deactivate();
      const destroyed = enemy.damage(1);
      if (destroyed) {
        this.destroyEnemy(enemy);
      }
    });

    // Player bullets vs boss
    this.physics.add.overlap(this.bullets, this.bossGroup, (bulletObject, bossObject) => {
      const bullet = bulletObject as Bullet;
      const boss = bossObject as Boss;
      if (!bullet.active || !boss?.active) return;

      bullet.deactivate();
      const destroyed = boss.damage(1);
      if (destroyed) {
        this.destroyBoss(boss);
      }
    });

    // Enemy bullets vs player
    this.physics.add.overlap(this.enemyBullets, this.player, (_playerObj, bulletObj) => {
      const eb = bulletObj as EnemyBullet;
      if (!eb.active) return;
      eb.deactivate();
      this.handlePlayerDamage();
    });

    this.physics.add.overlap(this.player, this.enemies, (_playerObject, enemyObject) => {
      const enemy = enemyObject as Enemy;
      if (!enemy.active) return;

      enemy.destroy();
      this.createExplosion(enemy.x, enemy.y, enemy.getTintColor());
      this.handlePlayerDamage();
    });

    this.physics.add.overlap(this.player, this.powerUps, (_playerObject, powerUpObject) => {
      const powerUp = powerUpObject as PowerUp;
      if (!powerUp.active) return;

      powerUp.collect();
      const type = powerUp.getPowerUpType();
      const bossActive = !!this.bossManager.getBoss()?.active;

      if (type === 'laser') {
        // Laser always fires immediately
        this.fireLaserBlast();
      } else if (type === 'extraLife') {
        const gained = this.player.addLife();
        new FloatingText(this, this.player.x, this.player.y - 40, gained ? '+1 LIFE ♥' : 'MAX LIVES!', '#ff5c8a');
      } else if (bossActive && this.powerUpManager.hasStoredSlot()) {
        // During boss fight — bank the power-up for strategic use
        this.powerUpManager.tryStore(type);
        new FloatingText(this, this.player.x, this.player.y - 40, `STORED: ${POWER_UP_LABELS[type]}`, '#ffe050');
      } else {
        this.powerUpManager.activate(type);
        new FloatingText(this, this.player.x, this.player.y - 40, POWER_UP_LABELS[type], '#f5f7a6');
      }
      this.audioManager.playPowerUp();
      this.syncHud();
    });
  }

  private handlePlayerDamage(): void {
    const damaged = this.player.takeDamage(this.powerUpManager.isActive('shield'));
    if (damaged) {
      this.comboManager.onDamage();
      this.statsManager.recordDamage();
      this.audioManager.playDamage();
      this.cameras.main.shake(140, 0.006);
      new FloatingText(this, this.player.x, this.player.y - 28, '-1 Life', '#ff8ba7');
    }
    if (this.player.isOutOfLives()) {
      this.finishGame('death');
    }
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
    return this.player.canFire() && (keyboardFiring || this.shootHeld || this.player.isAutoFireEnabled());
  }

  private fireVolley(): void {
    const rapidFire = this.powerUpManager.isActive('rapidFire');
    const tripleShot = this.powerUpManager.isActive('tripleShot');

    this.spawnBullet(this.player.x, this.player.y - 24, 0);
    if (tripleShot) {
      this.spawnBullet(this.player.x - 10, this.player.y - 18, -170);
      this.spawnBullet(this.player.x + 10, this.player.y - 18, 170);
    }

    this.statsManager.recordShot();
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
    bullet.setTint(this.themeBulletTint);
  }

  private destroyEnemy(enemy: Enemy): void {
    this.comboManager.onKill();
    this.statsManager.recordKill();
    this.statsManager.recordCombo(this.comboManager.streak);

    const awarded = this.scoreManager.add(
      enemy.getPoints(),
      this.powerUpManager.isActive('scoreMultiplier'),
      this.comboManager.multiplier,
    );
    const x = enemy.x;
    const y = enemy.y;
    const tint = enemy.getTintColor();

    this.createExplosion(x, y, tint);
    this.audioManager.playExplosion();
    this.cameras.main.shake(90, 0.003);

    const label = this.comboManager.multiplier > 1 ? `+${awarded} ×${this.comboManager.multiplier}` : `+${awarded}`;
    new FloatingText(this, x, y, label, '#ffffff');

    enemy.destroy();

    if (this.powerUpManager.shouldDrop()) {
      this.spawnPowerUp(x, y);
    }

    // Announce new combo tiers
    const crossed = this.comboManager.crossedThreshold();
    if (crossed !== null) {
      new FloatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, `${crossed}× COMBO!`, '#ffe050');
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

  private destroyBoss(boss: Boss): void {
    const bossLevel = boss.getLevel();
    const awarded = this.scoreManager.add(500, this.powerUpManager.isActive('scoreMultiplier'), this.comboManager.multiplier);
    this.comboManager.onKill();
    this.statsManager.recordBossKill();
    this.statsManager.recordKill();
    this.createExplosion(boss.x, boss.y - 10, 0xff3366);
    this.createExplosion(boss.x - 20, boss.y + 10, 0xff8888);
    this.createExplosion(boss.x + 20, boss.y + 10, 0xffffff);
    this.cameras.main.shake(500, 0.022);
    this.cameras.main.flash(250, 255, 80, 80, false);
    new FloatingText(this, boss.x, boss.y, `BOSS DOWN! +${awarded}`, '#ff88aa');
    this.bossGroup.remove(boss, false, false);
    this.bossManager.destroyBoss();
    this.hud.setBossHp(null);
    this.startLevelTransition(bossLevel);
  }

  private startLevelTransition(bossLevel: number): void {
    this.levelTransition = true;

    // Wipe the battlefield
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.bullets.clear(true, true);
    this.powerUps.clear(true, true);
    this.homingBullets = [];

    // Freeze the player physics body so the tween can move it off-screen freely
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `LEVEL ${bossLevel} CLEAR!`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '42px',
      color: '#ffe050',
      stroke: '#09101f',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 28, fill: true },
    }).setOrigin(0.5).setDepth(30).setAlpha(0).setScrollFactor(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      duration: 400,
      ease: 'Back.easeOut',
    });

    // After a short beat, fly the ship upward off-screen
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: this.player,
        y: -120,
        duration: 650,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.tweens.add({ targets: banner, alpha: 0, duration: 300 });

          // Reposition below the screen, then fly back in
          this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT + 100);

          this.time.delayedCall(350, () => {
            body.reset(GAME_WIDTH / 2, GAME_HEIGHT + 100);
            this.tweens.add({
              targets: this.player,
              y: GAME_HEIGHT - 72,
              duration: 650,
              ease: 'Cubic.easeOut',
              onComplete: () => {                body.enable = true;                banner.destroy();
                this.levelTransition = false;
              },
            });
          });
        },
      });
    });
  }

  private spawnEnemyBullet(x: number, y: number, velocityX: number, velocityY: number): void {
    let eb = this.enemyBullets.get(x, y) as EnemyBullet | null;
    if (!eb) {
      eb = new EnemyBullet(this, x, y);
      this.enemyBullets.add(eb);
    }
    eb.fire(x, y, velocityX, velocityY);
  }

  private updateEnemyShooting(frameDelta: number): void {
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (enemy.active) {
        enemy.updateShootTimer(frameDelta, (x, y) => this.spawnEnemyBullet(x, y, 0, 300));
      }
    }
  }

  private updateComboDisplay(): void {
    const streak = this.comboManager.streak;
    if (streak >= 3) {
      this.comboText
        .setText(`×${this.comboManager.multiplier} COMBO (${streak})`)
        .setAlpha(1);
    } else {
      this.comboText.setAlpha(0);
    }
  }

  private useStoredPowerUp(): void {
    const type = this.powerUpManager.useStored();
    if (!type) return;
    if (type === 'laser') {
      this.fireLaserBlast();
    }
    this.audioManager.playPowerUp();
    new FloatingText(this, this.player.x, this.player.y - 40, `USED: ${POWER_UP_LABELS[type]}`, '#7cff6b');
    this.syncHud();
  }

  private handleBossSpecial(ability: BossSpecialAbility): void {
    switch (ability) {
      case 'emp_pulse': {
        this.powerUpManager.clearActive();
        new FloatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '⚡ EMP PULSE!', '#44ddff');
        this.cameras.main.flash(150, 0, 180, 255, false);
        break;
      }
      case 'homing':
      case 'omega': {
        const boss = this.bossManager.getBoss();
        if (boss) this.spawnHomingBullet(boss.x, boss.y + 36);
        break;
      }
    }
  }

  private handleBossPhase2Transition(boss: Boss): void {
    new FloatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '⚠ RAGE MODE ⚠', '#ff8844');
    this.cameras.main.shake(200, 0.012);

    const speedMul = this.difficultyManager.getEnemySpeedMultiplier();
    switch (boss.getSpecialAbility()) {
      case 'drone_spawn':
        this.spawnEnemyAt(boss.x - 60, boss.y + 20, 'small', speedMul);
        this.spawnEnemyAt(boss.x + 60, boss.y + 20, 'small', speedMul);
        break;
      case 'meteor_shower':
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 250, () => {
            this.spawnEnemyAt(Phaser.Math.Between(40, GAME_WIDTH - 40), boss.y - 20, 'small', speedMul);
          });
        }
        break;
      case 'summon':
        this.spawnEnemyAt(boss.x - 90, boss.y + 60, 'medium', speedMul);
        this.spawnEnemyAt(boss.x + 90, boss.y + 60, 'medium', speedMul);
        break;
    }
  }

  private spawnEnemyAt(x: number, y: number, type: EnemyType, speedMul: number): void {
    const enemy = new Enemy(this, x, y, type, speedMul);
    this.enemies.add(enemy);
  }

  private spawnHomingBullet(x: number, y: number): void {
    let hb = this.enemyBullets.get(x, y) as EnemyBullet | null;
    if (!hb) {
      hb = new EnemyBullet(this, x, y);
      this.enemyBullets.add(hb);
    }
    hb.fire(x, y, 0, 120);
    hb.setTint(0xff00ff);
    this.homingBullets.push(hb);
  }

  private updateHomingBullets(deltaMs: number): void {
    this.homingBullets = this.homingBullets.filter(hb => hb.active);
    for (const hb of this.homingBullets) {
      const body = hb.body as Phaser.Physics.Arcade.Body;
      const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
      const targetAngle = Phaser.Math.Angle.Between(hb.x, hb.y, this.player.x, this.player.y);
      const newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, 0.055 * deltaMs);
      const speed = 160;
      body.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
    }
  }

  private showBossWarning(name = 'BOSS', level = 1): void {
    const warn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `⚠ LV.${level} ${name.toUpperCase()} ⚠`, {
      color: '#ff3366',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      stroke: '#09101f',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    this.tweens.add({
      targets: warn,
      alpha: { from: 0, to: 1 },
      yoyo: true,
      repeat: 3,
      duration: 300,
      onComplete: () => warn.destroy(),
    });
  }

  private fireLaserBlast(): void {
    const beamX = this.player.x;
    const beamWidth = 44;
    const totalHeight = this.player.y + 32;
    const travelDuration = 600;

    // Three layers: wide glow → solid beam → bright core
    const glow = this.add
      .rectangle(beamX, this.player.y, beamWidth * 2.8, totalHeight, 0x88ccff, 0.28)
      .setDepth(14).setBlendMode(Phaser.BlendModes.ADD).setOrigin(0.5, 1).setScale(1, 0);
    const beam = this.add
      .rectangle(beamX, this.player.y, beamWidth, totalHeight, 0xffffff, 0.92)
      .setDepth(15).setBlendMode(Phaser.BlendModes.ADD).setOrigin(0.5, 1).setScale(1, 0);
    const core = this.add
      .rectangle(beamX, this.player.y, beamWidth * 0.38, totalHeight, 0xddfffe, 1)
      .setDepth(16).setBlendMode(Phaser.BlendModes.ADD).setOrigin(0.5, 1).setScale(1, 0);

    this.audioManager.playLaser();
    this.cameras.main.shake(300, 0.009);
    this.cameras.main.flash(80, 180, 220, 255, false);

    const hitEnemies = new Set<Enemy>();

    this.tweens.add({
      targets: [glow, beam, core],
      scaleY: 1,
      duration: travelDuration,
      ease: 'Sine.easeIn',
      onUpdate: () => {
        // Current top edge of the beam as it sweeps upward
        const beamTop = this.player.y - totalHeight * beam.scaleY;
        for (const child of this.enemies.getChildren()) {
          const enemy = child as Enemy;
          if (!enemy.active || hitEnemies.has(enemy)) continue;
          if (enemy.y >= beamTop && Math.abs(enemy.x - beamX) < beamWidth + 14) {
            hitEnemies.add(enemy);
            const awarded = this.scoreManager.add(
              enemy.getPoints(),
              this.powerUpManager.isActive('scoreMultiplier'),
              this.comboManager.multiplier,
            );
            this.comboManager.onKill();
            this.statsManager.recordKill();
            this.createExplosion(enemy.x, enemy.y, enemy.getTintColor());
            new FloatingText(this, enemy.x, enemy.y, `+${awarded}`, '#ffffff');
            enemy.destroy();
          }
        }
      },
      onComplete: () => {
        this.cameras.main.shake(200, 0.013);
        this.tweens.add({
          targets: [glow, beam, core],
          alpha: 0,
          scaleX: 3,
          duration: 320,
          ease: 'Cubic.easeOut',
          onComplete: () => { glow.destroy(); beam.destroy(); core.destroy(); },
        });
      },
    });
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
      this.powerUpManager.getStored(),
      this.player.isAutoFireEnabled(),
    );
  }

  private finishGame(reason: 'time' | 'death' = 'death'): void {
    if (this.gameFinished) return;

    this.gameFinished = true;
    this.audioManager.destroy();
    const summary = this.statsManager.getSummary();
    const grade = this.statsManager.computeGrade(this.scoreManager.getScore());
    this.scene.start('GameOverScene', {
      score: this.scoreManager.getScore(),
      highScore: this.scoreManager.getHighScore(),
      mode: this.mode,
      reason,
      grade,
      summary,
    });
  }
}
