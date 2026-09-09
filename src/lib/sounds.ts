class SoundNotification {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Try to unlock audio context on first user interaction
    const unlock = () => {
      if (this.isUnlocked) return;
      try {
        this.initContext();
        if (this.audioContext && this.audioContext.state !== 'suspended') {
          this.isUnlocked = true;
          // Clean up listeners once unlocked
          document.removeEventListener('click', unlock);
          document.removeEventListener('touchstart', unlock);
          document.removeEventListener('keydown', unlock);
        }
      } catch (e) {
        console.warn('Audio unlock failed', e);
      }
    };
    
    // Add interaction listeners to unlock AudioContext
    if (typeof window !== 'undefined') {
      document.addEventListener('click', unlock, { once: true, capture: true });
      document.addEventListener('touchstart', unlock, { once: true, capture: true });
      document.addEventListener('keydown', unlock, { once: true, capture: true });
    }
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
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

  playChatSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  playAlertSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(880, this.audioContext.currentTime + 0.6);
      osc.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.8);
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.75);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.8);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }
}

export const soundManager = new SoundNotification();
