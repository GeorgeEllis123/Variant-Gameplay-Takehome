import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

// --- constants ---

const VIEW_H = 1280;
const VIEW_W = 720;

const CROWD_Y = VIEW_H * 0.73;
const HERO_Y = CROWD_Y - 155;
const POOL_SIZE = 60;
const CROWD_SPEED = 110;            // px/s

// Beat
const BPM = 75;
const BEAT_MS = 60000 / BPM;        // 800 ms

// Wave: every WAVE_EVERY_N_BEATS a group of dancers headbangs.
// The click window is open for the full headbang animation duration.
const WAVE_EVERY_N_BEATS = 2;
const HEADBANGERS_START = 8;        // per wave at streak 0
const HEADBANGERS_MIN = 2;          // minimum per wave

// Streak thresholds
const STREAK_SURF = 5;
const STREAK_DANCE = 15;

// Hero x-movement per event (px).
// Right shift on hit scales up with heroPhase to reward higher streaks.
const SHIFT_HIT = [30, 42, 55];     // indexed by heroPhase (0 / 1 / 2)
const SHIFT_MISS_BEAT = 45;         // left shift when a wave is ignored
const SHIFT_MISSCLICK = 75;         // left shift + streak reset on bad click

// Animation played when the player misclicks and loses their streak.
// Would like a different animation but this is the best I got that fit
const STREAK_BREAK_ANIM = 'DramaticCollapse';

// --- animation lists ---

const CROWD_DANCES = [
  'Dance', 'Dance2', 'DanceEmote', 'TikTokDance', 'TikTokDance2',
  'TikTokDance3', 'TikTokDance4', 'TikTokDance5', 'Dab', 'Moonwalk',
  'FistPump', 'JazzHands', 'Twerk', 'Clapping', 'Clapping2', 'HipTwist',
  'RRRDance', 'PunjabiDance', 'VickyKaushalDance', 'Rapping',
  'IndianClassicalDance', 'newTikTokDance',
];

// --- scene ---

class CrowdSurfScene extends Phaser.Scene {
  constructor() { super('CrowdSurfScene'); }

  preload() {
    this.load.spineJson('man', '/spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', '/spine/man/skeleton.atlas', true);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // game state
    this.streak = 0;
    this.gameOver = false;
    this.celebrating = false;
    this.heroPhase = 0;

    // beat / wave state
    this.beatTimer = 0;
    this.beatCount = 0;
    this.waveActive = false;
    this.waveHit = false; // did the player click during this wave?
    this.headbangers = [];
    this.headbangDuration = null;

    // crowd
    this.spawnTimer = 200;
    this.pool = [];

    // background
    this.add.graphics()
      .fillGradientStyle(0x0c0320, 0x0c0320, 0x1a0840, 0x081850, 1)
      .fillRect(0, 0, W, H);

    const spots = this.add.graphics().setDepth(1).setAlpha(0.07);
    spots.fillStyle(0xffffff);
    for (let i = 0; i < 5; i++) {
      const cx = W * 0.1 + i * W * 0.2;
      spots.fillTriangle(cx, 0, cx - 55, H * 0.78, cx + 55, H * 0.78);
    }

    this.add.graphics()
      .fillStyle(0x110830)
      .fillRect(0, CROWD_Y, W, H - CROWD_Y)
      .setDepth(2);

    this.add.graphics()
      .lineStyle(2, 0x8855cc, 0.7)
      .lineBetween(0, CROWD_Y, W, CROWD_Y)
      .setDepth(3);

    // crowd
    for (let i = 0; i < POOL_SIZE; i++) {
      const s = this.add.spine(-400, CROWD_Y, 'man', 'manAtlas');
      s.setScale(0.25).setDepth(10);
      s.setActive(false).setVisible(false);
      s.isHeadbanger = false;
      s.currentDance = null;
      s.baseY = CROWD_Y;
      this.pool.push(s);
    }

    // hero - cannot go further right than W/2 
    this.heroStartX = W * 0.38; // starts slightly left of center
    this.hero = this.add.spine(this.heroStartX, HERO_Y, 'man', 'manAtlas');
    this.hero.setScale(0.30).setDepth(20);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, 'FlyHorizontal', true);

