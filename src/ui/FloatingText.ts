import Phaser from 'phaser';

export class FloatingText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, color = '#ffffff') {
    super(scene, x, y, text, {
      color,
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 8, fill: true },
    });

    scene.add.existing(this);
    this.setOrigin(0.5).setDepth(22).setScale(1.35);

    // Pop to normal size, then float up and fade
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 110,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: this,
          y: y - 48,
          alpha: 0,
          duration: 680,
          ease: 'Cubic.easeOut',
          onComplete: () => this.destroy(),
        });
      },
    });
  }
}

