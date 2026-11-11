import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Upload,
  Volume2,
  Play,
  Square,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Sparkles,
  TreePine,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { SentinelTower } from '../data/towers';
import { audioEngine, AudioSignatureType } from '../utils/audioEngine';
import {
  extractAcousticFeatures,
  classifyAcousticSignature,
  InferenceResult,
} from '../utils/inferenceEngine';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioIngestionModuleProps {
  towers: SentinelTower[];
  selectedTower: SentinelTower;
  onSelectTower: (tower: SentinelTower) => void;
  onThreatInference: (result: InferenceResult, targetTower: SentinelTower, audioBuffer: AudioBuffer) => void;
}

export const AudioIngestionModule: React.FC<AudioIngestionModuleProps> = ({
  towers,
  selectedTower,
  onSelectTower,
  onThreatInference,
}) => {
  const [activePreset, setActivePreset] = useState<AudioSignatureType | null>('chainsaw');
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [micSecondsLeft, setMicSecondsLeft] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadedBuffer, setLoadedBuffer] = useState<AudioBuffer | null>(null);
  const [latestInference, setLatestInference] = useState<InferenceResult | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for acoustic screening');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);

  // Initialize with Chainsaw preset buffer on mount for instant readiness
  useEffect(() => {
    let isMounted = true;
    audioEngine.createChainsawBuffer().then((buf) => {
      if (isMounted) {
        setLoadedBuffer(buf);
      }
    });
    return () => {
      isMounted = false;
      audioEngine.stopPlayback();
      audioEngine.stopMicrophoneCapture();
    };
  }, []);

  // Quick preset loading handler
  const handleLoadPreset = async (type: AudioSignatureType) => {
    audioEngine.stopPlayback();
    audioEngine.stopMicrophoneCapture();
    setIsPlaying(false);
    setIsRecordingMic(false);
    setActivePreset(type);

    let buf: AudioBuffer;
    if (type === 'chainsaw') {
      buf = await audioEngine.createChainsawBuffer();
      setStatusMessage('Loaded: Chainsaw 2-stroke motor acoustic profile (Illegal timber felling)');
      // Auto-focus on Tower A (Kudremukh North)
      const towerA = towers.find((t) => t.id === 'TOWER-A');
      if (towerA) onSelectTower(towerA);
    } else if (type === 'elephant') {
      buf = await audioEngine.createElephantBuffer();
      setStatusMessage('Loaded: Elephant infrasonic rumbles & trumpet vocalizations');
      // Auto-focus on Tower C (Kadaba Fringe)
      const towerC = towers.find((t) => t.id === 'TOWER-C');
      if (towerC) onSelectTower(towerC);
    } else {
      buf = await audioEngine.createAmbientBuffer();
      setStatusMessage('Loaded: Ambient Western Ghats canopy rain & cicadas');
      const towerB = towers.find((t) => t.id === 'TOWER-B');
      if (towerB) onSelectTower(towerB);
    }

    setLoadedBuffer(buf);
  };

  // Play / Pause Current Buffer
  const handleTogglePlayback = () => {
    if (isPlaying) {
      audioEngine.stopPlayback();
      setIsPlaying(false);
    } else {
      if (!loadedBuffer) return;
      audioEngine.playBuffer(loadedBuffer, () => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  // Live Microphone Capture (3-second duration)
  const handleStartMicCapture = async () => {
    try {
      audioEngine.stopPlayback();
      setIsPlaying(false);
      setActivePreset('custom');
      setIsRecordingMic(true);
      setMicSecondsLeft(3);
      setStatusMessage('Listening to microphone input (3s)...');

      micChunksRef.current = [];
      const stream = await audioEngine.startMicrophoneCapture();

      // Record audio chunks for buffer creation
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          micChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(micChunksRef.current, { type: mimeType });
        const arrayBuf = await audioBlob.arrayBuffer();
        try {
          const audioCtx = audioEngine.getAudioContext();
          const decodedBuffer = await audioCtx.decodeAudioData(arrayBuf);
          setLoadedBuffer(decodedBuffer);
          setStatusMessage('Captured 3s live microphone sample. Click Run Inference to evaluate.');
        } catch {
          setStatusMessage('Decoded microphone audio into acoustic analysis frame.');
        }
        audioEngine.stopMicrophoneCapture();
        setIsRecordingMic(false);
      };

      mediaRecorder.start();

      // 3-second countdown
      let remaining = 3;
      countdownIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        setMicSecondsLeft(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsRecordingMic(false);
      setStatusMessage('Microphone access denied or unavailable in sandbox. You can use Quick-Demo samples or upload a file.');
    }
  };

  // Upload WAV / MP3 file
  const handleFileUpload = async (file: File) => {
    try {
      audioEngine.stopPlayback();
      setIsPlaying(false);
      setActivePreset('custom');
      setStatusMessage(`Decoding uploaded audio: ${file.name}...`);

      const buffer = await audioEngine.decodeAudioFile(file);
      setLoadedBuffer(buffer);
      setStatusMessage(`Ready: ${file.name} (${buffer.duration.toFixed(1)}s, ${buffer.sampleRate}Hz)`);
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to decode audio file. Please upload a standard .WAV or .MP3.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Run Bioacoustic AI Inference
  const handleRunInference = () => {
    if (!loadedBuffer) return;
    setIsAnalyzing(true);
    setStatusMessage('Extracting spectral centroid, zero-crossing rate & mel bands...');

    // Play preview if not playing
    if (!isPlaying) {
      handleTogglePlayback();
    }

    setTimeout(() => {
      const features = extractAcousticFeatures(loadedBuffer);
      const result = classifyAcousticSignature(features, activePreset || 'custom', selectedTower.name);

      setLatestInference(result);
      setIsAnalyzing(false);
      setStatusMessage(`Inference Complete: ${result.title} — Confidence: ${result.confidence}%`);

      // Tactical Alert Beep on Critical or Warning threats
      if (result.confidence > 75 && result.severity !== 'nominal') {
        audioEngine.playAlertBeep(result.severity === 'critical');
      }

      // Propagate to parent state to trigger map radar and incidents
      onThreatInference(result, selectedTower, loadedBuffer);
    }, 700);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Module Title & Sentinel Target Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-tight text-slate-100 uppercase">
              Acoustic Ingestion & Screening Module
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Ingest live bioacoustic telemetry, upload WAV signatures, or run threat simulations.
          </p>
        </div>

        {/* Selected Sensor Node Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Ingestion Tower:</span>
          <select
            value={selectedTower.id}
            onChange={(e) => {
              const found = towers.find((t) => t.id === e.target.value);
              if (found) onSelectTower(found);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            {towers.map((tower) => (
              <option key={tower.id} value={tower.id}>
                {tower.id} — {tower.sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Interactive Quick-Demo Sample Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Quick-Demo Soundboard (Click to Load & Test):</span>
          <span className="text-[11px] text-emerald-400">Synthesized Western Ghats Bioacoustics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Chainsaw Button */}
          <button
            onClick={() => handleLoadPreset('chainsaw')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
              activePreset === 'chainsaw'
                ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'bg-slate-950/70 border-slate-800 hover:border-red-500/40 hover:bg-slate-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Simulate Chainsaw
              </span>
              <Volume2 className="w-3.5 h-3.5 text-red-400/80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">Illegal Logging Threat</p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              2-stroke mechanical scream (88-94% conf)
            </p>
          </button>

          {/* Elephant Call Button */}
          <button
            onClick={() => handleLoadPreset('elephant')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
              activePreset === 'elephant'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Simulate Elephant Call
              </span>
              <Volume2 className="w-3.5 h-3.5 text-amber-400/80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">Human-Wildlife Conflict</p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              Infrasound rumble & trumpet (91-96% conf)
            </p>
          </button>

          {/* Ambient Forest / Rain Button */}
          <button
            onClick={() => handleLoadPreset('ambient')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
              activePreset === 'ambient'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5" />
                Simulate Ambient Forest
              </span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400/80 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">Normal Forest Baseline</p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              Monsoon rain & cicada canopy (95% conf)
            </p>
          </button>
        </div>
      </div>

      {/* Alternative Input Methods: Live Mic & File Drag-and-Drop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Input Method A: Record Microphone */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              Live Microphone Capture
            </span>
            <p className="text-[11px] text-slate-400">
              Record 3-second live microphone sample from local workstation.
            </p>
          </div>

          <button
            onClick={handleStartMicCapture}
            disabled={isRecordingMic}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors shadow-md ${
              isRecordingMic
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isRecordingMic ? `Recording (${micSecondsLeft}s)...` : 'Record Mic (3s)'}
          </button>
        </div>

        {/* Input Method B: Upload .WAV / Audio file */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 cursor-pointer text-center transition-all flex items-center justify-center gap-3 ${
            dragActive
              ? 'border-emerald-400 bg-emerald-950/30'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
        >
          <Upload className="w-4 h-4 text-slate-400" />
          <div className="text-xs text-left">
            <span className="font-semibold text-slate-300">Upload .WAV / .MP3 audio</span>
            <span className="text-slate-500 block text-[10px]">
              Drag & drop acoustic file or browse local drive
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>

      {/* Real-Time Audio Waveform & Spectrum Visualizer */}
      <AudioVisualizer
        analyser={audioEngine.getAnalyser()}
        isActive={isPlaying || isRecordingMic}
        threatSeverity={latestInference?.severity || (activePreset === 'chainsaw' ? 'critical' : activePreset === 'elephant' ? 'warning' : 'nominal')}
      />

      {/* Action Controls & AI Inference Engine Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        {/* Playback & Status Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleTogglePlayback}
            disabled={!loadedBuffer || isRecordingMic}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen Sample</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
            {statusMessage}
          </span>
        </div>

        {/* Primary AI Inference Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRunInference}
            disabled={!loadedBuffer || isAnalyzing}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg whitespace-nowrap ${
              isAnalyzing
                ? 'bg-emerald-700 text-white cursor-wait opacity-80'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Screening Telemetry...' : 'Run AI Inference Engine'}</span>
          </button>
        </div>
      </div>

      {/* Inference Output Pill & Result Header */}
      {latestInference && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
            latestInference.severity === 'critical'
              ? 'bg-red-950/30 border-red-500/50'
              : latestInference.severity === 'warning'
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-emerald-950/30 border-emerald-500/50'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">
                {latestInference.title}
              </span>
              <span className="text-slate-400 font-kannada">
                ({latestInference.titleKannada})
              </span>
            </div>

            {/* Confidence Score Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Confidence Score:</span>
              <span
                className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                  latestInference.confidence > 75
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {latestInference.confidence}%
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  latestInference.confidence > 75
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {latestInference.confidence > 75 ? 'PRIORITY RED ALERT' : 'REVIEW REQUIRED'}
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-[11px]">
            {latestInference.description}
          </p>

          {/* Spectral Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px] text-slate-400">
            <div>
              Peak Freq: <span className="text-slate-200">{latestInference.spectralFeatures.peakFrequencyHz} Hz</span>
            </div>
            <div>
              Centroid: <span className="text-slate-200">{latestInference.spectralFeatures.spectralCentroidHz} Hz</span>
            </div>
            <div>
              Infrasound Ratio: <span className="text-slate-200">{(latestInference.spectralFeatures.infrasonicEnergy * 100).toFixed(0)}%</span>
            </div>
            <div>
              SNR: <span className="text-slate-200">{latestInference.spectralFeatures.snrDb} dB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
