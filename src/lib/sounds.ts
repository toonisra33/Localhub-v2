/**
 * Sound & Haptic Notification Manager
 * Provides loud, unmistakable alert sirens and vibration signals for broadcasts
 * Supports AudioContext unlocking, multiple oscillator harmonics, and mobile vibration
 */

class SoundNotification {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    this.setupUnlockListeners();
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlockAudio();
    };

    ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach((evt) => {
      document.addEventListener(evt, unlock, { capture: true, passive: true });
    });
  }

  /**
   * Unlock AudioContext immediately upon user interaction
   */
  public unlockAudio(): boolean {
    try {
      this.initContext();
      if (this.audioContext) {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            this.isUnlocked = true;
          }).catch(() => {});
        } else if (this.audioContext.state === 'running') {
          this.isUnlocked = true;
        }
      }
      return this.isUnlocked;
    } catch (e) {
      console.warn('Audio unlock warning:', e);
      return false;
    }
  }

  private initContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  getIsMuted() {
    return this.isMuted;
  }

  /**
   * Play mobile tactile vibration (if supported on Android / Mobile)
   */
  private triggerVibration(pattern: number[] = [500, 150, 500, 150, 800]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.debug('Vibration not permitted or not supported', err);
      }
    }
  }

  /**
   * Play high-urgency Broadcast Alert Siren (Loud, multi-tone emergency chime/siren)
   * Designed to immediately grab user attention both inside the app and when waking the device
   */
  playBroadcastAlertSound(severity?: string) {
    if (this.isMuted) return;

    // 1. Mobile Phone Vibration
    this.triggerVibration([500, 150, 500, 150, 800]);

    try {
      this.initContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;

      if (severity === 'urgent' || severity === 'emergency' || severity === 'high') {
        // High Urgency Emergency Siren Tone (International Alert Style: Alternating 853Hz & 960Hz)
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const mainGain = this.audioContext.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sine';

        // Frequency alternating pulses (3 rapid urgent siren bursts)
        const burstTimes = [0, 0.4, 0.8, 1.2];
        burstTimes.forEach((t) => {
          osc1.frequency.setValueAtTime(853, now + t);
          osc1.frequency.linearRampToValueAtTime(960, now + t + 0.18);
          osc1.frequency.setValueAtTime(853, now + t + 0.2);
          osc1.frequency.linearRampToValueAtTime(1050, now + t + 0.35);

          osc2.frequency.setValueAtTime(440, now + t);
          osc2.frequency.linearRampToValueAtTime(880, now + t + 0.2);
        });

        // Gain envelope (loud and prominent)
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
        mainGain.gain.setValueAtTime(0.35, now + 1.4);
        mainGain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(this.audioContext.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.6);
        osc2.stop(now + 1.6);
      } else {
        // Standard Broadcast Chime (3-Tone ascending melody: C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
          if (!this.audioContext) return;
          const noteTime = now + (index * 0.18);
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

          osc.connect(gain);
          gain.connect(this.audioContext.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.5);
        });
      }
    } catch (e) {
      console.warn('Web Audio play failed, falling back:', e);
    }
  }

  /**
   * Trigger mobile tactile vibration only (no audio sound)
   */
  vibrate(pattern: number[] = [150, 80, 150]) {
    this.triggerVibration(pattern);
  }

  /**
   * General notifications: Vibrate only, NO AUDIO SOUND
   * (Audio siren/chime is strictly reserved for Admin Broadcast)
   */
  playAlertSound() {
    this.triggerVibration([150, 80, 150]);
  }

  /**
   * Subtle pleasant tone for new incoming chat messages
   */
  playChatSound() {
    if (this.isMuted) return;
    this.triggerVibration([100, 50, 100]);

    try {
      this.initContext();
      if (!this.audioContext) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.audioContext.currentTime + 0.08);

      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.22);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }
}

export const soundManager = new SoundNotification();
