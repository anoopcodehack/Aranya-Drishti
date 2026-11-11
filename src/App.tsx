import React, { useState, useRef } from 'react';
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
import { PatrolUnitsModal, PATROL_UNITS_DATA } from './components/PatrolUnitsModal';
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
  Compass,
  MapPin,
  ChevronRight,
  Play,
  Square,
  Shield,
  PhoneCall,
  Flame,
  ArrowRight,
  Sliders,
  ExternalLink,
  Lock,
  CheckCircle2,
  Globe,
  Sun,
  Battery,
  Cpu,
  FileText,
  Server,
  Zap,
  HelpCircle,
  Clock,
  Terminal,
  Ticket,
  Maximize2,
  Share2,
} from 'lucide-react';

// Official uploaded logo asset
const ARANYA_LOGO_SRC = '/assets/aistudio/image_033d2753.png';

// High-impact wildlife visual assets
import heroElephantImg from './assets/images/hero_western_ghats_elephant_1794403585062.jpg';
import tigerPortraitImg from './assets/images/wildlife_bengal_tiger_1794403585372.jpg';
import chainsawTimberImg from './assets/images/forest_chainsaw_timber_1794403586662.jpg';
import canopyLandscapeImg from './assets/images/canopy_monsoon_rainforest_1794403586320.jpg';

