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

    // nuke — starburst: filled circle + 6 pointed spikes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 14, 5);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const ax = 14 + Math.cos(a - 0.30) * 7;
      const ay = 14 + Math.sin(a - 0.30) * 7;
      const bx = 14 + Math.cos(a) * 13;
      const by = 14 + Math.sin(a) * 13;
      const cx = 14 + Math.cos(a + 0.30) * 7;
      const cy = 14 + Math.sin(a + 0.30) * 7;
      graphics.fillTriangle(ax, ay, bx, by, cx, cy);
    }
    graphics.generateTexture('powerup-nuke', 28, 28);
    graphics.clear();

    // piercingShot — upward arrow with side speed-slash lines
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(14, 2, 7, 12, 21, 12); // arrowhead
    graphics.fillRect(12, 12, 4, 14);             // shaft
    graphics.fillRect(4, 9,  5, 2);               // left slash
    graphics.fillRect(4, 14, 4, 2);               // left slash 2
    graphics.fillRect(19, 9,  5, 2);              // right slash
    graphics.fillRect(20, 14, 4, 2);              // right slash 2
    graphics.generateTexture('powerup-piercingShot', 28, 28);
    graphics.clear();

    // magnetShield — horseshoe magnet (U-shape with pole tips)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(5, 3, 7, 20, 2);   // left pole
    graphics.fillRoundedRect(16, 3, 7, 20, 2);  // right pole
    graphics.fillRoundedRect(5, 3, 18, 7, 3);   // connecting top bar
    // Dark hollow inside (depth)
    graphics.fillStyle(0x000000, 0.75);
    graphics.fillRect(8, 8, 12, 12);            // inner void
    // Tip ends (distinct pole blocks)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(5, 21, 7, 4);             // left tip
    graphics.fillRect(16, 21, 7, 4);            // right tip
    // Small field dots at bottom of poles
    graphics.fillCircle(8, 27, 2);
    graphics.fillCircle(20, 27, 2);
    graphics.generateTexture('powerup-magnetShield', 28, 28);
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

    graphics.generateTexture('boss-1', 96, 80);
    graphics.clear();

    // ── Boss 2 — Hydra: Three-headed serpent (poison green) ─────────────
    // Wide organic body base
    graphics.fillStyle(0x050f06, 1);
    graphics.fillEllipse(48, 70, 88, 28);
    graphics.fillStyle(0x081808, 1);
    graphics.fillEllipse(48, 64, 72, 24);

    // Three neck columns (trapezoid, angled outward)
    graphics.fillStyle(0x0c2a10, 1);
    graphics.fillPoints([{ x: 10, y: 60 }, { x: 26, y: 60 }, { x: 20, y: 24 }, { x: 6, y: 24 }], true);
    graphics.fillPoints([{ x: 40, y: 58 }, { x: 56, y: 58 }, { x: 52, y: 18 }, { x: 44, y: 18 }], true);
    graphics.fillPoints([{ x: 70, y: 60 }, { x: 86, y: 60 }, { x: 90, y: 24 }, { x: 76, y: 24 }], true);

    // Scale ridges on necks
    graphics.fillStyle(0x164422, 1);
    for (let i = 0; i < 4; i++) {
      graphics.fillEllipse(16, 54 - i * 9, 14, 6);
      graphics.fillEllipse(48, 52 - i * 9, 14, 6);
      graphics.fillEllipse(80, 54 - i * 9, 14, 6);
    }

    // Three serpent heads
    graphics.fillStyle(0x0a2a10, 1);
    graphics.fillEllipse(15, 18, 32, 22);
    graphics.fillEllipse(48, 10, 32, 22);
    graphics.fillEllipse(81, 18, 32, 22);

    // Head crests / frills
    graphics.fillStyle(0x1a5522, 1);
    graphics.fillTriangle(0, 22, 15, 4, 30, 22);
    graphics.fillTriangle(32, 12, 48, -2, 64, 12);
    graphics.fillTriangle(66, 22, 81, 4, 96, 22);

    // Eye sockets
    graphics.fillStyle(0x020503, 1);
    graphics.fillEllipse(9, 16, 12, 9);  graphics.fillEllipse(21, 16, 12, 9);
    graphics.fillEllipse(42, 8, 12, 9);  graphics.fillEllipse(54, 8, 12, 9);
    graphics.fillEllipse(75, 16, 12, 9); graphics.fillEllipse(87, 16, 12, 9);

    // Poison eyes
    graphics.fillStyle(0x66ff00, 1);
    graphics.fillEllipse(9, 16, 8, 6);  graphics.fillEllipse(21, 16, 8, 6);
    graphics.fillEllipse(42, 8, 8, 6);  graphics.fillEllipse(54, 8, 8, 6);
    graphics.fillEllipse(75, 16, 8, 6); graphics.fillEllipse(87, 16, 8, 6);
    graphics.fillStyle(0xccff22, 1);
    graphics.fillEllipse(9, 16, 4, 4);  graphics.fillEllipse(21, 16, 4, 4);
    graphics.fillEllipse(42, 8, 4, 4);  graphics.fillEllipse(54, 8, 4, 4);
    graphics.fillEllipse(75, 16, 4, 4); graphics.fillEllipse(87, 16, 4, 4);

    // Vertical slit pupils
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(8, 13, 2, 7); graphics.fillRect(20, 13, 2, 7);
    graphics.fillRect(41, 5, 2, 7); graphics.fillRect(53, 5, 2, 7);
    graphics.fillRect(74, 13, 2, 7); graphics.fillRect(86, 13, 2, 7);

    // Fangs (4 per head)
    graphics.fillStyle(0xccffcc, 1);
    for (let i = 0; i < 4; i++) {
      graphics.fillTriangle(4 + i * 6, 26, 8 + i * 6, 26, 6 + i * 6, 34);
      graphics.fillTriangle(36 + i * 6, 18, 40 + i * 6, 18, 38 + i * 6, 26);
      graphics.fillTriangle(68 + i * 6, 26, 72 + i * 6, 26, 70 + i * 6, 34);
    }

    // Forked tongues
    graphics.fillStyle(0xff1144, 1);
    graphics.fillTriangle(11, 34, 15, 34, 9, 44);  graphics.fillTriangle(15, 34, 19, 34, 21, 44);
    graphics.fillTriangle(44, 26, 48, 26, 42, 36); graphics.fillTriangle(48, 26, 52, 26, 54, 36);
    graphics.fillTriangle(75, 34, 79, 34, 73, 44); graphics.fillTriangle(79, 34, 83, 34, 85, 44);

    graphics.generateTexture('boss-2', 96, 80);
    graphics.clear();

    // ── Boss 3 — Pulsar: Crystal energy being (cyan/blue) ───────────────
    // Outer crystal shell (dark octagon)
    graphics.fillStyle(0x000c1a, 1);
    graphics.fillPoints([
      { x: 48, y: 0 }, { x: 76, y: 10 }, { x: 94, y: 32 },
      { x: 94, y: 50 }, { x: 76, y: 72 }, { x: 20, y: 72 },
      { x: 2, y: 50 }, { x: 2, y: 32 }, { x: 20, y: 10 },
    ], true);

    // Second crystal layer
    graphics.fillStyle(0x001628, 1);
    graphics.fillPoints([
      { x: 48, y: 6 }, { x: 72, y: 16 }, { x: 86, y: 34 },
      { x: 86, y: 48 }, { x: 72, y: 66 }, { x: 24, y: 66 },
      { x: 10, y: 48 }, { x: 10, y: 34 }, { x: 24, y: 16 },
    ], true);

    // Facet highlights
    graphics.fillStyle(0x002244, 1);
    graphics.fillTriangle(48, 6, 24, 16, 10, 34);
    graphics.fillTriangle(48, 6, 72, 16, 86, 34);

    // Glowing energy core (nested layers)
    graphics.fillStyle(0x003a7a, 1); graphics.fillEllipse(48, 40, 60, 46);
    graphics.fillStyle(0x0066bb, 1); graphics.fillEllipse(48, 40, 46, 34);
    graphics.fillStyle(0x0099ee, 1); graphics.fillEllipse(48, 40, 30, 22);
    graphics.fillStyle(0x33ccff, 1); graphics.fillEllipse(48, 40, 16, 12);
    graphics.fillStyle(0x99eeff, 1); graphics.fillEllipse(48, 40, 7, 5);
    graphics.fillStyle(0xffffff, 1); graphics.fillEllipse(48, 40, 3, 3);

    // Crystal spike protrusions (cardinal)
    graphics.fillStyle(0x0055aa, 1);
    graphics.fillTriangle(40, 0, 56, 0, 48, 8);
    graphics.fillTriangle(40, 72, 56, 72, 48, 80);
    graphics.fillTriangle(0, 32, 8, 44, 2, 44);
    graphics.fillTriangle(88, 32, 94, 44, 96, 44);

    // Diagonal structural facets
    graphics.fillStyle(0x0077cc, 1);
    graphics.fillTriangle(24, 16, 48, 8, 48, 38);
    graphics.fillTriangle(72, 16, 48, 8, 48, 38);
    graphics.fillStyle(0x0044aa, 1);
    graphics.fillTriangle(10, 48, 14, 34, 32, 40);
    graphics.fillTriangle(86, 48, 82, 34, 64, 40);

    graphics.generateTexture('boss-3', 96, 80);
    graphics.clear();

    // ── Boss 4 — Reaper: Hooded specter with scythe wings (black/purple) ─
    // Sweeping cloak silhouette
    graphics.fillStyle(0x050006, 1);
    graphics.fillPoints([
      { x: 48, y: 4 }, { x: 64, y: 8 }, { x: 88, y: 20 },
      { x: 96, y: 48 }, { x: 82, y: 78 }, { x: 14, y: 78 },
      { x: 0, y: 48 }, { x: 8, y: 20 }, { x: 32, y: 8 },
    ], true);

    // Inner cloak depth
    graphics.fillStyle(0x080008, 1);
    graphics.fillPoints([
      { x: 48, y: 10 }, { x: 62, y: 14 }, { x: 82, y: 24 },
      { x: 88, y: 48 }, { x: 76, y: 74 }, { x: 20, y: 74 },
      { x: 8, y: 48 }, { x: 14, y: 24 }, { x: 34, y: 14 },
    ], true);

    // Scythe upper blades
    graphics.fillStyle(0x1a001e, 1);
    graphics.fillTriangle(8, 20, 0, 2, 24, 18);
    graphics.fillTriangle(88, 20, 96, 2, 72, 18);
    graphics.fillStyle(0x550066, 1);
    graphics.fillTriangle(8, 20, 0, 4, 14, 18);
    graphics.fillTriangle(88, 20, 96, 4, 82, 18);

    // Scythe lower hooks
    graphics.fillStyle(0x1a001e, 1);
    graphics.fillTriangle(0, 50, 10, 66, 18, 52);
    graphics.fillTriangle(96, 50, 86, 66, 78, 52);
    graphics.fillStyle(0x440055, 1);
    graphics.fillTriangle(2, 52, 8, 64, 14, 52);
    graphics.fillTriangle(94, 52, 88, 64, 82, 52);

    // Hood shadow
    graphics.fillStyle(0x020002, 1);
    graphics.fillEllipse(48, 34, 54, 44);

    // Skull face
    graphics.fillStyle(0x28003a, 1); graphics.fillEllipse(48, 28, 42, 36);
    graphics.fillStyle(0x36004e, 1); graphics.fillEllipse(48, 26, 32, 28);

    // Eye sockets
    graphics.fillStyle(0x000000, 1);
    graphics.fillEllipse(36, 24, 15, 11); graphics.fillEllipse(60, 24, 15, 11);

    // Soul-fire eyes (purple)
    graphics.fillStyle(0x9900ff, 1);
    graphics.fillEllipse(36, 24, 10, 7); graphics.fillEllipse(60, 24, 10, 7);
    graphics.fillStyle(0xcc44ff, 1);
    graphics.fillEllipse(36, 24, 5, 4);  graphics.fillEllipse(60, 24, 5, 4);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(36, 24, 2, 2);  graphics.fillEllipse(60, 24, 2, 2);

    // Nasal void
    graphics.fillStyle(0x000000, 1);
    graphics.fillTriangle(44, 34, 52, 34, 48, 40);

    // Jaw / maw
    graphics.fillStyle(0x1a0022, 1);
    graphics.fillRoundedRect(30, 40, 36, 14, { tl: 0, tr: 0, bl: 6, br: 6 });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRoundedRect(33, 40, 30, 10, { tl: 0, tr: 0, bl: 4, br: 4 });

    // Jagged teeth
    graphics.fillStyle(0x9966bb, 1);
    for (let i = 0; i < 5; i++) {
      graphics.fillTriangle(33 + i * 6, 40, 37 + i * 6, 40, 35 + i * 6, 47);
    }

    // Cloak hem energy glow
    graphics.fillStyle(0x6600aa, 0.5);
    graphics.fillRect(16, 70, 64, 6);

    graphics.generateTexture('boss-4', 96, 80);
    graphics.clear();

    // ── Boss 5 — Titan: Armored dreadnought (dark orange/iron) ──────────
    // Main hull
    graphics.fillStyle(0x120800, 1);
    graphics.fillPoints([
      { x: 48, y: 2 }, { x: 70, y: 8 }, { x: 82, y: 18 },
      { x: 82, y: 68 }, { x: 68, y: 78 }, { x: 28, y: 78 },
      { x: 14, y: 68 }, { x: 14, y: 18 }, { x: 26, y: 8 },
    ], true);

    // Armor plating
    graphics.fillStyle(0x1e0e04, 1);
    graphics.fillRect(20, 14, 56, 56);

    // Side weapon wing pods
    graphics.fillStyle(0x160a02, 1);
    graphics.fillPoints([{ x: 0, y: 22 }, { x: 14, y: 16 }, { x: 14, y: 54 }, { x: 0, y: 60 }], true);
    graphics.fillPoints([{ x: 82, y: 16 }, { x: 96, y: 22 }, { x: 96, y: 60 }, { x: 82, y: 54 }], true);

    // Left weapon barrels
    graphics.fillStyle(0x0a0600, 1);
    graphics.fillRect(0, 24, 12, 7); graphics.fillRect(0, 36, 12, 7); graphics.fillRect(0, 48, 12, 7);
    graphics.fillStyle(0xff5500, 1);
    graphics.fillRect(0, 25, 4, 5);  graphics.fillRect(0, 37, 4, 5);  graphics.fillRect(0, 49, 4, 5);

    // Right weapon barrels
    graphics.fillStyle(0x0a0600, 1);
    graphics.fillRect(84, 24, 12, 7); graphics.fillRect(84, 36, 12, 7); graphics.fillRect(84, 48, 12, 7);
    graphics.fillStyle(0xff6600, 1);
    graphics.fillRect(92, 25, 4, 5);  graphics.fillRect(92, 37, 4, 5);  graphics.fillRect(92, 49, 4, 5);

    // Armor panel lines
    graphics.fillStyle(0x2a1206, 1);
    graphics.fillRect(22, 18, 52, 5); graphics.fillRect(22, 54, 52, 5);
    graphics.fillRect(22, 26, 5, 22); graphics.fillRect(69, 26, 5, 22);

    // Command bridge
    graphics.fillStyle(0x2a1006, 1); graphics.fillRoundedRect(30, 20, 36, 24, 4);
    graphics.fillStyle(0x381606, 1); graphics.fillRoundedRect(32, 22, 32, 20, 3);

    // Cockpit viewport
    graphics.fillStyle(0x000a1c, 1); graphics.fillRect(34, 24, 28, 5);
    graphics.fillStyle(0xff3300, 0.7); graphics.fillRect(35, 25, 7, 3);
    graphics.fillStyle(0xff5500, 0.7); graphics.fillRect(44, 25, 7, 3);
    graphics.fillStyle(0xff3300, 0.7); graphics.fillRect(53, 25, 7, 3);

    // Central reactor core
    graphics.fillStyle(0xff2200, 0.4); graphics.fillEllipse(48, 46, 24, 18);
    graphics.fillStyle(0xff5500, 0.7); graphics.fillEllipse(48, 46, 14, 10);
    graphics.fillStyle(0xff9944, 1);   graphics.fillEllipse(48, 46, 6, 5);

    // Forward heavy cannons
    graphics.fillStyle(0x0e0602, 1);
    graphics.fillRect(34, 2, 9, 14); graphics.fillRect(53, 2, 9, 14);
    graphics.fillStyle(0xff4400, 1);
    graphics.fillRect(34, 2, 9, 5);  graphics.fillRect(53, 2, 9, 5);

    // Engine exhaust nozzles
    graphics.fillStyle(0x000000, 1);
    graphics.fillEllipse(30, 74, 14, 8); graphics.fillEllipse(48, 76, 14, 8); graphics.fillEllipse(66, 74, 14, 8);
    graphics.fillStyle(0xff4400, 0.9);
    graphics.fillEllipse(30, 76, 10, 5); graphics.fillEllipse(48, 78, 10, 5); graphics.fillEllipse(66, 76, 10, 5);
    graphics.fillStyle(0xff9944, 1);
    graphics.fillEllipse(30, 77, 5, 3); graphics.fillEllipse(48, 79, 5, 3); graphics.fillEllipse(66, 77, 5, 3);

    graphics.generateTexture('boss-5', 96, 80);
    graphics.clear();

    // ── Boss 6 — Phantom: Ethereal wraith (dark violet/teal) ────────────
    // Outer ghostly mass
    graphics.fillStyle(0x06011a, 1);
    graphics.fillEllipse(48, 32, 82, 58);

    // Ghost bell body
    graphics.fillStyle(0x0c0430, 1);
    graphics.fillEllipse(48, 28, 66, 48);

    // Crown tendrils (upward wisps)
    graphics.fillStyle(0x160842, 1);
    graphics.fillTriangle(26, 16, 20, -6, 32, 14);
    graphics.fillTriangle(36, 8,  30, -10, 42, 6);
    graphics.fillTriangle(48, 4,  42, -12, 54, 2);
    graphics.fillTriangle(60, 8,  54, -10, 66, 6);
    graphics.fillTriangle(70, 16, 64, -6, 76, 14);

    // Trailing bottom tendrils
    graphics.fillStyle(0x0a0328, 1);
    graphics.fillPoints([{ x: 14, y: 46 }, { x: 22, y: 46 }, { x: 10, y: 80 }, { x: 2, y: 78 }], true);
    graphics.fillPoints([{ x: 28, y: 52 }, { x: 36, y: 52 }, { x: 30, y: 80 }, { x: 20, y: 80 }], true);
    graphics.fillPoints([{ x: 43, y: 54 }, { x: 53, y: 54 }, { x: 50, y: 80 }, { x: 40, y: 80 }], true);
    graphics.fillPoints([{ x: 60, y: 52 }, { x: 68, y: 52 }, { x: 76, y: 80 }, { x: 64, y: 80 }], true);
    graphics.fillPoints([{ x: 74, y: 46 }, { x: 82, y: 46 }, { x: 94, y: 78 }, { x: 86, y: 80 }], true);

    // Inner face / core
    graphics.fillStyle(0x120540, 1);
    graphics.fillEllipse(48, 30, 52, 38);

    // Eye sockets
    graphics.fillStyle(0x000000, 1);
    graphics.fillEllipse(33, 26, 20, 14); graphics.fillEllipse(63, 26, 20, 14);

    // Haunting teal eyes
    graphics.fillStyle(0x00ddaa, 1);
    graphics.fillEllipse(33, 26, 14, 10); graphics.fillEllipse(63, 26, 14, 10);
    graphics.fillStyle(0x88ffee, 1);
    graphics.fillEllipse(33, 26, 7, 6);   graphics.fillEllipse(63, 26, 7, 6);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(33, 26, 3, 3);   graphics.fillEllipse(63, 26, 3, 3);

    // Wailing maw
    graphics.fillStyle(0x000000, 1);   graphics.fillEllipse(48, 42, 24, 16);
    graphics.fillStyle(0x00aacc, 0.25); graphics.fillEllipse(48, 43, 14, 9);

    // Teeth
    graphics.fillStyle(0x88ddcc, 1);
    for (let i = 0; i < 4; i++) {
      graphics.fillTriangle(38 + i * 5, 36, 41 + i * 5, 36, 39 + i * 5, 42);
      graphics.fillTriangle(38 + i * 5, 48, 41 + i * 5, 48, 39 + i * 5, 42);
    }

    graphics.generateTexture('boss-6', 96, 80);
    graphics.clear();

    // ── Boss 7 — Nexus: Cybernetic mind (green circuits) ────────────────
    // Outer hexagonal casing
    graphics.fillStyle(0x001400, 1);
    graphics.fillPoints([
      { x: 48, y: 0 }, { x: 86, y: 20 }, { x: 86, y: 60 },
      { x: 48, y: 80 }, { x: 10, y: 60 }, { x: 10, y: 20 },
    ], true);

    // Inner casing layer
    graphics.fillStyle(0x002200, 1);
    graphics.fillPoints([
      { x: 48, y: 6 }, { x: 80, y: 24 }, { x: 80, y: 56 },
      { x: 48, y: 74 }, { x: 16, y: 56 }, { x: 16, y: 24 },
    ], true);

    // Circuit traces
    graphics.fillStyle(0x004400, 1);
    graphics.fillRect(16, 38, 64, 2);
    graphics.fillRect(46, 6, 4, 68);
    graphics.fillRect(16, 24, 26, 2); graphics.fillRect(54, 24, 26, 2);
    graphics.fillRect(16, 54, 26, 2); graphics.fillRect(54, 54, 26, 2);
    graphics.fillRect(26, 24, 2, 16); graphics.fillRect(68, 24, 2, 16);
    graphics.fillRect(26, 40, 2, 16); graphics.fillRect(68, 40, 2, 16);

    // Circuit junction nodes
    graphics.fillStyle(0x00aa00, 1);
    const junctions: [number, number][] = [
      [16,38],[80,38],[48,6],[48,74],[26,24],[70,24],[26,56],[70,56],
    ];
    for (const [jx, jy] of junctions) graphics.fillRect(jx - 2, jy - 2, 5, 5);

    // Brain hemispheres
    graphics.fillStyle(0x002a00, 1); graphics.fillEllipse(48, 38, 48, 38);
    graphics.fillStyle(0x003800, 1);
    graphics.fillEllipse(35, 36, 22, 18); graphics.fillEllipse(61, 36, 22, 18);

    // Hemisphere folds
    graphics.fillStyle(0x005500, 1);
    graphics.fillRect(46, 18, 4, 40);
    graphics.fillEllipse(35, 32, 14, 6); graphics.fillEllipse(35, 42, 14, 6);
    graphics.fillEllipse(61, 32, 14, 6); graphics.fillEllipse(61, 42, 14, 6);

    // All-seeing mechanical eye
    graphics.fillStyle(0x000000, 1); graphics.fillEllipse(48, 38, 20, 20);
    graphics.fillStyle(0x00ee00, 1); graphics.fillEllipse(48, 38, 14, 14);
    graphics.fillStyle(0x44ff44, 1); graphics.fillEllipse(48, 38, 8, 8);
    graphics.fillStyle(0xaaffaa, 1); graphics.fillEllipse(48, 38, 4, 4);
    graphics.fillStyle(0xffffff, 1); graphics.fillEllipse(48, 38, 2, 2);

    // Corner sensor nodes
    graphics.fillStyle(0x00cc44, 1);
    const sensors: [number, number][] = [[16, 24], [80, 24], [16, 56], [80, 56]];
    for (const [sx, sy] of sensors) {
      graphics.fillEllipse(sx, sy, 8, 8);
      graphics.fillStyle(0x00ff66, 1); graphics.fillEllipse(sx, sy, 4, 4);
      graphics.fillStyle(0x00cc44, 1);
    }

    graphics.generateTexture('boss-7', 96, 80);
    graphics.clear();

    // ── Boss 8 — Devourer: All-consuming maw (black/crimson) ────────────
    // Outer tentacle mass
    graphics.fillStyle(0x080006, 1);
    graphics.fillEllipse(48, 40, 90, 78);

    // Top tentacles
    graphics.fillStyle(0x100010, 1);
    graphics.fillPoints([{ x: 30, y: 20 }, { x: 38, y: 22 }, { x: 24, y: 0 },  { x: 16, y: 4 }], true);
    graphics.fillPoints([{ x: 42, y: 16 }, { x: 50, y: 16 }, { x: 46, y: -2 }, { x: 38, y: 0 }], true);
    graphics.fillPoints([{ x: 54, y: 20 }, { x: 62, y: 22 }, { x: 76, y: 4 },  { x: 68, y: 0 }], true);

    // Side tentacles
    graphics.fillPoints([{ x: 8, y: 32 },  { x: 14, y: 40 }, { x: 0, y: 52 },   { x: -4, y: 44 }], true);
    graphics.fillPoints([{ x: 78, y: 32 }, { x: 84, y: 40 }, { x: 100, y: 52 }, { x: 96, y: 44 }], true);

    // Bottom tentacles
    graphics.fillPoints([{ x: 18, y: 62 }, { x: 28, y: 66 }, { x: 12, y: 82 }, { x: 4, y: 78 }], true);
    graphics.fillPoints([{ x: 42, y: 68 }, { x: 54, y: 68 }, { x: 48, y: 84 }, { x: 38, y: 84 }], true);
    graphics.fillPoints([{ x: 68, y: 62 }, { x: 78, y: 66 }, { x: 90, y: 78 }, { x: 84, y: 82 }], true);

    // Main body
    graphics.fillStyle(0x0e000a, 1); graphics.fillEllipse(48, 40, 70, 60);

    // Outer lip ring of the maw
    graphics.fillStyle(0x220018, 1); graphics.fillEllipse(48, 40, 58, 48);

    // The maw — enormous gaping mouth
    graphics.fillStyle(0x000000, 1); graphics.fillEllipse(48, 40, 50, 42);

    // Inner glowing throat abyss
    graphics.fillStyle(0x3a0028, 0.7); graphics.fillEllipse(48, 42, 32, 26);
    graphics.fillStyle(0x880040, 0.6); graphics.fillEllipse(48, 44, 16, 12);
    graphics.fillStyle(0xcc0055, 0.5); graphics.fillEllipse(48, 46, 7, 6);

    // Upper fangs
    graphics.fillStyle(0xddccff, 1);
    for (let i = 0; i < 6; i++) {
      graphics.fillTriangle(20 + i * 9, 20, 26 + i * 9, 20, 23 + i * 9, 32);
    }
    // Lower fangs
    for (let i = 0; i < 6; i++) {
      graphics.fillTriangle(20 + i * 9, 60, 26 + i * 9, 60, 23 + i * 9, 48);
    }

    // Primary eyes (upper flanks)
    graphics.fillStyle(0xff0044, 1);
    graphics.fillEllipse(18, 26, 14, 10); graphics.fillEllipse(78, 26, 14, 10);
    graphics.fillStyle(0xff6688, 1);
    graphics.fillEllipse(18, 26, 8, 6);   graphics.fillEllipse(78, 26, 8, 6);

    // Secondary side eyes
    graphics.fillStyle(0xff0033, 1);
    graphics.fillEllipse(10, 40, 9, 9); graphics.fillEllipse(86, 40, 9, 9);
    graphics.fillStyle(0xff88aa, 1);
    graphics.fillEllipse(10, 40, 5, 5); graphics.fillEllipse(86, 40, 5, 5);

    graphics.generateTexture('boss-8', 96, 80);
    graphics.clear();

    // ── Boss 9 — Apocalypse: Eldritch horror with many eyes (dark crimson) ─
    // Chaotic star-burst silhouette
    graphics.fillStyle(0x0c0002, 1);
    graphics.fillPoints([
      { x: 48, y: 0 },  { x: 62, y: 6 },  { x: 80, y: 2 },  { x: 84, y: 16 },
      { x: 96, y: 24 }, { x: 90, y: 38 }, { x: 96, y: 52 }, { x: 82, y: 58 },
      { x: 80, y: 72 }, { x: 64, y: 68 }, { x: 56, y: 80 }, { x: 48, y: 72 },
      { x: 40, y: 80 }, { x: 32, y: 68 }, { x: 16, y: 72 }, { x: 14, y: 58 },
      { x: 0, y: 52 },  { x: 6, y: 38 },  { x: 0, y: 24 },  { x: 12, y: 16 },
      { x: 16, y: 2 },  { x: 34, y: 6 },
    ], true);

    // Inner mass
    graphics.fillStyle(0x160006, 1);
    graphics.fillEllipse(48, 40, 74, 62);

    // Pulsating vein network
    graphics.fillStyle(0x550022, 1);
    graphics.fillRect(22, 39, 52, 2); graphics.fillRect(47, 14, 2, 52);
    graphics.fillRect(26, 22, 2, 36); graphics.fillRect(68, 22, 2, 36);
    graphics.fillRect(30, 22, 40, 2); graphics.fillRect(30, 56, 40, 2);

    // Scattered eyes (all shapes)
    const eyes: [number, number, number, number][] = [
      [48, 22, 18, 13],
      [24, 34, 12, 9], [72, 34, 12, 9],
      [32, 52, 10, 8], [64, 52, 10, 8],
      [48, 58, 13, 10],
      [12, 44, 8, 7],  [84, 44, 8, 7],
      [38, 38, 7, 6],  [58, 38, 7, 6],
    ];
    graphics.fillStyle(0x000000, 1);
    for (const [ex, ey, ew, eh] of eyes) graphics.fillEllipse(ex, ey, ew + 4, eh + 4);
    graphics.fillStyle(0x880000, 1);
    for (const [ex, ey, ew, eh] of eyes) graphics.fillEllipse(ex, ey, ew, eh);
    graphics.fillStyle(0xff1100, 1);
    for (const [ex, ey, ew, eh] of eyes) graphics.fillEllipse(ex, ey, ew * 0.6, eh * 0.6);
    graphics.fillStyle(0xff8866, 1);
    for (const [ex, ey, ew, eh] of eyes) graphics.fillEllipse(ex, ey, ew * 0.28, eh * 0.28);

    // Outer spike tips
    graphics.fillStyle(0x220008, 1);
    graphics.fillTriangle(4, 4, 20, 10, 10, 18);   graphics.fillTriangle(92, 4, 86, 18, 76, 10);
    graphics.fillTriangle(4, 72, 10, 58, 20, 68);  graphics.fillTriangle(92, 72, 76, 68, 86, 58);

    // Central void / reality tear
    graphics.fillStyle(0x000000, 1);    graphics.fillEllipse(48, 40, 14, 12);
    graphics.fillStyle(0x880000, 0.5);  graphics.fillEllipse(48, 40, 8, 7);

    graphics.generateTexture('boss-9', 96, 80);
    graphics.clear();

    // ── Boss 10 — Omega: Cosmic perfection (golden mandala) ─────────────
    // Outer void
    graphics.fillStyle(0x000000, 1);
    graphics.fillEllipse(48, 40, 96, 80);

    // Outermost gold ring
    graphics.fillStyle(0xcc8800, 1); graphics.fillEllipse(48, 40, 92, 76);
    graphics.fillStyle(0x000000, 1); graphics.fillEllipse(48, 40, 80, 66);

    // Eight geometric spoke arms
    graphics.fillStyle(0x885500, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = 48 + Math.cos(angle) * 10;
      const y1 = 40 + Math.sin(angle) * 8;
      const x2 = 48 + Math.cos(angle) * 38;
      const y2 = 40 + Math.sin(angle) * 30;
      const x3 = 48 + Math.cos(angle + 0.22) * 36;
      const y3 = 40 + Math.sin(angle + 0.22) * 28;
      graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    }

    // Second ring
    graphics.fillStyle(0xddaa00, 1); graphics.fillEllipse(48, 40, 68, 56);
    graphics.fillStyle(0x000000, 1); graphics.fillEllipse(48, 40, 58, 48);

    // Third ring
    graphics.fillStyle(0xeecc00, 1); graphics.fillEllipse(48, 40, 50, 42);
    graphics.fillStyle(0x000000, 1); graphics.fillEllipse(48, 40, 42, 34);

    // Outer ring gem diamonds (8 positions)
    graphics.fillStyle(0xffdd44, 1);
    for (let i = 0; i < 8; i++) {
      const gx = 48 + Math.cos((i / 8) * Math.PI * 2) * 43;
      const gy = 40 + Math.sin((i / 8) * Math.PI * 2) * 35;
      graphics.fillRect(gx - 3, gy - 3, 6, 6);
    }

    // Inner ring gem diamonds (8 offset)
    graphics.fillStyle(0xffee88, 1);
    for (let i = 0; i < 8; i++) {
      const gx = 48 + Math.cos(((i + 0.5) / 8) * Math.PI * 2) * 32;
      const gy = 40 + Math.sin(((i + 0.5) / 8) * Math.PI * 2) * 26;
      graphics.fillRect(gx - 2, gy - 2, 4, 4);
    }

    // Cosmic central eye (nested rings)
    graphics.fillStyle(0x110800, 1); graphics.fillEllipse(48, 40, 38, 30);
    graphics.fillStyle(0x553300, 1); graphics.fillEllipse(48, 40, 28, 22);
    graphics.fillStyle(0xbb6600, 1); graphics.fillEllipse(48, 40, 20, 16);
    graphics.fillStyle(0xffaa00, 1); graphics.fillEllipse(48, 40, 12, 10);
    graphics.fillStyle(0xffdd66, 1); graphics.fillEllipse(48, 40, 6, 5);
    graphics.fillStyle(0xffffff, 1); graphics.fillEllipse(48, 40, 2, 2);

    graphics.generateTexture('boss-10', 96, 80);
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
