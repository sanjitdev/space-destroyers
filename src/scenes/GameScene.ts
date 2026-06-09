import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import type { BossTelegraphPattern } from '../entities/Boss';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';
import { RibbonLaser } from '../entities/RibbonLaser';
import { AudioManager } from '../managers/AudioManager';
import { AchievementManager } from '../managers/AchievementManager';
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
import { GAME_HEIGHT, GAME_WIDTH, POWER_UP_LABELS, SHIP_CONFIGS, THEMES, type BossSpecialAbility, type DifficultyId, type EnemyType, type GameMode, type PowerUpType } from '../utils/Constants';
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
  private achievementManager!: AchievementManager;
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
  private touchMoveY: number | null = null;
  private shootHeld = false;
  private gameFinished = false;
  private levelTransition = false;
  private countdownActive = false;
  private paused = false;
  private mode: GameMode = 'timed';
  private difficulty: DifficultyId = 'normal';
  private currentShipLevel = 1;
  private levelElapsedMs = 0;
  private themeBulletTint = 0xffffff;
  private ribbonLaser: RibbonLaser | null = null;

  constructor() {
    super('GameScene');
  }

  create(data?: { mode?: GameMode; difficulty?: DifficultyId }): void {
    this.gameFinished = false;
    this.movePointerId = null;
    this.firePointerId = null;
    this.touchMoveX = null;
    this.touchMoveY = null;
    this.shootHeld = false;
    this.levelElapsedMs = 0;
    this.mode = data?.mode ?? 'timed';
    this.difficulty = data?.difficulty ?? Storage.getDifficulty();
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

    const unlockedShipLevel = Storage.getMaxUnlockedShipLevel();
    const selectedShipIndex = Math.min(Storage.getSelectedShipIndex(), unlockedShipLevel - 1);
    const ship = SHIP_CONFIGS[selectedShipIndex];
    this.currentShipLevel = selectedShipIndex + 1;
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 72, ship);
    this.scoreManager = new ScoreManager();
    this.timerManager = new TimerManager(undefined, this.mode === 'infinite');
    this.difficultyManager = new DifficultyManager(this.difficulty);
    this.powerUpManager = new PowerUpManager();
    this.enemySpawnManager = new EnemySpawnManager(this, this.enemies, this.difficultyManager);
    this.audioManager = new AudioManager(this);
    this.comboManager = new ComboManager();
    this.bossManager = new BossManager(this);
    this.statsManager = new StatsManager();
    this.achievementManager = new AchievementManager(this);
    this.hud = new HUD(this, () => this.toggleMute());

    // Combo counter — anchored in the HUD header, above all other HUD elements
    this.comboText = this.add.text(GAME_WIDTH / 2, 66, '', {
      color: '#ffe050',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      stroke: '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(25).setAlpha(0).setScrollFactor(0);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.fireKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.usePowerUpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.keyboard?.addCapture([Phaser.Input.Keyboard.KeyCodes.ESC]);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', () => this.toggleMute());
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F).on('down', () => {
      this.player.toggleAutoFire();
      this.syncHud();
    });
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => this.togglePause());
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P).on('down', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());

    this.createTouchControls();
    this.createCollisions();
    this.enemySpawnManager.setProgressionLevel(1);
    this.syncHud();
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdownActive = true;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const countTweenDurationMs = 520;
    const countStepDelayMs = 620;
    const countStartDelayMs = 120;

    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setDepth(40);

    const countText = this.add.text(cx, cy, '', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '120px',
      color: '#6cf3ff',
      stroke: '#000014',
      strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 44, fill: true },
    }).setOrigin(0.5).setDepth(41).setAlpha(0);

    const show = (label: string, color: string, onDone: () => void): void => {
      countText.setText(label).setColor(color).setScale(1.4).setAlpha(1);
      this.tweens.add({
        targets: countText,
        scale: 1,
        alpha: 0,
        duration: countTweenDurationMs,
        ease: 'Expo.easeIn',
        onComplete: onDone,
      });
    };

    this.time.delayedCall(countStartDelayMs, () => show('3', '#ff6644', () =>
    this.time.delayedCall(countStepDelayMs, () => show('2', '#ffcc00', () =>
    this.time.delayedCall(countStepDelayMs, () => show('1', '#44ff88', () =>
    this.time.delayedCall(countStepDelayMs, () => {
      show('GO!', '#ffffff', () => {
        overlay.destroy();
        countText.destroy();
        this.showTutorialIfNeeded();
      });
      this.countdownActive = false;
    })))))
    ));
  }

  update(_time: number, delta: number): void {
    if (this.gameFinished || this.paused) {
      return;
    }

    const frameDelta = Math.min(delta, 50);

    this.backgroundNebula.tilePositionY -= 0.07;
    this.backgroundFar.tilePositionY -= 0.35;
    this.background.tilePositionY -= 0.9;

    if (this.levelTransition) return;
    if (this.countdownActive) return;

    this.audioManager.update(frameDelta);
    this.timerManager.update(frameDelta);
    this.powerUpManager.update(frameDelta);
    this.comboManager.update(frameDelta);
    this.scoreManager.addSurvival(frameDelta);
    this.levelElapsedMs += frameDelta;
    this.difficultyManager.update(this.levelElapsedMs);
    this.enemySpawnManager.update(frameDelta);

    // Boss spawn check — kill-based
    if (this.bossManager.checkSpawn()) {
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
        (pattern) => this.showBossAttackTelegraph(pattern, boss.x, boss.y),
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
    const verticalInput = this.getVerticalInput();
    this.player.update(frameDelta, horizontalInput, verticalInput, this.touchMoveX, this.touchMoveY);
    this.player.setPowerGlow(this.powerUpManager.getActiveTypes());

    const slowFactor = this.powerUpManager.isActive('slowTime') ? 0.5 : 1;
    for (const child of this.enemies.getChildren()) {
      (child as Enemy).applyMovementFactor(slowFactor);
    }

    // Magnet shield — destroy nearby enemy bullets each frame
    if (this.powerUpManager.isActive('magnetShield')) {
      for (const child of this.enemyBullets.getChildren()) {
        const eb = child as EnemyBullet;
        if (eb.active && Phaser.Math.Distance.Between(eb.x, eb.y, this.player.x, this.player.y) < 100) {
          eb.deactivate();
        }
      }
    }

    // Ribbon laser — create/update/destroy based on power-up state
    const ribbonActive = this.powerUpManager.isActive('ribbonLaser');
    if (ribbonActive && !this.ribbonLaser) {
      this.ribbonLaser = new RibbonLaser(this);
    } else if (!ribbonActive && this.ribbonLaser) {
      this.ribbonLaser.destroy();
      this.ribbonLaser = null;
    }
    if (this.ribbonLaser) {
      this.ribbonLaser.update(this.player.x, this.player.y);
      const hits = this.ribbonLaser.checkCollisions(this.enemies, this.enemyBullets, this.player.y);
      for (const e of hits.enemies) this.destroyEnemy(e);
      for (const eb of hits.bullets) eb.deactivate();
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

    // Player bullets cancel enemy bullets
    this.physics.add.overlap(this.bullets, this.enemyBullets, (bulletObj, ebObj) => {
      const bullet = bulletObj as Bullet;
      const eb = ebObj as EnemyBullet;
      if (!bullet.active || !eb.active) return;
      bullet.deactivate();
      eb.deactivate();
      this.createSmallBurst(bullet.x, bullet.y);
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
        this.fireLaserBlast();
      } else if (type === 'nuke') {
        this.triggerNuke();
      } else if (type === 'extraLife') {
        const gained = this.player.addLife();
        new FloatingText(this, this.player.x, this.player.y - 40, gained ? '+1 LIFE ♥' : 'MAX LIVES!', '#ff5c8a');
      } else if (bossActive && this.powerUpManager.hasStoredSlot()) {
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
    const hasShield = this.powerUpManager.isActive('shield');
    const hasMagnetShield = this.powerUpManager.isActive('magnetShield');
    const damaged = this.player.takeDamage(hasShield || hasMagnetShield);
    if (!damaged) {
      if (hasShield) {
        const remainingShields = this.powerUpManager.consumeShieldCharge();
        const label = remainingShields > 0
          ? `SHIELD BLOCKED! (${remainingShields})`
          : 'SHIELD BROKEN!';
        new FloatingText(this, this.player.x, this.player.y - 40, label, '#4dd2ff');
        this.syncHud();
        this.cameras.main.flash(80, 0, 160, 255, false);
      }
      return;
    }
    this.comboManager.onDamage();
    this.statsManager.recordDamage();
    this.audioManager.playDamage();
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.flash(120, 255, 0, 0, false);
    new FloatingText(this, this.player.x, this.player.y - 28, '-1 Life', '#ff8ba7');
    // Clear all active power-ups on taking a hit
    this.powerUpManager.clearActive();
    if (this.ribbonLaser) {
      this.ribbonLaser.destroy();
      this.ribbonLaser = null;
    }
    if (this.player.isOutOfLives()) {
      this.finishGame('death');
    }
  }

  private createTouchControls(): void {
    const pauseButtonX = GAME_WIDTH - 38;
    const pauseButtonY = 34;

    const pauseButton = this.add.circle(pauseButtonX, pauseButtonY, 20, 0x04101e, 0.62)
      .setStrokeStyle(2, 0x6cf3ff, 0.85)
      .setScrollFactor(0)
      .setDepth(19)
      .setInteractive({ useHandCursor: true });
    this.add.text(pauseButtonX, pauseButtonY, 'II', {
      color: '#d8f6ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '16px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(19);

    pauseButton.on('pointerdown', () => this.togglePause());

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
      if (this.isPauseArea(pointer.x, pointer.y)) {
        this.togglePause();
        return;
      }

      if (this.isFireArea(pointer.x, pointer.y)) {
        this.firePointerId = pointer.id;
        this.shootHeld = true;
        return;
      }

      this.movePointerId = pointer.id;
      this.touchMoveX = Phaser.Math.Clamp(pointer.x, 24, GAME_WIDTH - 24);
      this.touchMoveY = Phaser.Math.Clamp(pointer.y, 164, GAME_HEIGHT - 40);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.movePointerId && pointer.isDown) {
        this.touchMoveX = Phaser.Math.Clamp(pointer.x, 24, GAME_WIDTH - 24);
        this.touchMoveY = Phaser.Math.Clamp(pointer.y, 164, GAME_HEIGHT - 40);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id == this.movePointerId) {
        this.movePointerId = null;
        this.touchMoveX = null;
        this.touchMoveY = null;
      }
      if (pointer.id == this.firePointerId) {
        this.firePointerId = null;
        this.shootHeld = false;
      }
    });
  }

  private getHorizontalInput(): number {
    if (!this.cursors) return 0;
    if (this.cursors.left.isDown) return -1;
    if (this.cursors.right.isDown) return 1;
    return 0;
  }

  private getVerticalInput(): number {
    if (!this.cursors) return 0;
    if (this.cursors.up.isDown) return -1;
    if (this.cursors.down.isDown) return 1;
    return 0;
  }

  private shouldFire(): boolean {
    const keyboardFiring = Boolean(this.fireKey?.isDown);
    return this.player.canFire() && (keyboardFiring || this.shootHeld || this.player.isAutoFireEnabled());
  }

  private fireVolley(): void {
    const rapidFire = this.powerUpManager.isActive('rapidFire');
    const tripleShot = this.powerUpManager.isActive('tripleShot');
    const doubleShot = this.powerUpManager.isActive('doubleShot');

    if (doubleShot) {
      this.spawnBullet(this.player.x - 7, this.player.y - 24, 0);
      this.spawnBullet(this.player.x + 7, this.player.y - 24, 0);
    } else {
      this.spawnBullet(this.player.x, this.player.y - 24, 0);
    }
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
    this.bossManager.onEnemyKilled(enemy.getEnemyType());
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

  private createSmallBurst(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 80 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x57e2e5, 0xffffff],
      lifespan: 150,
      quantity: 4,
      blendMode: 'ADD',
    });
    this.time.delayedCall(200, () => particles.destroy());
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

  private triggerNuke(): void {
    const children = [...this.enemies.getChildren()];
    let killCount = 0;
    for (const child of children) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      killCount++;
      this.bossManager.onEnemyKilled(enemy.getEnemyType());
      const pts = this.scoreManager.add(enemy.getPoints(), this.powerUpManager.isActive('scoreMultiplier'), this.comboManager.multiplier);
      this.comboManager.onKill();
      this.statsManager.recordKill();
      this.createExplosion(enemy.x, enemy.y, enemy.getTintColor());
      new FloatingText(this, enemy.x, enemy.y - 10, `+${pts}`, '#ff8844');
      enemy.destroy();
    }
    this.cameras.main.shake(350, 0.020);
    this.cameras.main.flash(220, 255, 100, 0, false);
    if (killCount > 0) {
      new FloatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `☢ NUKE! ${killCount} KILLS`, '#ff8844');
    }
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
    const rewardType = this.getBossRewardPowerUp(bossLevel);
    this.spawnSpecificPowerUp(rewardType, boss.x, boss.y + 36);
    new FloatingText(this, boss.x, boss.y - 38, `NEW POWER: ${POWER_UP_LABELS[rewardType]}`, '#7cff6b');
    this.startLevelTransition(bossLevel);
  }

  private startLevelTransition(bossLevel: number): void {
    this.levelTransition = true;
    Storage.unlockShipLevel(bossLevel + 1);

    // Each level starts fresh on the basic weapon.
    this.powerUpManager.clearActive();
    this.powerUpManager.clearStored();
    this.syncHud();

    // Wipe the battlefield
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.bullets.clear(true, true);
    this.powerUps.clear(true, true);
    this.homingBullets = [];
    if (this.ribbonLaser) {
      this.ribbonLaser.destroy();
      this.ribbonLaser = null;
    }

    // Freeze the player physics body so the tween can move it off-screen freely
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `LEVEL ${bossLevel} CLEAR!`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '42px',
      color: '#ffe050',
      stroke: '#000000',
      strokeThickness: 9,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 32, fill: true },
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
              onComplete: () => {
                this.levelElapsedMs = 0;
                body.enable = true;
                banner.destroy();
                this.enemySpawnManager.setProgressionLevel(bossLevel + 1);
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
        enemy.updateShootTimer(frameDelta, (x, y, vx, vy) => this.spawnEnemyBullet(x, y, vx, vy));
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
    } else if (type === 'nuke') {
      this.triggerNuke();
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

    const level = boss.getLevel();
    const speedMul = this.difficultyManager.getEnemySpeedMultiplier();
    switch (boss.getSpecialAbility()) {
      case 'drone_spawn':
        this.spawnEnemyAt(boss.x - 60, boss.y + 20, this.getHenchmanTypeForLevel(level, 0), speedMul);
        this.spawnEnemyAt(boss.x + 60, boss.y + 20, this.getHenchmanTypeForLevel(level, 1), speedMul);
        break;
      case 'meteor_shower':
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 250, () => {
            this.spawnEnemyAt(
              Phaser.Math.Between(40, GAME_WIDTH - 40),
              boss.y - 20,
              this.getHenchmanTypeForLevel(level, i),
              speedMul,
            );
          });
        }
        break;
      case 'summon':
        this.spawnEnemyAt(boss.x - 90, boss.y + 60, this.getHenchmanTypeForLevel(level, 0), speedMul);
        this.spawnEnemyAt(boss.x + 90, boss.y + 60, this.getHenchmanTypeForLevel(level, 1), speedMul);
        break;
    }
  }

  private spawnEnemyAt(x: number, y: number, type: EnemyType, speedMul: number): void {
    const enemy = new Enemy(this, x, y, type, speedMul);
    this.enemies.add(enemy);
  }

  private getHenchmanTypeForLevel(level: number, index: number): EnemyType {
    if (level >= 9) return index % 2 === 0 ? 'destroyer' : 'bomber';
    if (level >= 7) return index % 3 === 0 ? 'destroyer' : 'bomber';
    if (level >= 5) return index % 2 === 0 ? 'bomber' : 'heavy';
    if (level >= 3) return index % 2 === 0 ? 'striker' : 'medium';
    return 'small';
  }

  private getBossObjectiveStatusText(): string {
    if (this.bossManager.getBoss()) {
      return `BOSS ACTIVE  LV.${this.bossManager.getActiveBossLevel()} ${this.bossManager.getActiveBossName().toUpperCase()}`;
    }

    const nextBossLevel = this.bossManager.getNextBossLevel();
    if (nextBossLevel === null) {
      return 'ALL BOSSES CLEARED';
    }

    return `NEXT BOSS LV.${nextBossLevel}`;
  }

  private getBossObjectiveCounts(): [number, number, number] | null {
    if (this.bossManager.getBoss()) {
      return null;
    }

    const required = this.bossManager.getCurrentGateRequirements();
    const progress = this.bossManager.getCurrentGateProgress();
    if (!required || !progress) {
      return null;
    }

    const remainingSmall = Math.max(0, required.small - progress.small);
    const remainingMedium = Math.max(0, required.medium - progress.medium);
    const remainingHeavy = Math.max(0, required.heavy - progress.heavy);
    return [remainingSmall, remainingMedium, remainingHeavy];
  }

  private getBossRewardPowerUp(level: number): PowerUpType {
    const rewards: PowerUpType[] = [
      'rapidFire',
      'doubleShot',
      'tripleShot',
      'shield',
      'scoreMultiplier',
      'slowTime',
      'piercingShot',
      'magnetShield',
      'ribbonLaser',
      'nuke',
    ];
    return rewards[Math.min(level - 1, rewards.length - 1)];
  }

  private spawnSpecificPowerUp(type: PowerUpType, x: number, y: number): void {
    let powerUp = this.powerUps.get(x, y) as PowerUp | null;
    if (!powerUp) {
      powerUp = new PowerUp(this, x, y);
      this.powerUps.add(powerUp);
    }
    powerUp.configure(type, x, y);
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
    // Full-screen red vignette pulse
    const vignette = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0022, 0)
      .setDepth(29);
    this.tweens.add({
      targets: vignette,
      alpha: { from: 0, to: 0.35 },
      yoyo: true,
      repeat: 3,
      duration: 250,
      ease: 'Sine.easeInOut',
      onComplete: () => vignette.destroy(),
    });

    // Screen shake buildup
    this.cameras.main.shake(1200, 0.005);

    const warn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `⚠  LV.${level} ${name.toUpperCase()}  ⚠`, {
      color: '#ff3366',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '36px',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0022', blur: 28, fill: true },
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

  private showBossAttackTelegraph(pattern: BossTelegraphPattern, bossX: number, bossY: number): void {
    const telegraph = this.add.graphics().setDepth(13);
    telegraph.lineStyle(3, 0xff3355, 0.9);

    if (pattern === 'aimed') {
      telegraph.strokeLineShape(new Phaser.Geom.Line(bossX, bossY + 32, this.player.x, this.player.y));
    } else if (pattern === 'fan') {
      const fanAngles = [-44, -22, 0, 22, 44];
      for (const degrees of fanAngles) {
        const radians = Phaser.Math.DegToRad(90 + degrees);
        const endX = bossX + Math.cos(radians) * 520;
        const endY = bossY + 32 + Math.sin(radians) * 520;
        telegraph.strokeLineShape(new Phaser.Geom.Line(bossX, bossY + 32, endX, endY));
      }
    } else {
      const laneOffsets = [-68, -36, 0, 36, 68];
      for (const offset of laneOffsets) {
        const laneX = bossX + offset;
        telegraph.strokeLineShape(new Phaser.Geom.Line(laneX, bossY + 20, laneX, GAME_HEIGHT));
      }
    }

    this.tweens.add({
      targets: telegraph,
      alpha: 0,
      duration: 220,
      ease: 'Sine.easeOut',
      onComplete: () => telegraph.destroy(),
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
            this.bossManager.onEnemyKilled(enemy.getEnemyType());
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

  private isPauseArea(x: number, y: number): boolean {
    return Phaser.Math.Distance.Between(x, y, GAME_WIDTH - 38, 34) <= 24;
  }

  private showTutorialIfNeeded(): void {
    if (Storage.hasDoneTutorial()) return;
    Storage.markTutorialDone();

    const FONT = 'Arial Black, sans-serif';
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const panelW = 380;
    const panelH = 340;

    const dim = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setDepth(45);

    const panel = this.add.graphics().setDepth(46);
    panel.fillStyle(0x030a18, 0.97);
    panel.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, 0x1a4a7a, 0.9);
    panel.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);

    const title = this.add.text(cx, cy - panelH / 2 + 26, 'HOW TO PLAY', {
      fontFamily: FONT, fontSize: '22px', color: '#6cf3ff',
      stroke: '#061220', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(47);

    const rows = [
      ['🖱 / ←→ Keys', 'Move left / right'],
      ['↑↓ Keys / Drag', 'Move forward / backward'],
      ['SPACE / Right side', 'Fire'],
      ['E Key', 'Use stored power-up'],
      ['F Key', 'Toggle auto-fire'],
      ['ESC / P', 'Pause'],
      ['⚡ Power-ups', 'Collect to gain abilities'],
    ];

    rows.forEach(([key, desc], i) => {
      const y = cy - panelH / 2 + 68 + i * 32;
      this.add.text(cx - 14, y, key, {
        fontFamily: FONT, fontSize: '13px', color: '#ffe050',
        stroke: '#04101e', strokeThickness: 3,
      }).setOrigin(1, 0.5).setDepth(47);
      this.add.text(cx + 6, y, desc, {
        fontFamily: FONT, fontSize: '13px', color: '#d2ebf9',
        stroke: '#04101e', strokeThickness: 3,
      }).setOrigin(0, 0.5).setDepth(47);
    });

    const hint = this.add.text(cx, cy + panelH / 2 - 20, 'TAP ANYWHERE TO START', {
      fontFamily: FONT, fontSize: '12px', color: '#9ac8e8', letterSpacing: 2,
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(47);

    const all = [dim, panel, title, hint];
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0, 0).setDepth(48)
      .setInteractive()
      .once('pointerdown', () => all.forEach(o => o.destroy()));
  }

  private togglePause(): void {
    if (this.gameFinished || this.countdownActive || this.levelTransition) return;
    if (this.paused) {
      this.resumeFromPause();
    } else {
      this.showPauseMenu();
    }
  }

  private pauseOverlay?: Phaser.GameObjects.Container;

  private showPauseMenu(): void {
    this.paused = true;
    this.physics.world.pause();
    this.time.timeScale = 0;
    this.tweens.pauseAll();
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const FONT = 'Arial Black, sans-serif';

    const dim = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.60).setDepth(50);

    const panelW = 320;
    const panelH = 220;
    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(0x030a18, 0.97);
    panel.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, 0x1a4a7a, 0.9);
    panel.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);

    const title = this.add.text(cx, cy - 76, 'PAUSED', {
      fontFamily: FONT, fontSize: '36px', color: '#6cf3ff',
      stroke: '#061220', strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 18, fill: true },
    }).setOrigin(0.5).setDepth(52);

    const makeBtn = (y: number, label: string, color: string, onTap: () => void): void => {
      const bw = 200;
      const bh = 52;
      const bg = this.add.graphics().setDepth(52);
      bg.fillStyle(0x050e1c, 0.92);
      bg.fillRoundedRect(cx - bw / 2, y - bh / 2, bw, bh, 10);
      bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.75);
      bg.strokeRoundedRect(cx - bw / 2, y - bh / 2, bw, bh, 10);
      const txt = this.add.text(cx, y, label, {
        fontFamily: FONT, fontSize: '22px', color, stroke: '#060c1a', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(53);
      this.add.rectangle(cx, y, bw, bh, 0, 0).setDepth(54).setInteractive({ useHandCursor: true })
        .on('pointerdown', onTap);
      this.pauseOverlay?.add([bg, txt]);
    };

    const hint = this.add.text(cx, cy + 84, 'ESC / P to resume', {
      fontFamily: FONT, fontSize: '13px', color: '#b8def2',
      stroke: '#04101e', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(52);

    this.pauseOverlay = this.add.container(0, 0, [dim, panel, title, hint]).setDepth(50);
    makeBtn(cy - 18, '▶  RESUME', '#6cf3ff', () => this.resumeFromPause());
    makeBtn(cy + 48, '✕  QUIT', '#ff6688', () => { this.paused = false; this.scene.start('MenuScene'); });
  }

  private resumeFromPause(): void {
    this.physics.world.resume();
    this.time.timeScale = 1;
    this.tweens.resumeAll();
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
    this.paused = false;
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
      this.getBossObjectiveStatusText(),
      this.getBossObjectiveCounts(),
      this.audioManager.isMuted(),
      this.powerUpManager.getStored(),
      this.player.isAutoFireEnabled(),
    );
  }

  private finishGame(reason: 'time' | 'death' = 'death'): void {
    if (this.gameFinished) return;

    this.gameFinished = true;
    this.audioManager.destroy();
    if (this.ribbonLaser) {
      this.ribbonLaser.destroy();
      this.ribbonLaser = null;
    }
    const summary = this.statsManager.getSummary();
    const grade = this.statsManager.computeGrade(this.scoreManager.getScore());

    Storage.incrementGamesPlayed();
    Storage.addKills(summary.enemiesKilled);
    Storage.addBossKills(summary.bossesKilled);
    Storage.updateShipBest(this.currentShipLevel - 1, this.scoreManager.getScore());
    this.achievementManager.check();

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
