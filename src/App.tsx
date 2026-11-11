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
  Compass,
  MapPin,
  ChevronRight,
  Play,
  Shield,
  PhoneCall,
  Flame,
  ArrowRight,
  Sliders,
} from 'lucide-react';

// Imported generated assets
import heroElephantImg from './assets/images/hero_western_ghats_elephant_1794403585062.jpg';
import tigerPortraitImg from './assets/images/wildlife_bengal_tiger_1794403585372.jpg';
import chainsawTimberImg from './assets/images/forest_chainsaw_timber_1794403586662.jpg';
import canopyLandscapeImg from './assets/images/canopy_monsoon_rainforest_1794403586320.jpg';

export default function App() {
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

  const operationsSectionRef = useRef<HTMLDivElement>(null);
  const audioModuleRef = useRef<HTMLDivElement>(null);
  const incidentsLogRef = useRef<HTMLDivElement>(null);
  const towersSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Trigger audio threat drill
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

    // Play tactical alert sound
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

    // Show Bilingual Telegram Alert Modal
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
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* =========================================================================
          NATURE PORTAL HEADER (Inspired directly by user's reference top-bar)
          ========================================================================= */}
      <header className="absolute top-0 inset-x-0 z-[1100] px-6 sm:px-10 py-5 flex items-center justify-between gap-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Brand Badge (Warm rustic wooden look) */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-amber-600/20 border border-amber-500/40 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <span className="text-xl">🌲</span>
            <div>
              <span className="font-extrabold tracking-wider text-amber-100 text-sm sm:text-base font-serif uppercase block leading-none">
                Aranya-Drishti
              </span>
              <span className="text-[10px] font-kannada text-emerald-300 block leading-none mt-0.5">
                ಅರಣ್ಯ ದೃಷ್ಟಿ · Western Ghats
              </span>
            </div>
          </div>
        </div>

        {/* Clean Center Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wide text-slate-200">
          <button
            onClick={() => scrollToSection(operationsSectionRef)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            Operations Map
            {alertTowerCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
          </button>
          <button
            onClick={() => scrollToSection(audioModuleRef)}
            className="hover:text-amber-400 transition-colors"
          >
            Audio Screening
          </button>
          <button
            onClick={() => scrollToSection(towersSectionRef)}
            className="hover:text-amber-400 transition-colors"
          >
            Sentinel Array
          </button>
          <button
            onClick={() => scrollToSection(incidentsLogRef)}
            className="hover:text-amber-400 transition-colors"
          >
            Incident Log ({incidents.length})
          </button>
          <button
            onClick={() => setIsPatrolModalOpen(true)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Patrol Roster</span>
          </button>
        </nav>

        {/* Action Button: Warm Amber Pill (matching "Tickets" in reference) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTriggerDrill('chainsaw')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-orange-950/50 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <AlertTriangle className="w-4 h-4 fill-current text-amber-100" />
            <span>Simulate Threat Drill</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO BANNER SECTION (Direct match to reference: "It's Time To Get Wild")
          ========================================================================= */}
      <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden pt-24 pb-20">
        {/* Background Image: Majestic Asian Elephant in Western Ghats mist */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroElephantImg}
            alt="Majestic Western Ghats Wildlife"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-90"
          />
          {/* Measured Dark Left Vignette Scrim ensuring WCAG AA contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/80 to-transparent w-full md:w-3/4 z-1" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-black/30 z-1" />
        </div>

        {/* Hero Content Left */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-2xl space-y-4">
            {/* Live Sentinel Alert Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>5 / 5 Sentinel Towers Active · Western Ghats Bio-Shield</span>
            </div>

            {/* Headline matching reference: "It's Time To / Get Wild" */}
            <div className="space-y-0.5">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                It's Time To
              </h1>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 leading-none py-1">
                Protect the Wild
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Autonomous acoustic surveillance across 160,000 hectares of Kudremukh and Western Ghats rainforest.
              Real-time bioacoustic neural screening detects illegal chainsaw motors and elephant herd vocalizations in seconds.
            </p>

            {/* Dual CTAs matching reference: Green primary + Amber secondary */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => scrollToSection(operationsSectionRef)}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Launch Operations Map</span>
              </button>

              <button
                onClick={() => handleTriggerDrill('elephant')}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-orange-950/60 transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simulate Elephant Herd</span>
              </button>
            </div>

            {/* Fast Telemetry Micro-Badges */}
            <div className="flex items-center gap-4 pt-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Infrasound Sub-Sensors (14–35 Hz)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Anti-Poaching Rapid Strike
              </span>
            </div>
          </div>
        </div>

        {/* Organic Torn-Paper / Wave Divider at the bottom of the Hero */}
        <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none overflow-hidden leading-none">
          <svg
            className="w-full h-12 sm:h-16 text-[#0b1019] fill-current"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
          >
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,21.3C960,21,1056,43,1152,48C1248,53,1344,43,1392,37.3L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          4 QUICK-ACCESS TELEMETRY CARDS (Matching "Getting Here / Admissions / Park Map / FAQs")
          ========================================================================= */}
      <section className="relative z-30 bg-[#0b1019] px-6 sm:px-10 py-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Sentinel Towers */}
            <div
              onClick={() => scrollToSection(towersSectionRef)}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Sentinel Towers
                </h3>
                <p className="text-xs text-slate-400 font-mono">5 Active Boundary Nodes</p>
                <p className="text-[11px] text-emerald-400">100% Solar & VHF Linked</p>
              </div>
            </div>

            {/* 2. Acoustic Screening */}
            <div
              onClick={() => scrollToSection(audioModuleRef)}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Acoustic Screening
                </h3>
                <p className="text-xs text-slate-400 font-mono">Real-Time Waveform FFT</p>
                <p className="text-[11px] text-emerald-400">Mic · WAV · Soundboard</p>
              </div>
            </div>

            {/* 3. Tactical GIS Map */}
            <div
              onClick={() => scrollToSection(operationsSectionRef)}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Operations Map
                </h3>
                <p className="text-xs text-slate-400 font-mono">Kudremukh Lat 13.133°</p>
                <p className="text-[11px] text-amber-400">Pulsing Radar Blips</p>
              </div>
            </div>

            {/* 4. Emergency Alerts & Patrols */}
            <div
              onClick={() => setIsPatrolModalOpen(true)}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-orange-500/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-300 transition-colors">
                  Bilingual Dispatch
                </h3>
                <p className="text-xs text-slate-400 font-mono">Telegram & SMS Gateway</p>
                <p className="text-[11px] text-orange-400 font-kannada">ಕನ್ನಡ & English Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ABOUT ARANYA-DRISHTI SECTION (Matching "About Bearizona Wildlife Park")
          ========================================================================= */}
      <section className="bg-[#0b1019] px-6 sm:px-10 py-12 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Framed High-Resolution Wildlife Photograph */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 aspect-[4/3] group">
              <img
                src={tigerPortraitImg}
                alt="Bengal Tiger in Western Ghats Reserve"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-mono">
                <span className="text-amber-400 font-bold block">Royal Bengal Tiger Corridor</span>
                <span className="text-slate-300 text-[11px]">Sector 1 Shola Grassland Buffer · Zero-Poaching Priority</span>
              </div>
            </div>
          </div>

          {/* Right: Narrative Prose & Action Button */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <span className="font-serif italic text-emerald-400 font-normal mr-2">About</span>
                Aranya-Drishti Acoustic Shield
              </h2>
              <p className="text-xs font-kannada text-emerald-400/90">
                ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ಸ್ವಯಂಚಾಲಿತ ಅಕೌಸ್ಟಿಕ್ ಕಣ್ಗಾವಲು ವ್ಯವಸ್ಥೆ
              </p>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Spanning the rugged evergreen ridges from Kudremukh to Nagarhole, Aranya-Drishti monitors high-risk
              corridors vulnerable to covert timber syndicates and human-wildlife encounters. Using high-frequency
              combustion vibration filters, the system isolates illegal chainsaw felling within 4 seconds while
              picking up 14–35 Hz infrasonic elephant rumbles before herds enter agricultural fringes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ACOUSTIC RANGE</span>
                <span className="text-sm font-bold text-amber-400">14.8 km Radius</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">AI INFERENCE</span>
                <span className="text-sm font-bold text-emerald-400">&lt; 700 ms Latency</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ALERT RELIABILITY</span>
                <span className="text-sm font-bold text-slate-100">&gt; 91% Accuracy</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => scrollToSection(towersSectionRef)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg transition-all"
              >
                Inspect Sentinel Tower Array
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPERATIONS CENTER SECTION (The Core Working Solution)
          Styled as "Experience The Acoustic Grid" (matching "Experience The Magic")
          ========================================================================= */}
      <section
        ref={operationsSectionRef}
        className="bg-[#070b12] px-6 sm:px-10 py-12 border-b border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                TACTICAL OPERATIONS HEADQUARTERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <span className="font-serif italic text-amber-400 font-normal mr-2">Experience</span>
                The Live Acoustic Grid
              </h2>
            </div>

            {/* Quick Drill Action Strip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriggerDrill('chainsaw', 'TOWER-A')}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test Chainsaw Drill</span>
              </button>
              <button
                onClick={() => handleTriggerDrill('elephant', 'TOWER-C')}
                className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Elephant Drill</span>
              </button>
            </div>
          </div>

          {/* Interactive Split Operations Grid: Left = Leaflet Map (65%), Right = Audio Screening (35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Satellite Operations Map */}
            <div className="lg:col-span-7 xl:col-span-8 h-[540px] lg:h-[620px]">
              <OperationsMap
                towers={towers}
                selectedTowerId={selectedTower.id}
                onSelectTower={handleSelectTower}
              />
            </div>

            {/* Live Audio Ingestion & Screening Module */}
            <div ref={audioModuleRef} className="lg:col-span-5 xl:col-span-4">
              <AudioIngestionModule
                towers={towers}
                selectedTower={selectedTower}
                onSelectTower={setSelectedTower}
                onThreatInference={handleThreatInference}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPLORE TARGET ACOUSTIC SIGNATURES (Matching "Explore Our Animals" in reference)
          ========================================================================= */}
      <section className="bg-[#0b1019] px-6 sm:px-10 py-12 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">
                BIOACOUSTIC RECONNAISSANCE PROFILES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Explore Target <span className="font-serif italic text-emerald-400 font-normal">Threat Signatures</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Multi-Spectral Neural Matching
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Chainsaw Motor Card */}
            <div className="group rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-red-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={chainsawTimberImg}
                  alt="Chainsaw motor timber felling"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-red-600 text-white font-bold uppercase shadow">
                  CRITICAL THREAT
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                    Chainsaw Motor (2-Stroke)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Two-stroke engine scream (110–260 Hz fundamental + tooth cutting friction rasp).
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-400">88.4% Confidence</span>
                  <button
                    onClick={() => handleTriggerDrill('chainsaw', 'TOWER-A')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded border border-red-500/30 transition-colors"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Asian Elephant Card */}
            <div className="group rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={heroElephantImg}
                  alt="Asian Elephant Herd"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-600 text-white font-bold uppercase shadow">
                  CONFLICT RISK
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    Asian Elephant Herd
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Infrasonic chest rumbles (18–35 Hz) and loud formant trumpeting near Kadaba fringe.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">91.2% Confidence</span>
                  <button
                    onClick={() => handleTriggerDrill('elephant', 'TOWER-C')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded border border-amber-500/30 transition-colors"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Monsoon Rainforest Canopy Card */}
            <div className="group rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={canopyLandscapeImg}
                  alt="Kudremukh Monsoon Canopy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-700 text-white font-bold uppercase shadow">
                  BASELINE (CLEAR)
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    Monsoon Canopy Baseline
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Continuous tropical rain patter, canopy leaf rustle, and high-frequency cicada pulses.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">95.0% Normal</span>
                  <button
                    onClick={() => {
                      audioEngine.createAmbientBuffer().then((buf) => audioEngine.playBuffer(buf));
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded border border-emerald-500/30 transition-colors"
                  >
                    Listen
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Bengal Tiger Apex Corridor Card */}
            <div className="group rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={tigerPortraitImg}
                  alt="Royal Bengal Tiger Corridor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-orange-700 text-white font-bold uppercase shadow">
                  CORRIDOR GUARD
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                    Tiger Migratory Corridor
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Kudremukh to Pushpagiri contiguous corridor protected against vehicular and snare poaching.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">Protected Habitat</span>
                  <button
                    onClick={() => setIsPatrolModalOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded border border-orange-500/30 transition-colors"
                  >
                    View Units
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SENTINEL ARRAY HARDWARE TELEMETRY SECTION
          ========================================================================= */}
      <section ref={towersSectionRef} className="bg-[#070b12] px-6 sm:px-10 py-12 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-4">
          <SentinelGridHealth
            towers={towers}
            selectedTowerId={selectedTower.id}
            onSelectTower={handleSelectTower}
            onTriggerTestAcoustic={(tower, type) => handleTriggerDrill(type, tower.id)}
          />
        </div>
      </section>

      {/* =========================================================================
          INCIDENT LOG & OPERATIONS TABLE SECTION
          ========================================================================= */}
      <section ref={incidentsLogRef} className="bg-[#0b1019] px-6 sm:px-10 py-12">
        <div className="max-w-7xl mx-auto space-y-4">
          <IncidentLogTable
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onAcknowledge={handleAcknowledgeIncident}
          />
        </div>
      </section>

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

      {/* Warm Nature Portal Footer */}
      <footer className="border-t border-slate-800/90 bg-[#05080e] py-8 px-6 sm:px-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌲</span>
            <div>
              <span className="font-bold text-slate-200 text-sm block">Aranya-Drishti (ಅರಣ್ಯ ದೃಷ್ಟಿ)</span>
              <span className="text-[11px] text-slate-400">
                Karnataka Forest Department · Kudremukh Wildlife Division
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
            <span>5 Sentinel Towers Active</span>
            <span>·</span>
            <span>VHF 154.250 MHz</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">Western Ghats Bio-Shield Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
