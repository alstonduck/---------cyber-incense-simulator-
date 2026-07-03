// Web Audio API Premium Synthesizer for Cyber Incense Simulator
// Designed to mimic high-end, smooth, polite, and elegant hardware interfaces (like Apple device feedback)
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup a professional master limiter/compressor to glue and smooth all sounds
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.015, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.12, this.ctx.currentTime);
      
      this.masterCompressor.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getDestination(): AudioNode {
    this.initCtx();
    return this.masterCompressor || this.ctx!.destination;
  }

  // Play an incredibly soft, organic temple wood block (木魚)
  // Re-designed to sound velvety, mellow, and physically hollow, with zero harsh high-frequency transients.
  public playWoodBlock(pitchMultiplier: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      const baseFreq = 210 * pitchMultiplier;
      
      const clickOsc = this.ctx!.createOscillator();
      const bodyOsc = this.ctx!.createOscillator();
      const resonanceOsc = this.ctx!.createOscillator();
      
      const clickGain = this.ctx!.createGain();
      const bodyGain = this.ctx!.createGain();
      const resonanceGain = this.ctx!.createGain();
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      // Lowpass filter to ensure absolute warmth and zero harsh edge
      filter.frequency.setValueAtTime(500 * pitchMultiplier, now);
      filter.Q.setValueAtTime(1.8, now);

      // 1. Velvet Mallet Strike Transient (Very gentle, low-frequency triangle pulse)
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(baseFreq * 2.2, now);
      clickOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 0.012);
      
      clickGain.gain.setValueAtTime(0, now);
      clickGain.gain.linearRampToValueAtTime(0.08, now + 0.001); // Soft 1ms attack prevents popping
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
      
      // 2. Mellow Hollow Chamber (Pure sine wave with elegant exponential decay)
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(baseFreq, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.09);
      
      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(0.32, now + 0.002); // Elegant 2ms attack
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      // 3. Subtle Woody Resonance (Adds physical "wood shell" body to the note)
      resonanceOsc.type = 'sine';
      resonanceOsc.frequency.setValueAtTime(baseFreq * 1.58, now);
      
      resonanceGain.gain.setValueAtTime(0, now);
      resonanceGain.gain.linearRampToValueAtTime(0.06, now + 0.003);
      resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      // Connect all components through their respective gains and filters
      clickOsc.connect(clickGain);
      clickGain.connect(filter);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(filter);

      resonanceOsc.connect(resonanceGain);
      resonanceGain.connect(filter);
      
      filter.connect(dest);
      
      clickOsc.start(now);
      bodyOsc.start(now);
      resonanceOsc.start(now);
      
      clickOsc.stop(now + 0.015);
      bodyOsc.stop(now + 0.1);
      resonanceOsc.stop(now + 0.07);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play an ultra-elegant, smooth tactile interface feedback sound (like an Apple watch haptic tap)
  // Pure, polite, whisper-quiet, and extremely satisfying.
  public playUiClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.02);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.001); // Pristine 1ms attack to eliminate clicks
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);
      
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play a deep, pure, multi-layered temple bell (梵鐘)
  public playBell() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      // Harmonic ratios for a rich, warm, non-harsh bronze bell
      const harmonics = [110, 220, 330, 442, 554, 775];
      const relativeGains = [0.4, 0.25, 0.15, 0.08, 0.04, 0.02];
      const durations = [2.0, 1.6, 1.2, 0.8, 0.5, 0.3];
      
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        const lp = this.ctx!.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly detune to add organic depth
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
        
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(freq * 1.5, now);
        lp.frequency.exponentialRampToValueAtTime(freq * 0.8, now + durations[idx]);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(relativeGains[idx], now + 0.01); // Soft attack to avoid click
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + durations[idx]);
        
        osc.connect(lp);
        lp.connect(gainNode);
        gainNode.connect(dest);
        
        osc.start(now);
        osc.stop(now + durations[idx]);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play a majestic, atmospheric sacred gong (神明降臨)
  public playGong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      // Gong is synthesized using rich, low-passed detuned oscillators to make it warm and luxurious
      const frequencies = [60, 90, 120, 180, 240];
      const relativeGains = [0.5, 0.3, 0.15, 0.08, 0.04];
      const duration = 2.5;
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(110, now + duration);
      filter.Q.setValueAtTime(3, now);
      
      filter.connect(dest);

      frequencies.forEach((freq, idx) => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        
        // Warm triangle and sine mixture
        osc1.type = idx === 0 ? 'sine' : 'triangle';
        osc2.type = 'sine';
        
        // Detune them against each other for gorgeous chorus vibration
        osc1.frequency.setValueAtTime(freq - 0.5, now);
        osc2.frequency.setValueAtTime(freq + 0.7, now);
        
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(relativeGains[idx], now + 0.03); // Warm fade-in
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration * (1 - idx * 0.1));
        
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(filter);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play an ultra-clean, elegant crystal coin chime (功德金幣)
  public playCoin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      // Rapid elegant major-arpeggio chime (reminiscent of premium haptic sweeps)
      // E5 -> G#5 -> B5 -> E6 with absolute pure sine waves and soft attack
      const notes = [659.25, 830.61, 987.77, 1318.51];
      const duration = 0.5;
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        const delay = idx * 0.04;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gainNode.gain.setValueAtTime(0, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.18, now + delay + 0.008); // Eliminate popping clicks
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        
        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play an elegant, warm smoke-breeze swoop (紙灰飛散 / 香氣席捲)
  public playSwoosh() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      const bufferSize = this.ctx!.sampleRate * 0.7; // 0.7 seconds
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate pink-ish noise (softer than harsh white noise)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // Normalize pink-ish noise
        b6 = white * 0.115926;
      }
      
      const noiseSource = this.ctx!.createBufferSource();
      noiseSource.buffer = buffer;
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.7);
      filter.Q.setValueAtTime(2.5, now);
      
      const gainNode = this.ctx!.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);
      
      noiseSource.start(now);
      noiseSource.stop(now + 0.72);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play a sparkling, pure digital glass-chime sweep (神跡加持)
  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      // Pristine pentatonic scale run: C5 -> D5 -> G5 -> C6 -> D6 -> G6 -> C7
      const scale = [523.25, 587.33, 783.99, 1046.50, 1174.66, 1567.98, 2093.00];
      const duration = 0.45;
      
      scale.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        const delay = idx * 0.055;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gainNode.gain.setValueAtTime(0, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.12, now + delay + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        
        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Play a polite, warm, deep-bass drop (功德折損)
  // Instead of an aggressive bleep, a premium warm sub-tone
  public playFail() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const dest = this.getDestination();
      const now = this.ctx!.currentTime;
      
      const osc = this.ctx!.createOscillator();
      const subOsc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();
      
      const duration = 0.55;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.linearRampToValueAtTime(80, now + duration);
      
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(72.5, now);
      subOsc.frequency.linearRampToValueAtTime(40, now + duration);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.Q.setValueAtTime(1.0, now);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.38, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);
      
      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration + 0.05);
      subOsc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}

export const sound = new SoundManager();