    // UI
    this.streakTxt = this.add.text(W / 2, 16, 'Streak: 0', {
      fontSize: '30px', color: '#ffffff',
      fontFamily: 'system-ui', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(30);

    this.feedbackTxt = this.add.text(W / 2, H * 0.28, '', {
      fontSize: '46px', fontFamily: 'system-ui',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    this.milestoneTxt = this.add.text(16, 16, '', {
      fontSize: '15px', color: '#aaaacc', fontFamily: 'system-ui',
    }).setOrigin(0, 0).setDepth(30);
    this._updateMilestoneTxt();

    const hint = this.add.text(W / 2, H * 0.48, 'TAP when the crowd headbangs!', {
      fontSize: '20px', color: '#ccccee',
      fontFamily: 'system-ui', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(35).setAlpha(0.9);
    this.tweens.add({ targets: hint, alpha: 0, delay: 2800, duration: 700, ease: 'Cubic.easeIn' });

    // input
    this.input.on('pointerdown', this.onTap, this);
    this.input.keyboard?.on('keydown-SPACE', this.onTap, this);

    // randomize crowd
    for (let i = 0; i < 20; i++) this.spawnCrowd(40 + i * 65);
  }

  // --- game loop ---

  update(_, deltaMs) {
    if (this.gameOver) return;
    const dt = deltaMs / 1000;

    this.beatTimer += deltaMs;
    if (this.beatTimer >= BEAT_MS) {
      this.beatTimer -= BEAT_MS;
      this.beatCount++;
      if (this.beatCount % WAVE_EVERY_N_BEATS === 0) {
        this._triggerWave();
      }
    }

    for (const c of this.pool) {
      if (!c.active) {
        continue;
      }
      c.x -= CROWD_SPEED * dt;
      if (c.x < -100) {
        this.returnToPool(c);
      }
    }

    this.spawnTimer -= deltaMs;
    if (this.spawnTimer <= 0) {
      this.spawnCrowd(this.scale.width + 60);
      this.spawnTimer = Math.max(180, 700 - this.streak * 8);
    }
  }

  // wave of headbangers - player should click during this to score

  _triggerWave() {
    if (this.waveActive) {
      return;
    }

    if (!this.headbangDuration) {
      const ref  = this.pool.find(c => c.active);
      if (ref) {
        const anim = ref.skeleton.data.findAnimation('Headbang');
        if (anim) {
          this.headbangDuration = anim.duration;
        } else {
          this.headbangDuration = 0.6;
        }
      }
    }
    let dur;
    if (this.headbangDuration != null) {
      dur = this.headbangDuration;
    } else {
      dur = 0.6;
    }

    // Number of headbangers decreases as streak grows
    const n = Math.max(HEADBANGERS_MIN, HEADBANGERS_START - Math.floor(this.streak / 2));

    const W = this.scale.width;
    const candidates = this.pool.filter(c => c.active && !c.isHeadbanger && c.x > 0 && c.x < W);
    Phaser.Utils.Array.Shuffle(candidates);
    const chosen = candidates.slice(0, n);
    if (chosen.length === 0) {
      return;
    }

    for (const c of chosen) {
      c.isHeadbanger = true;
      this.headbangers.push(c);
      c.animationState.setAnimation(0, 'Headbang', false);
    }

    this.waveActive = true;
    this.waveHit    = false;

    this.time.delayedCall(dur * 1000, () => this._endWave());
  }

  _endWave() {
    // If the player never clicked during this wave, slide them left
    if (!this.waveHit && !this.gameOver) {
      this._slideHero(-SHIFT_MISS_BEAT);
    }

    for (const c of this.headbangers) {
      if (c.active) {
        c.animationState.setAnimation(0, c.currentDance, true);
      }
      c.isHeadbanger = false;
    }
    this.headbangers = [];
    this.waveActive  = false;
  }

  // hero sliding

  _slideHero(delta) {
    if (this.gameOver) {
      return;
    }

    const W = this.scale.width;
    const targetX = this.hero.x + delta;

    this.tweens.killTweensOf(this.hero);

    if (targetX < 0) {
      // Slide off screen then trigger game over
      this.tweens.add({
        targets: this.hero, x: -150,
        duration: 350, ease: 'Sine.easeIn',
        onComplete: () => { if (!this.gameOver) this.endGame(); },
      });
    } else {
      this.tweens.add({
        targets: this.hero,
        x: Math.min(targetX, W / 2),
        duration: 280,
        ease: 'Sine.easeOut',
      });
    }
  }

  // crowd "pool" management

  getFromPool() {
    const found = this.pool.find(c => !c.active);
    if (found) {
      return found;
    } else {
      return null;
    }
  }

  returnToPool(c) {
    c.setActive(false).setVisible(false);
    c.isHeadbanger = false;
    c.currentDance = null;
    const i = this.headbangers.indexOf(c);
    if (i !== -1) {
      this.headbangers.splice(i, 1);
    } 
  }

  // crowd spawning

  spawnCrowd(x) {
    const c = this.getFromPool();
    if (!c) {
      return;
    }

    c.baseY = CROWD_Y + Phaser.Math.Between(-12, 12);
    c.x = x;
    c.y = c.baseY;
    c.setActive(true).setVisible(true);
    c.skeleton.scaleX = -Math.abs(c.skeleton.scaleX);

    c.currentDance = Phaser.Utils.Array.GetRandom(CROWD_DANCES);
    c.isHeadbanger = false;
    c.animationState.setAnimation(0, c.currentDance, true);
  }

  // tap handler

  onTap() {
    if (this.gameOver || this.celebrating) {
      return;
    }

    const W = this.scale.width;
    const hasTarget = this.waveActive && !this.waveHit && this.headbangers.some(c => c.active && c.x > 0 && c.x < W);

    if (hasTarget) {
      this.onHit();
    } else {
      this.onMiss();
    }
  }

  // hit

  onHit() {
    this.waveHit = true;
    this.waveActive = false; // close window - one score per wave

    this.streak++;
    this.streakTxt.setText(`Streak: ${this.streak}`);
    this.showFeedback('🔥 NICE!', '#ffdd00');
    this._updateMilestoneTxt();

    // Slide right - bonus shift scales with heroPhase
    let shift;
    if (SHIFT_HIT[this.heroPhase] != null) {
      shift = SHIFT_HIT[this.heroPhase];
    } else {
      shift = SHIFT_HIT[0];
    }
    this._slideHero(shift);

    // Upgrade hero at streak thresholds
    if (this.heroPhase === 0 && this.streak >= STREAK_SURF) {
      this._upgradeHero(1, 'Surfing', "SURFING ON 'EM!");
    } else if (this.heroPhase === 1 && this.streak >= STREAK_DANCE) {
      this._upgradeHero(2, 'TikTokDance', "DANCING ON 'EM'!");
    }
  }

  // miss

  onMiss() {
    const prevPhase = this.heroPhase; // capture before reset
    this.streak = 0;
    this.heroPhase = 0;
    this.streakTxt.setText('Streak: 0');
    this.showFeedback('miss...', '#ff4455');
    this._slideHero(-SHIFT_MISSCLICK);
    this._updateMilestoneTxt();

    this.celebrating = true;
    if (prevPhase > 0) {
      // Was surfing or dancing — play dramatic collapse then recover
      this.hero.animationState.setAnimation(0, STREAK_BREAK_ANIM, false);
      this.hero.animationState.addAnimation(0, 'FlyHorizontal', true, 0);
      this.time.delayedCall(900, () => { this.celebrating = false; });
    } else {
      // Already in base mode — skip the collapse, just snap back
      this.hero.animationState.setAnimation(0, 'FlyHorizontal', true);
      this.time.delayedCall(150, () => { this.celebrating = false; });
    }
  }

  // hero upgrade (does a backflip to hide animation shift)

  _upgradeHero(newPhase, loopAnim, msg) {
    this.celebrating = true;
    this.heroPhase = newPhase;

    this.hero.animationState.setAnimation(0, 'Backflip', false);
    this.hero.animationState.addAnimation(0, loopAnim, true, 0);

    this.showFeedback(msg, '#88ffcc', 2200);
    this._updateMilestoneTxt();

    this.time.delayedCall(1900, () => { this.celebrating = false; });
  }

  // game over

  endGame() {
    this.gameOver = true;
    this.tweens.killTweensOf(this.hero);

    // Drop hero down to crowd level
    this.tweens.add({
      targets: this.hero,
      y: CROWD_Y + 10,
      duration: 380,
      ease: 'Cubic.easeIn',
    });

    this.hero.animationState.setAnimation(0, 'DramaticCollapse', false);

    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, 520, 300, 0x000000, 0.85).setDepth(40);

    this.add.text(W / 2, H / 2 - 80, 'DROPPED! 😵', {
      fontSize: '52px', color: '#ff4455',
      fontFamily: 'system-ui', stroke: '#000000', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(41);

    this.add.text(W / 2, H / 2 + 5, `Best streak: ${this.streak}`, {
      fontSize: '36px', color: '#ffffff',
      fontFamily: 'system-ui', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(41);

    const restart = this.add.text(W / 2, H / 2 + 90, '[ tap to restart ]', {
      fontSize: '22px', color: '#aaddff', fontFamily: 'system-ui',
    }).setOrigin(0.5).setDepth(41).setInteractive();

    restart.on('pointerdown', () => this.scene.restart());
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.restart());
  }

  // feedback flash

  showFeedback(msg, color, duration = 750) {
    this.feedbackTxt.setText(msg).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.feedbackTxt);
    this.tweens.add({ targets: this.feedbackTxt, alpha: 0, duration, ease: 'Cubic.easeIn' });
  }

  // UI helpers

  _updateMilestoneTxt() {
    if (this.heroPhase === 0) {
      const need = STREAK_SURF - this.streak;
      if (need > 0) {
        this.milestoneTxt?.setText(`${need} more to surf!`);
      } else {
        this.milestoneTxt?.setText('');
      }
    } else if (this.heroPhase === 1) {
      const need = STREAK_DANCE - this.streak;
      if (need > 0) {
        this.milestoneTxt?.setText(`${need} more to dance!`);
      } else {
        this.milestoneTxt?.setText('');
      }
    } else {
      this.milestoneTxt?.setText('MAX STEAK!');
    }
}
}

// --- boot ---

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#0c0320',
  scene: [CrowdSurfScene],
  plugins: {
    scene: [{ key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
