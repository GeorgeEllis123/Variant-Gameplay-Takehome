import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

/** Portrait 9:16 — same aspect as Variant games (e.g. 720×1280). */
const VIEW_W = 720;
const VIEW_H = 1280;

/** Shared Variant man rig — see public/spine/man/animations.json & ANIMATIONS.md */
const DEMO_WALK = 'Walk';
const DEMO_JUMP = 'Jump';

class HelloScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HelloScene' });
    this.hero = null;
    this.walkSpeed = 200;
    this.direction = 1;
  }

  preload() {
    this.load.spineJson('man', '/spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', '/spine/man/skeleton.atlas', true);
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 20, 'Hello world — shared man Spine walks (public/spine/man/)', {
        fontSize: '14px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 44, 'Gray silhouette = CDN placeholder base sheet; npm run copy-spine for real skin', {
        fontSize: '11px',
        color: '#8a9',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);

    this.hero = this.add.spine(width * 0.2, height * 0.72, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.28);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, DEMO_WALK, true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.hero.animationState.setAnimation(0, DEMO_JUMP, false);
      this.hero.animationState.addAnimation(0, DEMO_WALK, true, 0);
    });

    this.add
      .text(width / 2, height - 36, 'Animations: public/spine/man/animations.json & ANIMATIONS.md', {
        fontSize: '16px',
        color: '#889'
      })
      .setOrigin(0.5, 1);
  }

  update(_, deltaMs) {
    if (!this.hero) return;
    const dt = deltaMs / 1000;
    const w = this.scale.width;
    this.hero.x += this.walkSpeed * this.direction * dt;

    const margin = 72;
    if (this.hero.x > w - margin) {
      this.hero.x = w - margin;
      this.direction = -1;
      this.hero.skeleton.scaleX = -Math.abs(this.hero.skeleton.scaleX);
    } else if (this.hero.x < margin) {
      this.hero.x = margin;
      this.direction = 1;
      this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);
    }
  }
}

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#2d2d44',
  scene: [HelloScene],
  plugins: {
    scene: [{ key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