type ActiveViewMode = 'portal' | 'console' | 'playground' | 'incidents' | 'patrols' | 'architecture';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveViewMode>('portal');
  const [towers, setTowers] = useState<SentinelTower[]>(() => {
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

  // Fauna audio preview state
  const [playingFauna, setPlayingFauna] = useState<string | null>(null);

  const handlePlayFaunaAudio = async (speciesKey: string) => {
    if (playingFauna === speciesKey) {
      audioEngine.stopPlayback();
      setPlayingFauna(null);
      return;
    }

    setPlayingFauna(speciesKey);
    let buf: AudioBuffer;
    if (speciesKey === 'elephant') {
      buf = await audioEngine.createElephantBuffer();
    } else if (speciesKey === 'tiger') {
      buf = await audioEngine.createTigerBuffer();
    } else if (speciesKey === 'macaque') {
      buf = await audioEngine.createMacaqueBuffer();
    } else {
      buf = await audioEngine.createAmbientBuffer();
    }

    audioEngine.playBuffer(buf, () => {
      setPlayingFauna(null);
    });
  };

  // Trigger audio threat drill
  const handleTriggerDrill = async (
    forcedType: 'chainsaw' | 'elephant' = 'chainsaw',
    targetTowerId?: string
  ) => {
    const targetId = targetTowerId || (forcedType === 'chainsaw' ? 'TOWER-A' : 'TOWER-C');
    const targetTower = towers.find((t) => t.id === targetId) || towers[0];
    setSelectedTower(targetTower);

    let audioBuf: AudioBuffer;
    if (forcedType === 'chainsaw') {
      audioBuf = await audioEngine.createChainsawBuffer();
    } else {
      audioBuf = await audioEngine.createElephantBuffer();
    }

    audioEngine.playAlertBeep(forcedType === 'chainsaw');

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

    setTowers((prev) =>
      prev.map((t) => (t.id === targetTower.id ? { ...t, status: 'alert', activeThreat: newIncident } : t))
    );

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

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

      setCurrentTelegramAlert({
        id: newIncident.id,
        threatType: result.threatType,
        towerName: targetTower.name,
        englishMessage: result.bilingualAlert.english,
        kannadaMessage: result.bilingualAlert.kannada,
        timestamp: 'Just now',
        recipientsCount: 22,
      });
    }
  };

  const handleAcknowledgeIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'acknowledged' } : inc))
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: 'acknowledged' } : null));
    }
  };

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

  const handleSelectTower = (tower: SentinelTower) => {
    setSelectedTower(tower);
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* =========================================================================
          TOP BANNER: Official Division Status
          ========================================================================= */}
      <div className="bg-[#080808] border-b border-zinc-800 text-[11px] font-mono text-zinc-400 py-1.5 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-200">
            Karnataka Forest Dept · Kudremukh Wildlife Division
          </span>
          <span className="hidden md:inline text-zinc-500">|</span>
          <span className="hidden md:inline text-zinc-400">Western Ghats Autonomous Acoustic Defense Array</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span className="hidden sm:inline">24/7 Helpline: <strong className="text-emerald-400">1926</strong></span>
          <span>VHF: 154.250 MHz</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">5/5 Nodes Active</span>
        </div>
      </div>

      {/* =========================================================================
          ENTERPRISE NAVBAR (With Crystal-Clear White Logo Container)
          ========================================================================= */}
      <header className="sticky top-0 z-[1100] px-4 sm:px-8 py-3 bg-[#0a0a0a]/95 border-b border-zinc-800 backdrop-blur-md flex items-center justify-between gap-4">
        {/* Brand Identity with Prominent White Capsule for 100% Logo Visibility */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('portal')}
            className="cursor-pointer bg-white px-3 sm:px-4 py-1.5 rounded-xl shadow-lg border border-white flex items-center shrink-0 transition-transform hover:scale-105"
          >
            <img
              src={ARANYA_LOGO_SRC}
              alt="Aranya-Drishti"
              referrerPolicy="no-referrer"
              className="h-8 sm:h-10 w-auto object-contain block"
            />
          </div>
          <div className="hidden lg:block border-l border-zinc-800 pl-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 block uppercase">
              See · Protect · Preserve
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Autonomous Forest Surveillance
            </span>
          </div>
        </div>

        {/* View Switcher Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-[#121212] p-1 rounded-xl border border-zinc-800 text-xs font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveView('portal')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'portal'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveView('console')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'console'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Operations Console</span>
            <span className="sm:hidden">Console</span>
            {alertTowerCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveView('playground')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'playground'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio Screening</span>
          </button>

          <button
            onClick={() => setActiveView('incidents')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'incidents'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveView('patrols')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'patrols'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Patrol Units</span>
            <span className="md:hidden">Patrols</span>
          </button>

          <button
            onClick={() => setActiveView('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'architecture'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xl:inline">Architecture</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleTriggerDrill('chainsaw')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-950/40 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Simulate acoustic chainsaw threat at Tower A"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Simulate Threat Drill</span>
            <span className="sm:hidden">Threat Drill</span>
          </button>

          {activeView !== 'console' && (
            <button
              onClick={() => setActiveView('console')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Launch Console</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          VIEW MODE 0: PORTAL OVERVIEW (The Bearizona-Style Solution Webpage)
          ========================================================================= */}
      {activeView === 'portal' && (
        <div className="flex-1 flex flex-col">
          {/* HERO SECTION (Bearizona exact style: dramatic wildlife hero + script headline + dual CTA buttons) */}
          <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-zinc-800">
            {/* Background Elephant Photography */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroElephantImg}
                alt="Western Ghats Asian Elephant Herd"
                className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
              <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80" />
            </div>

            {/* Hero Content Box */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-emerald-500/40 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Western Ghats UNESCO Biosphere Reserve · 160,000 Hectares</span>
              </div>

              {/* Editorial Display Typography (Bearizona "It's Time To Get Wild" style!) */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white uppercase font-sans">
                  It's Time To
                </h1>
                <span className="block text-4xl sm:text-6xl lg:text-8xl italic font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 py-1 drop-shadow-md">
                  Protect The Wild
                </span>
              </div>

              {/* Subtitle */}
              <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-zinc-200 font-light leading-relaxed drop-shadow">
                Autonomous acoustic intelligence and neural sensor network safeguarding the endangered ecosystems of the Western Ghats against illegal chainsaw timber felling and human-elephant conflict.
              </p>

              {/* Dual CTA Buttons (Bearizona "Buy Tickets" / "Buy VIP Tickets" style!) */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setActiveView('console')}
                  className="px-6 sm:px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Compass className="w-5 h-5 text-emerald-200" />
                  <span>Launch Operations Console</span>
                </button>

                <button
                  onClick={() => handleTriggerDrill('chainsaw')}
                  className="px-6 sm:px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white shadow-xl shadow-orange-950/60 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
                >
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <span>Simulate Threat Drill</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="pt-2 text-xs font-mono text-zinc-400 flex items-center justify-center gap-4">
                <span>Lat: 13.133° N, 75.258° E</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">All 5 Sentinel Masts Online</span>
                <span>·</span>
                <span>Sub-bass 14–35 Hz Active</span>
              </div>
            </div>
          </section>

          {/* FLOATING QUICK-INFO CARDS STRIP (Bearizona "Getting Here / Admissions / Park Map / FAQs" exact match!) */}
          <div className="relative z-20 max-w-6xl mx-auto -mt-10 sm:-mt-14 px-4 sm:px-6 w-full">
            <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-zinc-900">
              {/* Quick Card 1 */}
              <div
                onClick={() => setActiveView('console')}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    Perimeter Coverage
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    160,000 Hectares<br />
                    Kudremukh Biosphere
                  </p>
                </div>
              </div>

              {/* Quick Card 2 */}
              <div
                onClick={() => setActiveView('console')}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    Sentinel Grid
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    5 Autonomous Masts<br />
                    Continuous Solar Power
                  </p>
                </div>
              </div>

              {/* Quick Card 3 */}
              <div
                onClick={() => setActiveView('playground')}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-800 shrink-0 group-hover:scale-110 transition-transform">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    AI Threat Engine
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Chainsaw & Infrasound<br />
                    Strict &gt;75% Threshold
                  </p>
                </div>
              </div>

              {/* Quick Card 4 */}
              <div
                onClick={() => setIsPatrolModalOpen(true)}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    Ranger Strike Force
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    5 Rapid Patrol Camps<br />
                    VHF 154.250 MHz Radio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* EDITORIAL WHITE / LIGHT SECTION: "About Aranya-Drishti" (Bearizona "About Bearizona Wildlife Park" style!) */}
          <section className="bg-white text-zinc-900 py-20 px-6 sm:px-12 mt-12 border-b border-zinc-200">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Photo: Bengal Tiger Portrait */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-zinc-100">
                  <img
                    src={tigerPortraitImg}
                    alt="Bengal Tiger in Western Ghats Sanctuary"
                    className="w-full h-[420px] sm:h-[480px] object-cover object-center filter contrast-[1.05]"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3.5 rounded-2xl text-white border border-white/20">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                      Protected Keystone Species
                    </span>
                    <span className="font-bold text-sm">Royal Bengal Tiger (Panthera tigris)</span>
                    <span className="text-[11px] text-zinc-300 block">Kudremukh Rain Corridor · Acoustic Track Active</span>
                  </div>
                </div>

                {/* Paw Print / Decorative Badge */}
                <div className="absolute -top-4 -right-4 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold font-mono">
                  IUCN Red List Protected
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase block mb-1">
                    Autonomous Acoustic Intelligence
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
                    <span className="italic font-serif text-emerald-700 font-normal">About</span> Aranya-Drishti Bioacoustic Shield
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-normal">
                  Aranya-Drishti (<strong>ಅರಣ್ಯ ದೃಷ್ಟಿ</strong> — <em>Forest Vision</em>) is Karnataka's autonomous acoustic surveillance command platform deployed across the dense tropical rainforests of the Western Ghats. Powered by continuous 12V 40W monocrystalline solar masts, each sentinel node monitors acoustic signatures within a 3.5 km radius.
                </p>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
                  When illegal timber poachers rev a 2-stroke chainsaw motor, our neural DSP edge processor discriminates engine harmonic vibrations (110–260 Hz) from ambient wind in under <strong>800 milliseconds</strong>. Simultaneously, deep infrasonic geophones capture 14–35 Hz pachyderm rumbles to alert beat foresters and gram panchayat farmers before elephant herds wander into agricultural buffer fields.
                </p>

                {/* Key Metric Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-2xl font-mono font-extrabold text-zinc-950 block">800 ms</span>
                    <span className="text-[11px] text-zinc-500 font-mono">Alert Latency</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-2xl font-mono font-extrabold text-emerald-700 block">93.4%</span>
                    <span className="text-[11px] text-zinc-500 font-mono">Infrasound Acc.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-2xl font-mono font-extrabold text-amber-600 block">14–35 Hz</span>
                    <span className="text-[11px] text-zinc-500 font-mono">Pachyderm Sub-Bass</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-2xl font-mono font-extrabold text-zinc-950 block">5 Masts</span>
                    <span className="text-[11px] text-zinc-500 font-mono">Solar Sentinel</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveView('console')}
                    className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                  >
                    <span>Inspect Sentinel Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPatrolModalOpen(true)}
                    className="px-6 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Patrol Units</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE EXPERIENCE & THREAT SIGNATURES (Bearizona "Experience The Magic" style!) */}
          <section className="bg-[#0a0a0a] text-white py-20 px-6 sm:px-12 border-b border-zinc-800">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                  Bioacoustic Acoustic Signatures
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                  <span className="italic font-serif text-emerald-400 font-normal">Experience</span> The Acoustic Grid
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Click any card to play synthesized audio, test real-time FFT frequency response, or trigger live threat dispatches.
                </p>
              </div>

              {/* 4 Interactive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Chainsaw Motor */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-red-500/50 transition-all">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={chainsawTimberImg}
                      alt="Chainsaw Illegal Timber Felling"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold uppercase">
                      Threat Signature
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors">
                        Illegal Timber Felling
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Two-stroke chainsaw motor harmonics (110–260 Hz) and timber cutting tooth friction.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTriggerDrill('chainsaw')}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simulate Chainsaw Alert</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Elephant Call */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-amber-500/50 transition-all">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={heroElephantImg}
                      alt="Asian Elephant Herd Infrasound"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[10px] font-bold uppercase">
                      Wildlife Corridor
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                        Elephant Infrasound
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Subterranean 14–35 Hz chest rumbles and resonant trumpet formant calls.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTriggerDrill('elephant')}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/50 hover:border-amber-500 text-amber-300 hover:text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simulate Elephant Herd</span>
                    </button>
                  </div>
                </div>

                {/* Card 3: Monsoon Rain */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-emerald-500/50 transition-all">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={canopyLandscapeImg}
                      alt="Western Ghats Monsoon Rain Canopy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase">
                      Ambient Baseline
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                        Monsoon Rain & Cicadas
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Continuous rainfall noise floor and 5.4 kHz cicada pulses calibrated out by filter.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const buf = await audioEngine.createAmbientBuffer();
                        audioEngine.playBuffer(buf);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-500 text-emerald-300 hover:text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Ambient Rain</span>
                    </button>
                  </div>
                </div>

                {/* Card 4: Audio Screening Lab */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-white/50 transition-all">
                  <div className="h-44 bg-zinc-900 border-b border-zinc-800 flex items-center justify-center relative p-4">
                    <Activity className="w-16 h-16 text-emerald-400 animate-pulse" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-zinc-700 text-white font-mono text-[10px] font-bold uppercase">
                      Live Ingestion
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                        Microphone Lab
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Capture 3 seconds of live microphone audio or drag & drop a .WAV audio file.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView('playground')}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2"
                    >
                      <span>Open Screening Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EMBEDDED REAL LIVE OPERATIONS CONSOLE (The Real Solution Embedded Right On Homepage!) */}
          <section className="bg-black text-white py-16 px-4 sm:px-8 border-b border-zinc-800 space-y-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Live Tactical Command Center
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-time Leaflet satellite tracking, active acoustic radar blips, and AI audio ingestion pipeline.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveView('console')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Open Fullscreen Console</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDrill('chainsaw')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow-lg"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Trigger Threat Drill</span>
                  </button>
                </div>
              </div>

              {/* Operations Deck: Map (65%) + Audio Ingestion (35%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 xl:col-span-8 h-[540px] lg:h-[620px]">
                  <OperationsMap
                    towers={towers}
                    selectedTowerId={selectedTower.id}
                    onSelectTower={handleSelectTower}
                  />
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                  <AudioIngestionModule
                    towers={towers}
                    selectedTower={selectedTower}
                    onSelectTower={setSelectedTower}
                    onThreatInference={handleThreatInference}
                  />
                </div>
              </div>

              {/* 5-Node Sentinel Grid Health Cards */}
              <SentinelGridHealth
                towers={towers}
                selectedTowerId={selectedTower.id}
                onSelectTower={handleSelectTower}
                onTriggerTestAcoustic={(tower, type) => handleTriggerDrill(type, tower.id)}
              />

              {/* Incident Log Table */}
              <IncidentLogTable
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
                onAcknowledge={handleAcknowledgeIncident}
              />
            </div>
          </section>

          {/* CONSERVATION IMPACT BANNER (Bearizona "Conservation Efforts" style!) */}
          <section className="relative py-20 px-6 sm:px-12 bg-zinc-950 text-white border-b border-zinc-800 overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                  Karnataka Forest Department Impact
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Preserving Biodiversity in the Nilgiri Biosphere
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  Over 5,400 Asian Elephants and 1,200 Bengal Tigers rely on Western Ghats migratory corridors. Aranya-Drishti provides proactive infrasonic alerting that eliminates tragic railway strikes and protects rural farm crops without harm to wildlife.
                </p>
                <div className="flex flex-wrap gap-6 pt-2 text-xs font-mono text-zinc-300">
                  <div>
                    <span className="text-xl font-bold text-emerald-400 block">100%</span>
                    <span>Zero Undetected Felling</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-amber-400 block">24 Units</span>
                    <span>Villager Alert Broadcasts</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white block">Sec 27</span>
                    <span>KFA 1963 Evidence Grade</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <button
                  onClick={() => setActiveView('incidents')}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Forensic Incident Register</span>
                </button>
              </div>
            </div>
          </section>

          {/* EXPLORE PROTECTED WILDLIFE CAROUSEL/GALLERY (Bearizona "Explore Our Animals" style!) */}
          <section className="bg-black text-white py-20 px-6 sm:px-12 border-b border-zinc-800">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase block">
                    Bioacoustic Fauna
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                    <span className="italic font-serif text-emerald-400 font-normal">Explore</span> Protected Fauna
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Click the speaker buttons to listen to bioacoustic voice simulations calibrated for sentinel node identification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Animal 1: Asian Elephant */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                        Vulnerable
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">14–35 Hz</span>
                    </div>
                    <h3 className="font-bold text-lg text-white">Asian Elephant</h3>
                    <p className="text-xs italic text-zinc-400">Elephas maximus</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Deep seismic infrasonic rumbles transmitting up to 10 kilometers across subterranean river basins.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayFaunaAudio('elephant')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                      playingFauna === 'elephant'
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {playingFauna === 'elephant' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{playingFauna === 'elephant' ? 'Playing Infrasound...' : 'Play Infrasound Voice'}</span>
                  </button>
                </div>

                {/* Animal 2: Bengal Tiger */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                        Endangered
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">60–120 Hz</span>
                    </div>
                    <h3 className="font-bold text-lg text-white">Royal Bengal Tiger</h3>
                    <p className="text-xs italic text-zinc-400">Panthera tigris</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Territorial chuffs and low-frequency guttural roars recorded at Kudremukh high-altitude shola grasslands.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayFaunaAudio('tiger')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                      playingFauna === 'tiger'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {playingFauna === 'tiger' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{playingFauna === 'tiger' ? 'Playing Roar...' : 'Play Tiger Roar'}</span>
                  </button>
                </div>

                {/* Animal 3: Lion-Tailed Macaque */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                        Endangered
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">650–1350 Hz</span>
                    </div>
                    <h3 className="font-bold text-lg text-white">Lion-Tailed Macaque</h3>
                    <p className="text-xs italic text-zinc-400">Macaca silenus</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Endemic arboreal primates producing distinct contact whoops high in the evergreen rainforest canopy.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayFaunaAudio('macaque')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                      playingFauna === 'macaque'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {playingFauna === 'macaque' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{playingFauna === 'macaque' ? 'Playing Call...' : 'Play Macaque Call'}</span>
                  </button>
                </div>

                {/* Animal 4: Indian Leopard */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-700 text-zinc-200 uppercase">
                        Vulnerable
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">180–320 Hz</span>
                    </div>
                    <h3 className="font-bold text-lg text-white">Indian Leopard</h3>
                    <p className="text-xs italic text-zinc-400">Panthera pardus fusca</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Stealth nocturnal feline producing characteristic sawing rasp vocalizations along buffer ridges.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayFaunaAudio('rain')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                      playingFauna === 'rain'
                        ? 'bg-zinc-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {playingFauna === 'rain' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{playingFauna === 'rain' ? 'Playing Habitat...' : 'Play Habitat Sound'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RANGER SUPPORT & EMERGENCY HELPLINE (Bearizona "Shop 2 Give" banner style!) */}
          <section className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-black text-white py-16 px-6 sm:px-12 border-b border-zinc-800">
            <div className="max-w-6xl mx-auto rounded-3xl bg-zinc-900/90 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase inline-block border border-emerald-500/40">
                  24/7 Karnataka Forest Control Room
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Statewide Wildlife Emergency: Dial 1926
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Report illegal chainsaw logging, timber transport, or wild elephant sightings immediately. Direct encrypted dispatch to Kudremukh Strike Patrol Camps on VHF 154.250 MHz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsPatrolModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-xl flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>View Patrol Strike Camps</span>
                </button>

                <button
                  onClick={() => handleTriggerDrill('chainsaw')}
                  className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-xl flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Run Incident Simulation</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 1: OPERATIONS CONSOLE (Real-Time Tactical Command Deck)
          ========================================================================= */}
      {activeView === 'console' && (
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Executive KPI & Fleet Telemetry Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-zinc-800 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  PERIMETER COVERAGE
                </span>
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">160,000 Ha</span>
                <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">Kudremukh Biosphere</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-zinc-800 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  ACTIVE ALERT STATUS
                </span>
                <span className={`text-xl sm:text-2xl font-mono font-extrabold ${alertTowerCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {alertTowerCount > 0 ? `${alertTowerCount} Critical` : '0 Nominal'}
                </span>
                <span className="text-[11px] text-zinc-400 block font-mono mt-0.5">
                  {alertTowerCount > 0 ? 'Radar Beacon Active' : 'Passive Monitoring'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-zinc-800 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  INFRASOUND ARRAY
                </span>
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400">14–35 Hz</span>
                <span className="text-[11px] text-amber-300 block font-mono mt-0.5">Kadaba Fringe Corridor</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-amber-400">
                <Volume2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-zinc-800 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  RAPID PATROL READINESS
                </span>
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">5 Strike Camps</span>
                <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">VHF 154.250 MHz Linked</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Core Operations Deck: Left Tactical Leaflet GIS (65%) + Right Live Screening (35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 h-[560px] lg:h-[640px]">
              <OperationsMap
                towers={towers}
                selectedTowerId={selectedTower.id}
                onSelectTower={handleSelectTower}
              />
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <AudioIngestionModule
                towers={towers}
                selectedTower={selectedTower}
                onSelectTower={setSelectedTower}
                onThreatInference={handleThreatInference}
              />
            </div>
          </div>

          {/* Sentinel Array 5-Node Health Grid */}
          <SentinelGridHealth
            towers={towers}
            selectedTowerId={selectedTower.id}
            onSelectTower={handleSelectTower}
            onTriggerTestAcoustic={(tower, type) => handleTriggerDrill(type, tower.id)}
          />

          {/* Compact Incident Log Register */}
          <IncidentLogTable
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onAcknowledge={handleAcknowledgeIncident}
          />
        </main>
      )}

      {/* =========================================================================
          VIEW MODE 2: ACOUSTIC PLAYGROUND & MODEL INSPECTION
          ========================================================================= */}
      {activeView === 'playground' && (
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">Bioacoustic Model Playground & Audio Lab</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Test live microphone audio, inspect zero-crossing rates, and explore synthetic Western Ghats signatures.
            </p>
          </div>

          <AudioIngestionModule
            towers={towers}
            selectedTower={selectedTower}
            onSelectTower={setSelectedTower}
            onThreatInference={handleThreatInference}
          />

          {/* Model Specification Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase font-mono">Chainsaw Motor Neural Model</span>
                <span className="text-[10px] font-mono text-zinc-500">v2.4.1</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Discriminates two-stroke combustion spikes (110–260 Hz) and timber cutting tooth chatter against background wind shears.
              </p>
              <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
                Confidence Threshold: &gt; 75.0% · ZCR Filter: &gt; 0.55
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono">Pachyderm Infrasound Model</span>
                <span className="text-[10px] font-mono text-zinc-500">v1.9.8</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Isolates subterranean 14–35 Hz chest rumbles and resonant harmonic trumpeting (220–550 Hz) for agricultural conflict prevention.
              </p>
              <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
                Infrasound Ratio: &gt; 0.65 · Corridor Focus: Kadaba Fringe
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Canopy Ambient Baseline</span>
                <span className="text-[10px] font-mono text-zinc-500">Continuous</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Adaptive baseline tracker eliminating false alarms from monsoon raindrops, cicada stridulation (5–7 kHz), and canopy gusts.
              </p>
              <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
                Auto-Calibrating Noise Floor · SNR Target: &gt; 12 dB
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW MODE 3: INCIDENT REGISTER & FORENSIC LOG
          ========================================================================= */}
      {activeView === 'incidents' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
          <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-extrabold text-white">Western Ghats Forensic Incident Register</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Admissible acoustic evidence records under Section 27, Karnataka Forest Act 1963.
              </p>
            </div>

            <button
              onClick={() => handleTriggerDrill('chainsaw')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow-lg self-start sm:self-auto"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Incident</span>
            </button>
          </div>

          <IncidentLogTable
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onAcknowledge={handleAcknowledgeIncident}
          />
        </main>
      )}

      {/* =========================================================================
          VIEW MODE 4: FIELD PATROL DEPLOYMENTS & STRIKE CAMPS
          ========================================================================= */}
      {activeView === 'patrols' && (
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">Karnataka Forest Dept Tactical Deployments</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-kannada">
              ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ಗಸ್ತು ಪಡೆಗಳು · 5 Strike Units on Active Standby
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PATROL_UNITS_DATA.map((unit) => (
              <div
                key={unit.id}
                className="p-5 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400 mr-2">{unit.id}</span>
                    <span className="font-bold text-white text-sm">{unit.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    unit.status === 'dispatched' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">CALL SIGN</span>
                    <span>{unit.callSign}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">LEAD OFFICER</span>
                    <span>{unit.leadOfficer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">RADIO FREQ</span>
                    <span className="text-emerald-400">{unit.contactFreq}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">PERSONNEL</span>
                    <span>{unit.personnelCount} Armed Rangers</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 font-mono">
                  Vehicle: <span className="text-white">{unit.vehicle}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW MODE 5: SYSTEM ARCHITECTURE & ENTERPRISE SPECIFICATIONS
          ========================================================================= */}
      {activeView === 'architecture' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">Platform Architecture & Technical Specifications</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Enterprise bioacoustic engineering blueprint designed for UNESCO Western Ghats protected zones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-white">Edge Sentinel Hardware Array</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Autonomous 12V 40W monocrystalline solar-powered masts equipped with high-sensitivity MEMS omnidirectional capsules and 14–35 Hz infrasonic geophones. Dual LoRaWAN + 4G cellular telemetry links back to Kudremukh forest command.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-white">Bioacoustic Signal Processing</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                48 kHz / 16-bit PCM analysis pipeline calculating real-time Zero-Crossing Rates (ZCR), Spectral Centroid frequencies, and Mel-Frequency spectral bands. Strict confidence score filtering triggers red alerts only above the 75% boundary.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-white">Bilingual Telegram & SMS Gateway</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Synchronous emergency broadcast engine firing automated notifications in both English and Kannada to 14 beat guards and 3 gram panchayats within 800 milliseconds of threat confirmation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold">
                04
              </div>
              <h3 className="text-base font-bold text-white">Forensic Evidentiary Logging</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Every acoustic event captures raw waveform scrubbers, spectral centroids, GPS coordinates, and timestamp logs, exportable directly to CSV for court filings under Section 27 of the Karnataka Forest Act 1963.
              </p>
            </div>
          </div>
        </main>
      )}

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

      {/* =========================================================================
          ENTERPRISE MULTI-COLUMN FOOTER WITH 100% VISIBLE WHITE LOGO CONTAINER
          ========================================================================= */}
      <footer className="bg-[#050505] text-zinc-400 border-t border-zinc-800 pt-16 pb-12 px-6 sm:px-10 mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Column 1 & 2: Brand Identity & Official Logo */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-2xl shadow-2xl border border-white inline-block">
                  <img
                    src={ARANYA_LOGO_SRC}
                    alt="Aranya-Drishti Logo"
                    referrerPolicy="no-referrer"
                    className="h-12 sm:h-14 w-auto object-contain block"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                <strong>Aranya-Drishti (ಅರಣ್ಯ ದೃಷ್ಟಿ)</strong> is the enterprise autonomous acoustic intelligence platform
                deployed across the Western Ghats Biosphere Reserve. Developed to detect covert chainsaw timber
                felling and mitigate human-elephant conflict through real-time infrasound & vibration neural models.
              </p>

              <div className="text-[11px] font-mono text-zinc-500 space-y-1">
                <div>Karnataka Forest Department (KFD) · Kudremukh Wildlife Division</div>
                <div>Mangaluru Forest Circle · Government of Karnataka</div>
              </div>
            </div>

            {/* Column 3: Sentinel Node Directory */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                Sentinel Array (5 Nodes)
              </h4>
              <ul className="space-y-2 text-zinc-400 font-mono text-[11px]">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveView('console'); handleSelectTower(towers[0]); }}>
                  • Tower A: Kudremukh North (13.234° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveView('console'); handleSelectTower(towers[1]); }}>
                  • Tower B: Netravati Buffer (13.082° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveView('console'); handleSelectTower(towers[2]); }}>
                  • Tower C: Kadaba Fringe (12.784° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveView('console'); handleSelectTower(towers[3]); }}>
                  • Tower D: Shiradi Foothills (12.928° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveView('console'); handleSelectTower(towers[4]); }}>
                  • Tower E: Nagarhole Border (12.583° N)
                </li>
              </ul>
            </div>

            {/* Column 4: Bioacoustic Protocols & Legal */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                Acoustic Specs & Law
              </h4>
              <ul className="space-y-2 text-zinc-400 text-[11px]">
                <li>• 2-Stroke Chainsaw Vibration Model</li>
                <li>• Pachyderm Infrasound (14–35 Hz)</li>
                <li>• Sec 27 Karnataka Forest Act 1963</li>
                <li>• Wildlife Protection Act 1972</li>
                <li>• 5 Anti-Poaching Camps Linked</li>
                <li>• Encrypted VHF 154.250 MHz</li>
              </ul>
            </div>

            {/* Column 5: 24/7 Emergency Dispatch */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                24/7 Ranger Hotlines
              </h4>
              <div className="space-y-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono block">STATE FOREST CONTROL</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm block">1926 (Toll-Free)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono block">KUDREMUKH RFO HQ</span>
                  <span className="font-mono text-white block">+91 8263 254224</span>
                </div>
                <button
                  onClick={() => setIsPatrolModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Patrol Strike Teams</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Legal Copyright Row */}
          <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Aranya-Drishti</span>
              <span>·</span>
              <span>See · Protect · Preserve</span>
              <span>·</span>
              <span>© 2026 Karnataka Forest Department</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span>GPS: 13.133° N, 75.258° E</span>
              <span>·</span>
              <span>Western Ghats UNESCO Biosphere</span>
              <span>·</span>
              <span className="text-emerald-400">All 5 Towers Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
