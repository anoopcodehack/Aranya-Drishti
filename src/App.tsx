import React, { useState, useEffect } from 'react';
import {
  SENTINEL_TOWERS,
  INITIAL_INCIDENTS,
  SentinelTower,
  ThreatIncident,
} from './data/towers';
import { OperationsMap } from './components/OperationsMap';
import { AudioIngestionModule } from './components/AudioIngestionModule';
import { IncidentDrawer } from './components/IncidentDrawer';
import { IncidentLogTable } from './components/IncidentLogTable';
import { SentinelGridHealth } from './components/SentinelGridHealth';
import { TelegramAlertModal, AlertNotificationData } from './components/TelegramAlertModal';
import { PatrolUnitsModal } from './components/PatrolUnitsModal';
import { audioEngine } from './utils/audioEngine';
import { InferenceResult } from './utils/inferenceEngine';
import {
  Radio,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  BellRing,
  Volume2,
  TreePine,
  AlertTriangle,
  Users,
} from 'lucide-react';

export default function App() {
  const [towers, setTowers] = useState<SentinelTower[]>(() => {
    // Start with Tower C in alert state from INITIAL_INCIDENTS
    return SENTINEL_TOWERS.map((t) => {
      if (t.id === 'TOWER-C') {
        return { ...t, status: 'alert' };
      }
      return t;
    });
  });

  const [incidents, setIncidents] = useState<ThreatIncident[]>(INITIAL_INCIDENTS);
  const [selectedTower, setSelectedTower] = useState<SentinelTower>(SENTINEL_TOWERS[2]); // Tower C default
  const [selectedIncident, setSelectedIncident] = useState<ThreatIncident | null>(INITIAL_INCIDENTS[0]);
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState<boolean>(false);
  const [currentTelegramAlert, setCurrentTelegramAlert] = useState<AlertNotificationData | null>(null);
  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'map' | 'audio' | 'log' | 'patrols'>('map');

  // Trigger audio drill from top bar or health grid
  const handleTriggerDrill = async (
    forcedType: 'chainsaw' | 'elephant' = 'chainsaw',
    targetTowerId?: string
  ) => {
    const targetId = targetTowerId || (forcedType === 'chainsaw' ? 'TOWER-A' : 'TOWER-C');
    const targetTower = towers.find((t) => t.id === targetId) || towers[0];
    setSelectedTower(targetTower);

    // Audio Buffer synthesis
    let audioBuf: AudioBuffer;
    if (forcedType === 'chainsaw') {
      audioBuf = await audioEngine.createChainsawBuffer();
    } else {
      audioBuf = await audioEngine.createElephantBuffer();
    }

    // Play alert sound
    audioEngine.playAlertBeep(forcedType === 'chainsaw');

    // Create new incident
    const newIncidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isChainsaw = forcedType === 'chainsaw';

    const newIncident: ThreatIncident = {
      id: newIncidentId,
      towerId: targetTower.id,
      towerName: targetTower.name,
      sector: targetTower.sector,
      threatType: isChainsaw ? 'chainsaw' : 'elephant',
      title: isChainsaw
        ? 'Illegal Felling Detected (Two-Stroke Motor)'
        : 'Elephant Herd Movement (Infrasound / Trumpet)',
      titleKannada: isChainsaw
        ? 'ಅಕ್ರಮ ಮರ ಕಡಿಯುವ ಯಂತ್ರ ಪತ್ತೆ (ಚೈನ್ಸಾ)'
        : 'ಆನೆಗಳ ಹಿಂಡಿನ ಚಲನವಲನ (ಘರ್ಜನೆ ಮತ್ತು ಕರೆ)',
      description: isChainsaw
        ? `High-decibel chainsaw motor harmonics detected at ${targetTower.sector}. Timber cutting vibrations verified.`
        : `Infrasonic rumbles (20-28 Hz) and trumpet distress calls detected approaching agricultural fringes near ${targetTower.sector}.`,
      confidence: isChainsaw ? 89.6 : 93.4,
      timestamp: 'Just now',
      coordinates: [targetTower.lat, targetTower.lng],
      status: 'unacknowledged',
      severity: isChainsaw ? 'critical' : 'warning',
      audioDurationSec: audioBuf.duration,
      spectralFeatures: {
        peakFrequencyHz: isChainsaw ? 1280 : 230,
        spectralCentroidHz: isChainsaw ? 2200 : 360,
        infrasonicEnergy: isChainsaw ? 0.12 : 0.92,
        zeroCrossingRate: isChainsaw ? 0.62 : 0.14,
        snrDb: isChainsaw ? 24.5 : 19.8,
      },
    };

    // Update towers status to RED alert
    setTowers((prev) =>
      prev.map((t) => (t.id === targetTower.id ? { ...t, status: 'alert', activeThreat: newIncident } : t))
    );

    // Add to incidents log
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    // Show Bilingual Telegram Alert Modal / Toast
    setCurrentTelegramAlert({
      id: newIncidentId,
      threatType: isChainsaw ? 'chainsaw' : 'elephant',
      towerName: targetTower.name,
      englishMessage: isChainsaw
        ? `🚨 CRITICAL ALERT: Chainsaw motor acoustic signature detected at ${targetTower.name}. Illegal timber felling in progress. Lat: ${targetTower.lat.toFixed(4)}, Lng: ${targetTower.lng.toFixed(4)}. Dispatch anti-poaching camp immediately.`
        : `⚠️ ALERT: Elephant movement detected at ${targetTower.name}. Avoid agricultural perimeters and fringe trails.`,
      kannadaMessage: isChainsaw
        ? `🚨 ಗಂಭೀರ ಎಚ್ಚರಿಕೆ: ${targetTower.kannadaName} ಬಳಿ ಮರ ಕಡಿಯುವ ಯಂತ್ರದ (ಚೈನ್ಸಾ) ಶಬ್ದ ಪತ್ತೆಯಾಗಿದೆ. ಅಕ್ರಮ ಮರ ಕಡಿತ ನಡೆಯುತ್ತಿದೆ. ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ತಂಡವನ್ನು ಕೂಡಲೇ ರವಾನಿಸಿ.`
        : `⚠️ ಎಚ್ಚರಿಕೆ: ${targetTower.kannadaName} ಬಳಿ ಆನೆಗಳ ಚಲನವಲನ ಕಂಡುಬಂದಿದೆ. ರೈತರು ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿರಿ.`,
      timestamp: 'Just now',
      recipientsCount: isChainsaw ? 24 : 18,
    });
  };

  // Callback when user runs AI Inference in AudioIngestionModule
  const handleThreatInference = (
    result: InferenceResult,
    targetTower: SentinelTower,
    audioBuffer: AudioBuffer
  ) => {
    const isThreat = result.confidence > 75 && result.severity !== 'nominal';

    const newIncident: ThreatIncident = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      towerId: targetTower.id,
      towerName: targetTower.name,
      sector: targetTower.sector,
      threatType: result.threatType,
      title: result.title,
      titleKannada: result.titleKannada,
      description: result.description,
      confidence: result.confidence,
      timestamp: 'Just now',
      coordinates: [targetTower.lat, targetTower.lng],
      status: 'unacknowledged',
      severity: result.severity,
      audioDurationSec: audioBuffer.duration,
      spectralFeatures: {
        peakFrequencyHz: result.spectralFeatures.peakFrequencyHz,
        spectralCentroidHz: result.spectralFeatures.spectralCentroidHz,
        infrasonicEnergy: result.spectralFeatures.infrasonicEnergy,
        zeroCrossingRate: result.spectralFeatures.zeroCrossingRate,
        snrDb: result.spectralFeatures.snrDb,
      },
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    if (isThreat) {
      setTowers((prev) =>
        prev.map((t) =>
          t.id === targetTower.id ? { ...t, status: result.severity === 'critical' ? 'alert' : 'warning' } : t
        )
      );

      // Trigger Telegram Alert
      setCurrentTelegramAlert({
        id: newIncident.id,
        threatType: result.threatType === 'ambient' ? 'elephant' : result.threatType,
        towerName: targetTower.name,
        englishMessage: result.bilingualAlert.english,
        kannadaMessage: result.bilingualAlert.kannada,
        timestamp: 'Just now',
        recipientsCount: 22,
      });
    }
  };

  // Acknowledge incident
  const handleAcknowledgeIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'acknowledged' } : inc))
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: 'acknowledged' } : null));
    }
  };

  // Dispatch patrol team
  const handleDispatchPatrol = (incidentId: string, unitName: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'dispatched',
              dispatchedUnit: {
                unitName,
                personnelCount: 5,
                etaMinutes: 10,
                callSign: 'STRIKE-ALPHA',
              },
            }
          : inc
      )
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) =>
        prev
          ? {
              ...prev,
              status: 'dispatched',
              dispatchedUnit: {
                unitName,
                personnelCount: 5,
                etaMinutes: 10,
                callSign: 'STRIKE-ALPHA',
              },
            }
          : null
      );
    }
  };

  // Mark False Positive
  const handleMarkFalsePositive = (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      setTowers((prev) =>
        prev.map((t) => (t.id === inc.towerId ? { ...t, status: 'nominal' } : t))
      );
    }
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status: 'false_positive' } : i))
    );
    setIsIncidentDrawerOpen(false);
  };

  // Open incident drawer from map tower click
  const handleSelectTower = (tower: SentinelTower) => {
    setSelectedTower(tower);
    // Find active or latest incident for this tower
    const towerInc = incidents.find((inc) => inc.towerId === tower.id);
    if (towerInc) {
      setSelectedIncident(towerInc);
    }
    if (tower.status === 'alert' || tower.status === 'warning') {
      setIsIncidentDrawerOpen(true);
    }
  };

  const handleSelectIncident = (incident: ThreatIncident) => {
    setSelectedIncident(incident);
    const tower = towers.find((t) => t.id === incident.towerId);
    if (tower) setSelectedTower(tower);
    setIsIncidentDrawerOpen(true);
  };

  const alertTowerCount = towers.filter((t) => t.status === 'alert').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* =========================================================================
          TOP BAR CONTRACT (§ 2 Frontend Design Constitution)
          [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
          ========================================================================= */}
      <header className="flex items-center justify-between gap-8 px-5 py-3.5 border-b border-slate-800/90 bg-slate-950/95 sticky top-0 z-[1100] backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            Aranya-Drishti
          </span>
          <span className="hidden sm:inline text-xs font-kannada text-emerald-400/90">
            (ಅರಣ್ಯ ದೃಷ್ಟಿ)
          </span>
        </div>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'map' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Operations Map</span>
            {alertTowerCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audio' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Acoustic Screening
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'log' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Log ({incidents.length})
          </button>
          <button
            onClick={() => setIsPatrolModalOpen(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Patrol Units</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleTriggerDrill('chainsaw')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Threat Drill</span>
          </button>
        </div>
      </header>

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Quick KPI & Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">SENTINEL TOWERS</span>
              <span className="text-base font-mono font-bold text-slate-100">5 Active</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-emerald-400">100% Online</span>
              <span className="text-[9px] text-slate-500 block">Kudremukh Grid</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">ACOUSTIC ALERTS</span>
              <span className="text-base font-mono font-bold text-red-400">
                {alertTowerCount} Critical
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-red-400 animate-pulse">
                Radar Beacon Active
              </span>
              <span className="text-[9px] text-slate-500 block">Boundary Watch</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">INFRASOUND SENSORS</span>
              <span className="text-base font-mono font-bold text-amber-400">14-35 Hz Band</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-amber-400">Elephant Corridor</span>
              <span className="text-[9px] text-slate-500 block">Kadaba Fringe</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">RADIO REPEATER</span>
              <span className="text-base font-mono font-bold text-sky-400">154.250 MHz</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-emerald-400">VHF Linked</span>
              <span className="text-[9px] text-slate-500 block">5 Strike Camps</span>
            </div>
          </div>
        </div>

        {/* Tab-driven View */}
        {activeTab === 'map' && (
          <div className="space-y-5">
            {/* Split Grid: Left = Satellite Operations Map (60%), Right = Audio Screening (40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Satellite Operations Map */}
              <div className="lg:col-span-7 xl:col-span-8 h-[500px] lg:h-[580px]">
                <OperationsMap
                  towers={towers}
                  selectedTowerId={selectedTower.id}
                  onSelectTower={handleSelectTower}
                />
              </div>

              {/* Audio Screening Module */}
              <div className="lg:col-span-5 xl:col-span-4">
                <AudioIngestionModule
                  towers={towers}
                  selectedTower={selectedTower}
                  onSelectTower={setSelectedTower}
                  onThreatInference={handleThreatInference}
                />
              </div>
            </div>

            {/* Sentinel Array Health & Quick Trigger Row */}
            <SentinelGridHealth
              towers={towers}
              selectedTowerId={selectedTower.id}
              onSelectTower={handleSelectTower}
              onTriggerTestAcoustic={(tower, type) => handleTriggerDrill(type, tower.id)}
            />

            {/* Compact Incident Log preview */}
            <IncidentLogTable
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onAcknowledge={handleAcknowledgeIncident}
            />
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <AudioIngestionModule
              towers={towers}
              selectedTower={selectedTower}
              onSelectTower={setSelectedTower}
              onThreatInference={handleThreatInference}
            />

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Bioacoustic Machine Learning Pipeline Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="font-bold text-red-400 block">Chainsaw Profile</span>
                  <p className="text-[11px] text-slate-400">
                    Targets 2-stroke small combustion engines. Harmonic spikes at 110–260 Hz with zero-crossing rate &gt; 0.55.
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="font-bold text-amber-400 block">Elephant Vocalization</span>
                  <p className="text-[11px] text-slate-400">
                    Captures subterranean infrasound (14–35 Hz) and loud formant trumpets (220–550 Hz) for early conflict mitigation.
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="font-bold text-emerald-400 block">Canopy Ambiance Baseline</span>
                  <p className="text-[11px] text-slate-400">
                    Filters out Western Ghats monsoon rainfall, wind shears, and cicada stridulation (5–7 kHz) to eliminate false alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-5">
            <IncidentLogTable
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onAcknowledge={handleAcknowledgeIncident}
            />
          </div>
        )}
      </main>

      {/* Incident Operations Drawer */}
      <IncidentDrawer
        isOpen={isIncidentDrawerOpen}
        onClose={() => setIsIncidentDrawerOpen(false)}
        incident={selectedIncident}
        tower={selectedTower}
        onAcknowledge={handleAcknowledgeIncident}
        onDispatch={handleDispatchPatrol}
        onMarkFalsePositive={handleMarkFalsePositive}
      />

      {/* Bilingual Telegram / SMS Alert Modal */}
      <TelegramAlertModal
        currentAlert={currentTelegramAlert}
        onClose={() => setCurrentTelegramAlert(null)}
      />

      {/* Patrol Units Deployment Roster Modal */}
      <PatrolUnitsModal
        isOpen={isPatrolModalOpen}
        onClose={() => setIsPatrolModalOpen(false)}
      />

      {/* Tactical Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-3 px-5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Aranya-Drishti</span>
          <span>·</span>
          <span>Karnataka Forest Department</span>
          <span>·</span>
          <span className="font-kannada text-emerald-400">ಕರ್ನಾಟಕ ಅರಣ್ಯ ಇಲಾಖೆ</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>Kudremukh Wildlife Division</span>
          <span>·</span>
          <span>Acoustic Grid v2.4</span>
        </div>
      </footer>
    </div>
  );
}
