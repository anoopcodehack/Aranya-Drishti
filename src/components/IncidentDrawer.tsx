import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Volume2,
  Play,
  Square,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  Users,
  Radio,
  Clock,
  Compass,
  Battery,
  Sun,
  FileText,
} from 'lucide-react';
import { ThreatIncident, SentinelTower } from '../data/towers';
import { audioEngine } from '../utils/audioEngine';

interface IncidentDrawerProps {
  incident: ThreatIncident | null;
  tower: SentinelTower | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (incidentId: string) => void;
  onDispatch: (incidentId: string, unitName: string) => void;
  onMarkFalsePositive: (incidentId: string) => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  incident,
  tower,
  isOpen,
  onClose,
  onAcknowledge,
  onDispatch,
  onMarkFalsePositive,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedPatrolUnit, setSelectedPatrolUnit] = useState('Kudremukh Anti-Poaching Camp Unit 3');

  if (!isOpen || !incident) return null;

  const isCritical = incident.severity === 'critical';
  const isElephant = incident.threatType === 'elephant';

  const handlePlayAudioSnippet = async () => {
    if (isPlayingAudio) {
      audioEngine.stopPlayback();
      setIsPlayingAudio(false);
    } else {
      let buf: AudioBuffer;
      if (incident.threatType === 'chainsaw') {
        buf = await audioEngine.createChainsawBuffer();
      } else if (incident.threatType === 'elephant') {
        buf = await audioEngine.createElephantBuffer();
      } else {
        buf = await audioEngine.createAmbientBuffer();
      }

      audioEngine.playBuffer(buf, () => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    }
  };

  const handleConfirmDispatch = () => {
    onDispatch(incident.id, selectedPatrolUnit);
    setIsDispatchModalOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Right */}
      <div className="fixed inset-y-0 right-0 z-[1300] w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`p-2 rounded-lg ${
                  isCritical
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Acoustic Incident Dossier // {incident.id}
                </span>
                <h2 className="text-base font-bold text-slate-100 leading-tight">
                  {incident.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-xs font-kannada text-emerald-400">
            {incident.titleKannada}
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="p-4 sm:p-5 space-y-5 flex-1">
          {/* Status & Confidence Badge Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">THREAT SEVERITY</span>
              <span
                className={`font-bold ${
                  isCritical ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {incident.severity.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">AI CONFIDENCE</span>
              <span className="text-slate-100 font-bold">{incident.confidence}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">STATUS</span>
              <span className="text-emerald-400 font-semibold uppercase">
                {incident.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">TIME DETECTED</span>
              <span className="text-slate-300">{incident.timestamp}</span>
            </div>
          </div>

          {/* Embedded Audio Snippet Player */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Raw Acoustic Sensor Recording ({incident.audioDurationSec}s)
              </span>
              <span className="text-[11px] font-mono text-slate-400">PCM 48kHz / 16-bit</span>
            </div>

            {/* Simulated Scrubber Bar */}
            <div className="space-y-1.5">
              <div className="h-10 bg-slate-950 rounded-lg border border-slate-800/80 relative flex items-center px-3 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/20 border-r-2 border-emerald-400 transition-all"
                  style={{ width: isPlayingAudio ? '100%' : '35%', transitionDuration: isPlayingAudio ? `${incident.audioDurationSec}s` : '0s' }}
                />
                <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>00:0{isPlayingAudio ? '3' : '1'}</span>
                  <span className="text-emerald-400 tracking-widest text-[9px]">
                    {isElephant ? 'INFRASONIC ELEPHANT VOCALIZATION' : '2-STROKE CHAINSAW HARMONICS'}
                  </span>
                  <span>00:0{Math.round(incident.audioDurationSec)}</span>
                </div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePlayAudioSnippet}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingAudio ? 'Stop Playback' : 'Replay Acoustic Snippet'}</span>
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                SNR: {incident.spectralFeatures.snrDb} dB · Peak: {incident.spectralFeatures.peakFrequencyHz} Hz
              </span>
            </div>
          </div>

          {/* Node & Geographic Context */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Sentinel Node Telemetry & Geolocation
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Sensor Node ID</span>
                <span className="font-mono text-slate-200 font-bold">{incident.towerId}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Forest Sector</span>
                <span className="text-slate-200">{incident.sector}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">GPS Coordinates</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {incident.coordinates[0].toFixed(4)}° N, {incident.coordinates[1].toFixed(4)}° E
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Elevation</span>
                <span className="font-mono text-slate-200">{tower?.elevation || 840} meters MSL</span>
              </div>
            </div>

            {tower && (
              <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery {tower.battery}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solar {tower.solarOutput}W</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RSSI {tower.signalRssi} dBm</span>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Patrol Unit (if already dispatched) */}
          {incident.dispatchedUnit && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Patrol Unit Dispatched
                </span>
                <span className="font-mono text-[11px] text-emerald-300">
                  ETA: ~{incident.dispatchedUnit.etaMinutes} mins
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {incident.dispatchedUnit.unitName} ({incident.dispatchedUnit.callSign})
              </p>
              <p className="text-[11px] text-slate-400">
                {incident.dispatchedUnit.personnelCount} Armed Forest Guards en route via 4WD Mahindra Bolero.
              </p>
            </div>
          )}

          {/* Incident Description & Standard Operating Procedure */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Incident Narrative:</span>
            <p className="text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
              {incident.description}
            </p>
          </div>
        </div>

        {/* Drawer Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Acknowledge Button */}
            <button
              onClick={() => onAcknowledge(incident.id)}
              disabled={incident.status === 'acknowledged' || incident.status === 'dispatched'}
              className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{incident.status === 'unacknowledged' ? 'Acknowledge' : 'Acknowledged'}</span>
            </button>

            {/* Dispatch Patrol Team Button */}
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Dispatch Patrol</span>
            </button>

            {/* Mark False Positive Button */}
            <button
              onClick={() => onMarkFalsePositive(incident.id)}
              className="px-3 py-2.5 rounded-lg border border-slate-700 hover:bg-red-950/30 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>False Positive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Patrol Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Dispatch Tactical Forest Patrol Team
              </h3>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select available Western Ghats Forest Division response strike team to deploy to{' '}
              <strong className="text-emerald-400">{incident.towerId}</strong>:
            </p>

            <div className="space-y-2">
              {[
                {
                  name: 'Kudremukh Anti-Poaching Camp Unit 3',
                  callSign: 'TIGER-03',
                  personnel: '6 Forest Guards',
                  eta: '8 mins',
                },
                {
                  name: 'Kadaba Rapid Conflict Mitigation Squad (Elephant ETF)',
                  callSign: 'GAJARAJ-01',
                  personnel: '4 Handlers + Siren Vehicle',
                  eta: '12 mins',
                },
                {
                  name: 'Shiradi Ghat Quick Reaction Unit',
                  callSign: 'GHAT-SCOUT',
                  personnel: '4 Armed Rangers',
                  eta: '16 mins',
                },
              ].map((unit) => (
                <div
                  key={unit.name}
                  onClick={() => setSelectedPatrolUnit(unit.name)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPatrolUnit === unit.name
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">
                      {unit.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {unit.personnel} · Call Sign: {unit.callSign}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    ETA: {unit.eta}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
