import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  threatSeverity?: 'critical' | 'warning' | 'nominal';
  mode?: 'waveform' | 'spectrum' | 'dual';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isActive,
  threatSeverity = 'nominal',
  mode = 'dual',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<'dual' | 'waveform' | 'spectrum'>(mode);
  const [currentDb, setCurrentDb] = useState<number>(-48);
  const [detectedPeakFreq, setDetectedPeakFreq] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timeDomainData: Uint8Array<ArrayBuffer>;
    let frequencyData: Uint8Array<ArrayBuffer>;

    if (analyser) {
      timeDomainData = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      frequencyData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } else {
      timeDomainData = new Uint8Array(new ArrayBuffer(512));
      frequencyData = new Uint8Array(new ArrayBuffer(256));
    }

    const render = () => {
      // Handle canvas resolution
      const width = canvas.width;
      const height = canvas.height;

      // Pure black canvas background (no blue tint)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle neutral grey telemetry grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridStepX = width / 8;
      const gridStepY = height / 4;

      for (let x = 0; x < width; x += gridStepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyser && isActive) {
        analyser.getByteTimeDomainData(timeDomainData);
        analyser.getByteFrequencyData(frequencyData);

        // Calculate peak frequency & RMS volume
        let maxVal = 0;
        let maxIndex = 0;
        let sumSquares = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          if (frequencyData[i] > maxVal) {
            maxVal = frequencyData[i];
            maxIndex = i;
          }
          sumSquares += frequencyData[i] * frequencyData[i];
        }
        const nyquist = analyser.context.sampleRate / 2;
        const peakHz = Math.round((maxIndex * nyquist) / frequencyData.length);
        const rms = Math.sqrt(sumSquares / frequencyData.length);
        const db = Math.round(20 * Math.log10((rms + 1) / 256));

        setDetectedPeakFreq(peakHz);
        setCurrentDb(Math.max(-72, Math.min(0, db)));

        // Color palette based on threat severity
        const glowColor =
          threatSeverity === 'critical'
            ? '#ef4444'
            : threatSeverity === 'warning'
            ? '#f59e0b'
            : '#10b981';

        // 1. WAVEFORM DRAWING
        if (viewMode === 'waveform' || viewMode === 'dual') {
          const waveHeight = viewMode === 'dual' ? height * 0.52 : height;
          ctx.lineWidth = 2;
          ctx.strokeStyle = glowColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = glowColor;

          ctx.beginPath();
          const sliceWidth = width / timeDomainData.length;
          let x = 0;

          for (let i = 0; i < timeDomainData.length; i++) {
            const v = timeDomainData[i] / 128.0; // 0.0 to 2.0
            const y = (v * waveHeight) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.lineTo(width, waveHeight / 2);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }

        // 2. FREQUENCY SPECTRUM BARS DRAWING
        if (viewMode === 'spectrum' || viewMode === 'dual') {
          const startY = viewMode === 'dual' ? height * 0.55 : 0;
          const spectrumHeight = viewMode === 'dual' ? height * 0.42 : height - 10;
          const barCount = 48;
          const barWidth = (width / barCount) - 2;

          for (let i = 0; i < barCount; i++) {
            // Logarithmic grouping for acoustic bioacoustics
            const freqIndex = Math.floor(Math.pow(i / barCount, 1.8) * frequencyData.length);
            const value = frequencyData[freqIndex] || 0;
            const barHeight = (value / 255) * spectrumHeight;

            const barX = i * (barWidth + 2);
            const barY = height - barHeight - 4;

            // Gradient per bar
            const grad = ctx.createLinearGradient(0, barY, 0, height);
            if (threatSeverity === 'critical') {
              grad.addColorStop(0, '#f87171');
              grad.addColorStop(1, '#991b1b');
            } else if (threatSeverity === 'warning') {
              grad.addColorStop(0, '#fbbf24');
              grad.addColorStop(1, '#92400e');
            } else {
              grad.addColorStop(0, '#34d399');
              grad.addColorStop(1, '#065f46');
            }

            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY, barWidth, barHeight);
          }
        }
      } else {
        // Idle ambient scan line
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        ctx.moveTo(0, midY);
        const t = Date.now() / 300;
        for (let x = 0; x < width; x += 4) {
          const idleWave = Math.sin((x / 30) + t) * 2;
          ctx.lineTo(x, midY + idleWave);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, threatSeverity, viewMode]);

  return (
    <div className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-3 space-y-2">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between text-xs border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="font-semibold tracking-wide text-white">
            Real-Time Acoustic Telemetry
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            {isActive ? 'STREAM ACTIVE' : 'STANDBY'}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-800 text-[11px]">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === 'dual' ? 'bg-emerald-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setViewMode('waveform')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === 'waveform' ? 'bg-emerald-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Oscilloscope
          </button>
          <button
            onClick={() => setViewMode('spectrum')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === 'spectrum' ? 'bg-emerald-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
            }`}
          >
            FFT Spectrum
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-32 md:h-36 rounded-lg overflow-hidden border border-zinc-900 bg-black">
        <canvas
          ref={canvasRef}
          width={640}
          height={160}
          className="w-full h-full block"
        />

        {/* HUD Overlay Stats */}
        <div className="absolute top-2 right-2 flex items-center gap-3 text-[10px] font-mono bg-black/85 backdrop-blur px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
          <div>
            PEAK: <span className="text-emerald-400 font-bold">{isActive ? `${detectedPeakFreq} Hz` : '---'}</span>
          </div>
          <div>
            LEVEL: <span className={currentDb > -12 ? 'text-red-400 font-bold' : 'text-white'}>
              {isActive ? `${currentDb} dBFS` : '---'}
            </span>
          </div>
        </div>

        {/* Acoustic Band Label */}
        <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
          20Hz (Infrasound) &larr;&mdash;&mdash;&mdash;&rarr; 8kHz (Ultrasound / Cicadas)
        </div>
      </div>
    </div>
  );
};
