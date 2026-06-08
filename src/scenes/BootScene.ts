import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('player', 'assets/ship-falcon.png');
  }

  create(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.setVisible(false);

    // ── Nebula — deep-space gas clouds (256×256 tiling) ────────
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 256, 256);
    const nebulaClusters = [
      { color: 0x280050, cx: 65,  cy: 80,  rx: 90, ry: 60 },
      { color: 0x1a0070, cx: 42,  cy: 58,  rx: 60, ry: 44 },
      { color: 0x002070, cx: 185, cy: 72,  rx: 80, ry: 55 },
      { color: 0x003060, cx: 212, cy: 108, rx: 58, ry: 42 },
      { color: 0x003a3a, cx: 138, cy: 192, rx: 72, ry: 48 },
      { color: 0x3a0020, cx: 88,  cy: 198, rx: 62, ry: 44 },
      { color: 0x1c0040, cx: 245, cy: 215, rx: 68, ry: 46 },
      { color: 0x001838, cx: 128, cy: 128, rx: 50, ry: 36 },
    ];
    for (const c of nebulaClusters) {
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        graphics.fillStyle(c.color, 0.030 + t * 0.11);
        graphics.fillEllipse(c.cx, c.cy, c.rx * 2 * (1.8 - t * 1.2), c.ry * 2 * (1.8 - t * 1.2));
      }
    }
    // Scattered dim stars within the nebula
    for (let i = 0; i < 32; i++) {
      graphics.fillStyle(0xffffff, 0.12 + (i % 4) * 0.06);
      graphics.fillCircle((i * 83 + 17) % 256, (i * 71 + 29) % 256, 0.5);
    }
    graphics.generateTexture('space-nebula', 256, 256);
    graphics.clear();

    // Seeded PRNG (mulberry32) — gives true scatter, same result every boot
    const makePrng = (seed: number) => {
      let s = seed;
      return (): number => {
        s += 0x6d2b79f5;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
      };
    };

    // ── Far stars — sparse, dim, colour-varied (512×512) ─────────
    const farRng = makePrng(0xdeadbeef);
    const farStarColors = [0x88b8ff, 0xffffff, 0xffddaa, 0xaad4ff, 0xffffff, 0xddeeff];
    for (let i = 0; i < 140; i++) {
      const x = farRng() * 512;
      const y = farRng() * 512;
      const r = farRng() < 0.12 ? 1.1 : (farRng() < 0.30 ? 0.80 : 0.50);
      const alpha = 0.14 + farRng() * 0.28;
      graphics.fillStyle(farStarColors[Math.floor(farRng() * farStarColors.length)], alpha);
      graphics.fillCircle(x, y, r);
    }
    graphics.generateTexture('space-bg-far', 512, 512);
    graphics.clear();

    // ── Near stars — dense, varied colour + spike stars (384×384)
    const nearRng = makePrng(0xcafebabe);
    graphics.fillStyle(0x020510, 1);
    graphics.fillRect(0, 0, 384, 384);
    const nearStarColors = [0xffffff, 0xcce8ff, 0xfff0d4, 0xaad4ff, 0xfff8ee];
    for (let i = 0; i < 220; i++) {
      const x = nearRng() * 384;
      const y = nearRng() * 384;
      const r = nearRng() < 0.10 ? 1.5 : (nearRng() < 0.28 ? 1.0 : 0.6);
      const alpha = 0.40 + nearRng() * 0.50;
      graphics.fillStyle(nearStarColors[Math.floor(nearRng() * nearStarColors.length)], alpha);
      graphics.fillCircle(x, y, r);
    }
    // 10 spike stars spread across the larger tile
    const spikeRng = makePrng(0x1337c0de);
    for (let i = 0; i < 10; i++) {
      const sx = 8 + spikeRng() * 368;
      const sy = 8 + spikeRng() * 368;
      graphics.fillStyle(0xddf0ff, 0.55);
      graphics.fillRect(sx - 1, sy - 5, 2, 10);
      graphics.fillRect(sx - 5, sy - 1, 10, 2);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(sx, sy, 1.6);
    }
    graphics.generateTexture('space-bg', 384, 384);
    graphics.clear();

    // 'player' texture is loaded from assets/ship-falcon.png via preload()

    graphics.fillStyle(0xfff275, 1);
    graphics.fillRect(0, 0, 6, 18);
    graphics.generateTexture('bullet', 6, 18);
    graphics.clear();

    // ── Enemy aliens & meteors ───────────────────────────────────

    // Small enemy: meteor (22×20) — fast, reddish-brown jagged rock
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(10, 0),
      new Phaser.Math.Vector2(18, 3),
      new Phaser.Math.Vector2(22, 9),
      new Phaser.Math.Vector2(19, 16),
      new Phaser.Math.Vector2(13, 20),
      new Phaser.Math.Vector2(5,  18),
      new Phaser.Math.Vector2(0,  12),
      new Phaser.Math.Vector2(2,  5),
    ], true);
    graphics.fillStyle(0xc8703a, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(10, 1),
      new Phaser.Math.Vector2(16, 4),
      new Phaser.Math.Vector2(13, 9),
      new Phaser.Math.Vector2(6,  7),
      new Phaser.Math.Vector2(3,  4),
    ], true);
    graphics.fillStyle(0x5a2a00, 0.7);
    graphics.fillCircle(14, 13, 3);
    graphics.fillStyle(0x3d1a00, 0.9);
    graphics.fillCircle(14, 13, 1.5);
    graphics.generateTexture('enemy-small', 22, 20);
    graphics.clear();

    // Medium alien fighter (38×30) — delta-wing interceptor, toxic green
    // Main delta body
    graphics.fillStyle(0x008833, 1);
    graphics.fillTriangle(19, 0, 38, 28, 0, 28);
    // Body accent — darker spine
    graphics.fillStyle(0x004418, 1);
    graphics.fillTriangle(19, 4, 24, 28, 14, 28);
    // Wing detail panels
    graphics.fillStyle(0x00cc44, 0.7);
    graphics.fillTriangle(19, 6, 36, 26, 22, 26);
    graphics.fillTriangle(19, 6, 2, 26, 16, 26);
    // Cockpit eye — glowing orb
    graphics.fillStyle(0x001a00, 1);
    graphics.fillCircle(19, 14, 5);
    graphics.fillStyle(0x00ff66, 1);
    graphics.fillCircle(19, 14, 3);
    graphics.fillStyle(0xaaffcc, 0.8);
    graphics.fillCircle(18, 13, 1.5);
    // Engine pods on wing edges
    graphics.fillStyle(0x005522, 1);
    graphics.fillRect(3, 24, 8, 5);
    graphics.fillRect(27, 24, 8, 5);
    graphics.fillStyle(0x44ff88, 0.9);
    graphics.fillRect(5, 27, 4, 2);
    graphics.fillRect(29, 27, 4, 2);
    graphics.generateTexture('enemy-medium', 38, 30);
    graphics.clear();

    // Heavy alien dreadnought (52×44) — wide armoured cruiser, electric blue
    // Outer hull — wide trapezoid body
    graphics.fillStyle(0x0033aa, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(26, 0),
      new Phaser.Math.Vector2(42, 8),
      new Phaser.Math.Vector2(52, 22),
      new Phaser.Math.Vector2(48, 38),
      new Phaser.Math.Vector2(26, 44),
      new Phaser.Math.Vector2(4,  38),
      new Phaser.Math.Vector2(0,  22),
      new Phaser.Math.Vector2(10, 8),
    ], true);
    // Armour plating — lighter centre section
    graphics.fillStyle(0x0055cc, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(26, 4),
      new Phaser.Math.Vector2(38, 10),
      new Phaser.Math.Vector2(42, 22),
      new Phaser.Math.Vector2(38, 34),
      new Phaser.Math.Vector2(26, 40),
      new Phaser.Math.Vector2(14, 34),
      new Phaser.Math.Vector2(10, 22),
      new Phaser.Math.Vector2(14, 10),
    ], true);
    // Bridge dome
    graphics.fillStyle(0x001133, 1);
    graphics.fillEllipse(26, 18, 20, 14);
    graphics.fillStyle(0x2288ff, 0.75);
    graphics.fillEllipse(26, 17, 14, 9);
    graphics.fillStyle(0x88ccff, 0.5);
    graphics.fillEllipse(24, 15, 6, 4);
    // Twin cannon barrels
    graphics.fillStyle(0x002266, 1);
    graphics.fillRect(16, 36, 5, 8);
    graphics.fillRect(31, 36, 5, 8);
    graphics.fillStyle(0x44aaff, 0.9);
    graphics.fillRect(17, 40, 3, 4);
    graphics.fillRect(32, 40, 3, 4);
    // Side engine glow
    graphics.fillStyle(0x0088ff, 0.8);
    graphics.fillEllipse(6, 26, 10, 5);
    graphics.fillEllipse(46, 26, 10, 5);
    graphics.fillStyle(0x88ddff, 0.6);
    graphics.fillEllipse(6, 26, 5, 2.5);
    graphics.fillEllipse(46, 26, 5, 2.5);
    // Hull detail lines
    graphics.lineStyle(1, 0x003388, 0.8);
    graphics.strokeRect(13, 9, 26, 12);
    graphics.generateTexture('enemy-heavy', 52, 44);
    graphics.clear();

    // ── Power-up textures — white icon on transparent base; tinted at runtime ─
    const D = (x: number, y: number) => new Phaser.Math.Vector2(x, y);

    // rapidFire — two stacked upward speed-chevrons
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(14, 5, 5, 13, 23, 13);
    graphics.fillTriangle(14, 13, 5, 21, 23, 21);
    graphics.generateTexture('powerup-rapidFire', 28, 28);
    graphics.clear();

    // tripleShot — three upward arrows (left/center/right)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(7, 9, 3, 16, 11, 16);
    graphics.fillRect(5, 16, 4, 6);
    graphics.fillTriangle(14, 5, 10, 14, 18, 14);
    graphics.fillRect(12, 14, 4, 8);
    graphics.fillTriangle(21, 9, 17, 16, 25, 16);
    graphics.fillRect(19, 16, 4, 6);
    graphics.generateTexture('powerup-tripleShot', 28, 28);
    graphics.clear();

    // shield — kite shield outline with cross; dark inner recess
    graphics.fillStyle(0xffffff, 1);
    graphics.fillPoints([D(14,5),D(21,9),D(21,18),D(14,25),D(7,18),D(7,9)], true);
    graphics.fillStyle(0x000000, 0.65);
    graphics.fillPoints([D(14,8),D(18,11),D(18,17),D(14,22),D(10,17),D(10,11)], true);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(12, 10, 4, 13);
    graphics.fillRect(9, 14, 10, 4);
    graphics.generateTexture('powerup-shield', 28, 28);
    graphics.clear();

    // scoreMultiplier — 5-point star
    graphics.fillStyle(0xffffff, 1);
    graphics.fillPoints([
      D(14,4),  D(17,10), D(24,11), D(19,16), D(21,23),
      D(14,19), D(7,23),  D(9,16),  D(4,11),  D(11,10),
    ], true);
    graphics.generateTexture('powerup-scoreMultiplier', 28, 28);
    graphics.clear();

    // slowTime — hourglass
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(5, 5, 23, 5, 14, 14);
    graphics.fillTriangle(5, 23, 23, 23, 14, 14);
    graphics.fillRect(11, 13, 6, 3);
    graphics.generateTexture('powerup-slowTime', 28, 28);
    graphics.clear();

    // laser — vertical beam + wide crossbar
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(12, 3, 4, 22);
    graphics.fillRect(4, 11, 20, 6);
    graphics.generateTexture('powerup-laser', 28, 28);
    graphics.clear();

    // extraLife — heart shape
    graphics.fillStyle(0xffffff, 1);
    graphics.fillPoints([
      D(14,24), D(5,15),  D(5,10),  D(8,7),
      D(11,6),  D(14,9),  D(17,6),  D(20,7),
      D(23,10), D(23,15),
    ], true);
    graphics.generateTexture('powerup-extraLife', 28, 28);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(3, 3, 3);
    graphics.generateTexture('particle', 6, 6);
    graphics.clear();

    // Enemy bullet — small red teardrop
    graphics.fillStyle(0xff4444, 1);
    graphics.fillRect(1, 0, 6, 14);
    graphics.fillStyle(0xff8888, 0.8);
    graphics.fillRect(2, 0, 4, 6);
    graphics.generateTexture('enemy-bullet', 8, 14);
    graphics.clear();

    // ── Boss — demon skull warship (96×80) ──────────────────────────────
    // Wings: swept-back angular extensions
    graphics.fillStyle(0x1c0028, 1);
    graphics.fillTriangle(14, 20, 0, 6, 0, 80);
    graphics.fillTriangle(82, 20, 96, 6, 96, 80);

    // Body hull
    graphics.fillStyle(0x1e002e, 1);
    graphics.fillRoundedRect(10, 14, 76, 64, 12);

    // Face plate (slightly lighter for depth)
    graphics.fillStyle(0x2e0044, 1);
    graphics.fillRoundedRect(14, 16, 68, 50, 9);

    // Brow ridges (inward-angled V above each eye)
    graphics.fillStyle(0x48005a, 1);
    graphics.fillPoints([{ x: 10, y: 26 }, { x: 38, y: 28 }, { x: 38, y: 31 }, { x: 10, y: 23 }], true);
    graphics.fillPoints([{ x: 58, y: 28 }, { x: 86, y: 26 }, { x: 86, y: 23 }, { x: 58, y: 31 }], true);

    // Three sharp horns — dark base then bright edge
    graphics.fillStyle(0x8a0020, 1);
    graphics.fillTriangle(20, 18, 30, 2, 40, 18);
    graphics.fillTriangle(38, 16, 48, 0, 58, 16);
    graphics.fillTriangle(56, 18, 66, 2, 76, 18);
    graphics.fillStyle(0xff0044, 1);
    graphics.fillTriangle(22, 18, 30, 4, 38, 18);
    graphics.fillTriangle(40, 16, 48, 1, 56, 16);
    graphics.fillTriangle(58, 18, 66, 4, 74, 18);

    // Eye sockets (cavernous dark voids)
    graphics.fillStyle(0x050008, 1);
    graphics.fillEllipse(28, 37, 30, 22);
    graphics.fillEllipse(68, 37, 30, 22);

    // Eye: outer blood-orange glow → brighter orange → searing core
    graphics.fillStyle(0xff2e00, 1);
    graphics.fillEllipse(28, 36, 22, 16);
    graphics.fillEllipse(68, 36, 22, 16);
    graphics.fillStyle(0xff7200, 1);
    graphics.fillEllipse(28, 35, 14, 10);
    graphics.fillEllipse(68, 35, 14, 10);
    graphics.fillStyle(0xffee33, 1);
    graphics.fillEllipse(28, 34, 7, 7);
    graphics.fillEllipse(68, 34, 7, 7);

    // Pupil: vertical slit (reptilian / demonic)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(27, 28, 3, 14);
    graphics.fillRect(67, 28, 3, 14);

    // Nasal cavity (triangular skull void)
    graphics.fillStyle(0x050008, 1);
    graphics.fillTriangle(43, 46, 53, 46, 48, 55);

    // Jaw frame + gaping maw
    graphics.fillStyle(0x150020, 1);
    graphics.fillRoundedRect(12, 56, 72, 20, { tl: 0, tr: 0, bl: 10, br: 10 });
    graphics.fillStyle(0x050008, 1);
    graphics.fillRoundedRect(16, 56, 64, 15, { tl: 0, tr: 0, bl: 8, br: 8 });

    // Eight sharp fangs
    graphics.fillStyle(0xc8e4ff, 1);
    for (let i = 0; i < 8; i++) {
      graphics.fillTriangle(16 + i * 8, 56, 22 + i * 8, 56, 19 + i * 8, 65);
    }

    // Chest energy core
    graphics.fillStyle(0xff0033, 0.4);
    graphics.fillEllipse(48, 50, 26, 14);
    graphics.fillStyle(0xff2244, 0.75);
    graphics.fillEllipse(48, 50, 16, 8);
    graphics.fillStyle(0xff99bb, 1);
    graphics.fillEllipse(48, 50, 6, 4);

    graphics.generateTexture('boss', 96, 80);
    graphics.clear();

    // ── Viper — slender, fast (orange-red, 1.2× speed) ────────────
    graphics.fillStyle(0xff6030, 1);
    graphics.fillTriangle(18, 0, 6, 36, 30, 36);
    graphics.fillStyle(0xffaa44, 1);
    graphics.fillRect(17, 8, 2, 22);
    graphics.generateTexture('ship-viper', 36, 36);
    graphics.clear();

    // ── Nova — wide hull, rapid fire (cyan, 0.65× cooldown) ───────
    graphics.fillStyle(0x18c8ff, 1);
    graphics.fillTriangle(18, 0, 0, 34, 36, 34);
    graphics.fillStyle(0x0a3050, 1);
    graphics.fillRect(0, 28, 12, 8);
    graphics.fillRect(24, 28, 12, 8);
    graphics.fillStyle(0xffffff, 0.65);
    graphics.fillEllipse(18, 14, 10, 7);
    graphics.generateTexture('ship-nova', 36, 36);
    graphics.clear();

    // ── Phantom — stealth kite, agile (purple, 0.8× cooldown) ─────
    graphics.fillStyle(0xaa60ff, 1);
    graphics.fillPoints([
      new Phaser.Math.Vector2(18, 0),
      new Phaser.Math.Vector2(36, 18),
      new Phaser.Math.Vector2(28, 36),
      new Phaser.Math.Vector2(8, 36),
      new Phaser.Math.Vector2(0, 18),
    ], true);
    graphics.fillStyle(0xddaaff, 0.55);
    graphics.fillRect(16, 10, 4, 16);
    graphics.generateTexture('ship-phantom', 36, 36);
    graphics.clear();

    // ── Titan — heavy bruiser (gold, 0.55× cooldown) ──────────────
    graphics.fillStyle(0xffcc22, 1);
    graphics.fillTriangle(18, 0, 8, 12, 28, 12);
    graphics.fillRect(6, 10, 24, 26);
    graphics.fillRect(0, 16, 8, 20);
    graphics.fillRect(28, 16, 8, 20);
    graphics.fillStyle(0xff9900, 1);
    graphics.fillRect(0, 16, 2, 20);
    graphics.fillRect(34, 16, 2, 20);
    graphics.fillStyle(0x0a2040, 0.65);
    graphics.fillRect(14, 12, 8, 12);
    graphics.generateTexture('ship-titan', 36, 36);
    graphics.destroy();

    this.scene.start('MenuScene');
  }
}
