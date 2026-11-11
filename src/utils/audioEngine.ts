/**
 * Aranya-Drishti Web Audio Engine
 * Provides authentic synthesized acoustic signatures (Chainsaw, Elephant rumble/trumpet, Ambient Forest),
 * live microphone recording, audio file ingestion, and real-time Web Audio Analyser visualization.
 */

export type AudioSignatureType = 'chainsaw' | 'elephant' | 'ambient' | 'custom';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private isPlaying = false;
  private currentBuffer: AudioBuffer | null = null;
  private playbackStartTime = 0;
  private pauseOffset = 0;

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode {
    const ctx = this.getAudioContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.82;
    }
    return this.analyser;
  }

  /**
   * Generates a 2-stroke chainsaw motor sound (4.5s)
   * High-rev mechanical scream with engine throttle modulation and cutting rasp
   */
  public async createChainsawBuffer(): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const duration = 5.0;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Throttle profile: idle -> rev 1 -> heavy cut -> rev 2 -> idle
      let throttle = 0.3;
      if (t > 0.6 && t < 1.8) {
        throttle = 0.85 + 0.12 * Math.sin(t * 8); // revving up
      } else if (t >= 1.8 && t < 3.5) {
        throttle = 0.72 + 0.15 * Math.sin(t * 14); // cutting into timber trunk
      } else if (t >= 3.5 && t < 4.4) {
        throttle = 0.92; // peak rev scream
      }

      // Fundamental engine firing frequency (80Hz idle up to 260Hz screaming 2-stroke)
      const baseFreq = 75 + throttle * 190;
      
      // Multi-harmonic sawtooth wave simulating 2-stroke cylinder combustions
      const phase = (t * baseFreq) % 1;
      let saw = 2 * phase - 1;
      
      // Sub-harmonic cylinder rattle (40-60Hz)
      const subRattle = Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.4;
      
      // High harmonic metallic tooth chatter
      const toothHarmonic = Math.sin(2 * Math.PI * (baseFreq * 5.2) * t) * 0.25;
      
      // Mechanical raspy exhaust noise
      const noise = (Math.random() * 2 - 1) * (0.35 + throttle * 0.25);
      
      // Amplitude envelope (fade in / fade out)
      let env = 1.0;
      if (t < 0.2) env = t / 0.2;
      if (t > duration - 0.3) env = (duration - t) / 0.3;

      data[i] = (saw * 0.45 + subRattle + toothHarmonic + noise * 0.35) * env * 0.85;
    }

    return buffer;
  }

  /**
   * Generates an Asian Elephant vocalization buffer (4.8s)
   * Deep infrasonic chest rumble (18-30 Hz) transitioning into dramatic trumpet call
   */
  public async createElephantBuffer(): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const duration = 4.8;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Infrasonic rumble (0s - 2.5s)
      if (t < 2.6) {
        const rumbleEnv = Math.sin((t / 2.6) * Math.PI);
        // Low frequency carrier (22 Hz fundamental) + 44 Hz harmonic
        const f1 = 22 + Math.sin(t * 3.5) * 3;
        const rumble1 = Math.sin(2 * Math.PI * f1 * t);
        const rumble2 = Math.sin(2 * Math.PI * (f1 * 2) * t) * 0.6;
        const rumble3 = Math.sin(2 * Math.PI * (f1 * 3) * t) * 0.3;
        // Guttural amplitude tremolo
        const tremolo = 0.7 + 0.3 * Math.sin(2 * Math.PI * 9.5 * t);
        sample += (rumble1 + rumble2 + rumble3) * tremolo * rumbleEnv * 0.7;
      }

      // Elephant Trumpet (1.8s - 4.6s)
      if (t >= 1.7) {
        const trT = t - 1.7;
        const trumpetDuration = 2.9;
        let trumpetEnv = 0;
        if (trT < 0.4) trumpetEnv = trT / 0.4;
        else if (trT < trumpetDuration) trumpetEnv = Math.pow((trumpetDuration - trT) / (trumpetDuration - 0.4), 0.7);

        // Dramatic upward then downward pitch glide (220 Hz -> 480 Hz -> 310 Hz)
        let trumpetFreq = 220;
        if (trT < 0.8) {
          trumpetFreq = 220 + (trT / 0.8) * 260;
        } else {
          trumpetFreq = 480 - ((trT - 0.8) / (trumpetDuration - 0.8)) * 170;
        }

        // Vocal tract vibrato
        const vibrato = Math.sin(2 * Math.PI * 7.2 * trT) * 12;
        const instantFreq = trumpetFreq + vibrato;

        // Brass-like formant harmonics
        const h1 = Math.sin(2 * Math.PI * instantFreq * t);
        const h2 = Math.sin(2 * Math.PI * (instantFreq * 2) * t) * 0.65;
        const h3 = Math.sin(2 * Math.PI * (instantFreq * 3) * t) * 0.45;
        const h4 = Math.sin(2 * Math.PI * (instantFreq * 4) * t) * 0.25;

        // Air breathiness / roar
        const breath = (Math.random() * 2 - 1) * 0.15;

        sample += (h1 + h2 + h3 + h4 + breath) * trumpetEnv * 0.65;
      }

      // Overall gain
      data[i] = Math.max(-1, Math.min(1, sample * 0.9));
    }

    return buffer;
  }

  /**
   * Generates Ambient Western Ghats Forest & Monsoon Rain buffer (4.5s)
   * Canopy rustle, continuous rain drops, and high-frequency cicada pulses
   */
  public async createAmbientBuffer(): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const duration = 4.5;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    let lastNoise = 0;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;

      // Pinkish/brownian noise for soft monsoon rain & wind through canopy
      const white = Math.random() * 2 - 1;
      const rain = (lastNoise + (0.04 * white)) / 1.04;
      lastNoise = rain;

      // Cicadas stridulation bursts (5200 Hz pulsed at 4.2 Hz)
      const cicadaPulse = Math.pow(Math.sin(2 * Math.PI * 4.2 * t) * 0.5 + 0.5, 4);
      const cicadaTone = Math.sin(2 * Math.PI * 5400 * t) * 0.18 + Math.sin(2 * Math.PI * 6200 * t) * 0.1;
      const cicada = cicadaTone * cicadaPulse;

      // Occasional gentle drop impact
      const dropChance = Math.sin(t * 18) > 0.92 ? (Math.random() * 2 - 1) * 0.18 : 0;

      data[i] = (rain * 0.35 + cicada * 0.4 + dropChance) * 0.75;
    }

    return buffer;
  }

  /**
   * Play an AudioBuffer and hook it up to the AnalyserNode
   */
  public playBuffer(
    buffer: AudioBuffer,
    onEnded?: () => void,
    offset = 0
  ): AudioBufferSourceNode {
    const ctx = this.getAudioContext();
    this.stopPlayback();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    this.currentBuffer = buffer;

    const analyser = this.getAnalyser();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.0;

    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    source.onended = () => {
      this.isPlaying = false;
      this.currentSource = null;
      if (onEnded) onEnded();
    };

    source.start(0, offset);
    this.playbackStartTime = ctx.currentTime - offset;
    this.currentSource = source;
    this.isPlaying = true;

    return source;
  }

  public stopPlayback(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  public getPlaybackProgress(): number {
    if (!this.isPlaying || !this.currentBuffer || !this.ctx) return 0;
    const elapsed = this.ctx.currentTime - this.playbackStartTime;
    return Math.min(1, Math.max(0, elapsed / this.currentBuffer.duration));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Start live microphone ingestion with countdown
   */
  public async startMicrophoneCapture(onDataAvailable?: (analyser: AnalyserNode) => void): Promise<MediaStream> {
    const ctx = this.getAudioContext();
    this.stopPlayback();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    this.micStream = stream;

    const micSource = ctx.createMediaStreamSource(stream);
    this.micSource = micSource;

    const analyser = this.getAnalyser();
    micSource.connect(analyser);
    // Note: we do NOT connect micSource to ctx.destination to avoid acoustic feedback howling!

    if (onDataAvailable) {
      onDataAvailable(analyser);
    }

    return stream;
  }

  public stopMicrophoneCapture(): void {
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  /**
   * Decodes an uploaded File (.wav, .mp3, etc.) into an AudioBuffer
   */
  public async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Encodes an AudioBuffer into a WAV Blob
   */
  public audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1); // audio format (1 = PCM)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: 'audio/wav' });
  }

  /**
   * Tactical alert beep tone
   */
  public playAlertBeep(isUrgent = true): void {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 540, ctx.currentTime);
    if (isUrgent) {
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.22);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    }

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isUrgent ? 0.45 : 0.3));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isUrgent ? 0.46 : 0.31));
  }
}

export const audioEngine = new AudioEngine();
