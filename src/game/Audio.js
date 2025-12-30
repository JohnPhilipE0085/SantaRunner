import jumpSound from '../assets/jump.mp3';
import overSound from '../assets/over.mp3';

export class Audio {
    constructor() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.ready = false;
            this.jumpBuffer = null;
            this.overBuffer = null;
            this.currentSource = null;

            // Preload sounds
            this.loadSound(jumpSound, 'jumpBuffer');
            this.loadSound(overSound, 'overBuffer');
        } catch (e) {
            console.error("Audio init failed:", e);
            this.ready = false;
        }
    }

    async loadSound(url, bufferName) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this[bufferName] = await this.ctx.decodeAudioData(arrayBuffer);
            if (this.jumpBuffer && this.overBuffer) this.ready = true; // Ready when all vital sounds loaded
        } catch (e) {
            console.error(`Failed to load sound ${url}:`, e);
        }
    }

    stopCurrentSound() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignore errors (e.g. if already stopped)
            }
            this.currentSource = null;
        }
    }

    playJump() {
        if (!this.ready || !this.jumpBuffer) return;
        this.stopCurrentSound();
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const source = this.ctx.createBufferSource();
            this.currentSource = source;
            source.buffer = this.jumpBuffer;

            const gainNode = this.ctx.createGain();
            gainNode.gain.value = 0.5;

            source.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            source.onended = () => {
                if (this.currentSource === source) {
                    this.currentSource = null;
                }
            };

            source.start(0);
        } catch (e) {
            console.error("Play jump failed:", e);
        }
    }

    playScore() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playGameOver() {
        if (!this.overBuffer) return;
        this.stopCurrentSound();
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const source = this.ctx.createBufferSource();
            this.currentSource = source;
            source.buffer = this.overBuffer;

            const gainNode = this.ctx.createGain();
            gainNode.gain.value = 0.6; // Slightly higher volume for impact

            source.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            source.onended = () => {
                if (this.currentSource === source) {
                    this.currentSource = null;
                }
            };

            source.start(0);
        } catch (e) {
            console.error("Play game over failed:", e);
        }
    }

    playMilestone() {
        if (!this.ready) return;
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const now = this.ctx.currentTime;

            // Simple Major Triad (Fanfare)
            [440, 554, 659].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                gain.gain.setValueAtTime(0.1, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.5);
            });

        } catch (e) { console.error(e); }
    }
}
