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
  ExternalLink,
  Lock,
  CheckCircle2,
  Globe,
  Sun,
  Battery,
} from 'lucide-react';

// Official uploaded logo asset
const ARANYA_LOGO_SRC = '/assets/aistudio/image_033d2753.png';

// High-impact wildlife visual assets
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
          TOP HEADER WITH OFFICIAL ARANYA-DRISHTI LOGO (High-Contrast Header)
          ========================================================================= */}
      <header className="absolute top-0 inset-x-0 z-[1100] px-5 sm:px-10 py-4 flex items-center justify-between gap-6 bg-gradient-to-b from-black via-black/85 to-transparent">
        {/* Brand Logo Lockup */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3 shadow-2xl">
            <img
              src={ARANYA_LOGO_SRC}
              alt="Aranya-Drishti — See · Protect · Preserve"
              referrerPolicy="no-referrer"
              className="h-10 sm:h-12 w-auto object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Clean Center Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wide text-zinc-200">
          <button
            onClick={() => scrollToSection(operationsSectionRef)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            Operations Map
            {alertTowerCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
          </button>
          <button
            onClick={() => scrollToSection(audioModuleRef)}
            className="hover:text-emerald-400 transition-colors"
          >
            Audio Screening
          </button>
          <button
            onClick={() => scrollToSection(towersSectionRef)}
            className="hover:text-emerald-400 transition-colors"
          >
            Sentinel Array
          </button>
          <button
            onClick={() => scrollToSection(incidentsLogRef)}
            className="hover:text-emerald-400 transition-colors"
          >
            Incident Log ({incidents.length})
          </button>
          <button
            onClick={() => setIsPatrolModalOpen(true)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Patrol Roster</span>
          </button>
        </nav>

        {/* Action Button: Warm Amber Pill (matching "Tickets" in reference) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTriggerDrill('chainsaw')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-orange-950/60 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <AlertTriangle className="w-4 h-4 fill-current text-amber-100" />
            <span>Simulate Threat Drill</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO BANNER SECTION (Deep Dramatic Nature Backdrop)
          ========================================================================= */}
      <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden pt-24 pb-20 bg-black">
        {/* Background Image: Majestic Asian Elephant in Western Ghats mist */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroElephantImg}
            alt="Majestic Western Ghats Wildlife"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.75] contrast-[1.05]"
          />
          {/* Measured Pure Black Left Vignette Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent w-full md:w-3/4 z-1" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-1" />
        </div>

        {/* Hero Content Left */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-2xl space-y-4">
            {/* Live Sentinel Alert Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-white text-xs font-mono shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>5 / 5 Sentinel Towers Active · Western Ghats Perimeter</span>
            </div>

            {/* Headline matching Bearizona reference: "It's Time To / Protect the Wild" */}
            <div className="space-y-0.5">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                It's Time To
              </h1>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 leading-none py-1">
                Protect the Wild
              </h2>
            </div>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
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
            <div className="flex items-center gap-4 pt-2 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Infrasound Sub-Sensors (14–35 Hz)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                Anti-Poaching Rapid Strike
              </span>
            </div>
          </div>
        </div>

        {/* Organic Wave Divider Transitioning to Clean White Section Below */}
        <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none overflow-hidden leading-none">
          <svg
            className="w-full h-12 sm:h-16 text-[#f4f4f5] fill-current"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
          >
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,21.3C960,21,1056,43,1152,48C1248,53,1344,43,1392,37.3L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: CRISP WHITE & LIGHT-GREY SECTION (Requested Contrast!)
          4 Quick-Access Telemetry Cards (Matching Bearizona's Getting Here / Admissions)
          ========================================================================= */}
      <section className="relative z-30 bg-[#f4f4f5] text-zinc-900 px-6 sm:px-10 py-8 border-b border-zinc-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Sentinel Towers */}
            <div
              onClick={() => scrollToSection(towersSectionRef)}
              className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group shadow-sm"
            >
              <div className="w-13 h-13 rounded-full border-2 border-emerald-600/30 bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                  Sentinel Towers
                </h3>
                <p className="text-xs text-zinc-600 font-mono">5 Active Boundary Nodes</p>
                <p className="text-[11px] text-emerald-700 font-semibold">100% Solar & VHF Linked</p>
              </div>
            </div>

            {/* 2. Acoustic Screening */}
            <div
              onClick={() => scrollToSection(audioModuleRef)}
              className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group shadow-sm"
            >
              <div className="w-13 h-13 rounded-full border-2 border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-800 group-hover:scale-110 transition-transform shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                  Acoustic Screening
                </h3>
                <p className="text-xs text-zinc-600 font-mono">Real-Time Waveform FFT</p>
                <p className="text-[11px] text-zinc-700 font-semibold">Mic · WAV · Soundboard</p>
              </div>
            </div>

            {/* 3. Tactical GIS Map */}
            <div
              onClick={() => scrollToSection(operationsSectionRef)}
              className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group shadow-sm"
            >
              <div className="w-13 h-13 rounded-full border-2 border-amber-600/30 bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-amber-700 transition-colors">
                  Operations Map
                </h3>
                <p className="text-xs text-zinc-600 font-mono">Kudremukh Lat 13.133°</p>
                <p className="text-[11px] text-amber-700 font-semibold">Pulsing Radar Blips</p>
              </div>
            </div>

            {/* 4. Emergency Alerts & Patrols */}
            <div
              onClick={() => setIsPatrolModalOpen(true)}
              className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group shadow-sm"
            >
              <div className="w-13 h-13 rounded-full border-2 border-orange-600/30 bg-orange-50 flex items-center justify-center text-orange-700 group-hover:scale-110 transition-transform shrink-0">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-orange-700 transition-colors">
                  Bilingual Dispatch
                </h3>
                <p className="text-xs text-zinc-600 font-mono">Telegram & SMS Gateway</p>
                <p className="text-[11px] text-orange-700 font-kannada font-semibold">ಕನ್ನಡ & English Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CRISP WHITE SECTION (Matching "About Bearizona Wildlife Park")
          Tiger Portrait + Clean Light Aesthetic
          ========================================================================= */}
      <section className="bg-white text-zinc-900 px-6 sm:px-10 py-16 border-b border-zinc-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Framed High-Resolution Wildlife Photograph */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group bg-zinc-100 ring-1 ring-zinc-200">
              <img
                src={tigerPortraitImg}
                alt="Bengal Tiger in Western Ghats Reserve"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-xs font-mono text-white">
                <span className="font-bold text-amber-300 block text-sm">Royal Bengal Tiger Corridor</span>
                <span className="text-zinc-200 text-[11px]">Sector 1 Shola Grassland Buffer · 24/7 Acoustic Guard</span>
              </div>
            </div>
          </div>

          {/* Right: Narrative Prose & Action Button */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                <span className="font-serif italic text-emerald-700 font-normal mr-2">About</span>
                Aranya-Drishti Acoustic Shield
              </h2>
              <p className="text-xs font-kannada text-emerald-800 font-semibold">
                ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ಸ್ವಯಂಚಾಲಿತ ಅಕೌಸ್ಟಿಕ್ ಕಣ್ಗಾವಲು ವ್ಯವಸ್ಥೆ
              </p>
            </div>

            <p className="text-zinc-700 text-sm sm:text-base leading-relaxed">
              Spanning the rugged evergreen ridges from Kudremukh to Nagarhole, Aranya-Drishti monitors high-risk
              corridors vulnerable to covert timber syndicates and human-wildlife encounters. Using high-frequency
              combustion vibration filters, the system isolates illegal chainsaw felling within 4 seconds while
              picking up 14–35 Hz infrasonic elephant rumbles before herds enter agricultural fringes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-[#f4f4f5] p-4 rounded-xl border border-zinc-200 shadow-sm">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">ACOUSTIC RANGE</span>
                <span className="text-base font-extrabold text-zinc-900">14.8 km Radius</span>
              </div>
              <div className="bg-[#f4f4f5] p-4 rounded-xl border border-zinc-200 shadow-sm">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">AI INFERENCE</span>
                <span className="text-base font-extrabold text-emerald-700">&lt; 700 ms Latency</span>
              </div>
              <div className="bg-[#f4f4f5] p-4 rounded-xl border border-zinc-200 shadow-sm">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">ACCURACY</span>
                <span className="text-base font-extrabold text-zinc-900">&gt; 91% Reliability</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => scrollToSection(towersSectionRef)}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all"
              >
                Inspect Sentinel Tower Array &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HIGH-TECH TACTICAL OPERATIONS CENTER (Deep Charcoal/Black Backdrop)
          Where the Leaflet Map & Audio Visualizer have maximum glowing contrast!
          ========================================================================= */}
      <section
        ref={operationsSectionRef}
        className="bg-[#0a0a0a] text-zinc-100 px-6 sm:px-10 py-16 border-b border-zinc-800"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800 pb-4">
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
                className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test Chainsaw Drill</span>
              </button>
              <button
                onClick={() => handleTriggerDrill('elephant', 'TOWER-C')}
                className="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
          SECTION 4: CRISP WHITE/LIGHT-GREY SHOWCASE SECTION (Explore Threat Signatures)
          Matching "Explore Our Animals" from Bearizona reference
          ========================================================================= */}
      <section className="bg-[#f4f4f5] text-zinc-900 px-6 sm:px-10 py-16 border-b border-zinc-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-emerald-700 uppercase tracking-widest block font-bold">
                BIOACOUSTIC RECONNAISSANCE PROFILES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Explore Target <span className="font-serif italic text-emerald-700 font-normal">Threat Signatures</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-600 hidden sm:inline">
              Multi-Spectral Neural Matching
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Chainsaw Motor Card */}
            <div className="group rounded-2xl overflow-hidden bg-white border border-zinc-200/90 hover:border-red-500 hover:shadow-2xl transition-all flex flex-col justify-between shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={chainsawTimberImg}
                  alt="Chainsaw motor timber felling"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-red-600 text-white font-bold uppercase shadow">
                  CRITICAL THREAT
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                    Chainsaw Motor (2-Stroke)
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                    Two-stroke engine scream (110–260 Hz fundamental + tooth cutting friction rasp).
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-600">88.4% Confidence</span>
                  <button
                    onClick={() => handleTriggerDrill('chainsaw', 'TOWER-A')}
                    className="px-3 py-1 text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Asian Elephant Card */}
            <div className="group rounded-2xl overflow-hidden bg-white border border-zinc-200/90 hover:border-amber-500 hover:shadow-2xl transition-all flex flex-col justify-between shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={heroElephantImg}
                  alt="Asian Elephant Herd"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-600 text-white font-bold uppercase shadow">
                  CONFLICT RISK
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                    Asian Elephant Herd
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                    Infrasonic chest rumbles (18–35 Hz) and loud formant trumpeting near Kadaba fringe.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-700">91.2% Confidence</span>
                  <button
                    onClick={() => handleTriggerDrill('elephant', 'TOWER-C')}
                    className="px-3 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Monsoon Rainforest Canopy Card */}
            <div className="group rounded-2xl overflow-hidden bg-white border border-zinc-200/90 hover:border-emerald-500 hover:shadow-2xl transition-all flex flex-col justify-between shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={canopyLandscapeImg}
                  alt="Kudremukh Monsoon Canopy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-700 text-white font-bold uppercase shadow">
                  BASELINE (CLEAR)
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    Monsoon Canopy Baseline
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                    Continuous tropical rain patter, canopy leaf rustle, and high-frequency cicada pulses.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-700">95.0% Normal</span>
                  <button
                    onClick={() => {
                      audioEngine.createAmbientBuffer().then((buf) => audioEngine.playBuffer(buf));
                    }}
                    className="px-3 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors"
                  >
                    Listen
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Bengal Tiger Apex Corridor Card */}
            <div className="group rounded-2xl overflow-hidden bg-white border border-zinc-200/90 hover:border-zinc-500 hover:shadow-2xl transition-all flex flex-col justify-between shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={tigerPortraitImg}
                  alt="Royal Bengal Tiger Corridor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-white font-bold uppercase shadow">
                  CORRIDOR GUARD
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    Tiger Migratory Corridor
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                    Kudremukh to Pushpagiri contiguous corridor protected against vehicular and snare poaching.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-700">Protected Zone</span>
                  <button
                    onClick={() => setIsPatrolModalOpen(true)}
                    className="px-3 py-1 text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg border border-zinc-300 transition-colors"
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
          SECTION 5: SENTINEL ARRAY HARDWARE TELEMETRY SECTION (Charcoal / Neutral)
          ========================================================================= */}
      <section ref={towersSectionRef} className="bg-[#0e0e0e] px-6 sm:px-10 py-12 border-b border-zinc-800">
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
          SECTION 6: INCIDENT LOG & OPERATIONS TABLE SECTION (Pure Black / Neutral)
          ========================================================================= */}
      <section ref={incidentsLogRef} className="bg-black px-6 sm:px-10 py-12 border-b border-zinc-800">
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

      {/* =========================================================================
          COMPREHENSIVE PROFESSIONAL FOOTER (Official Logo, Links, Dispatch Hotline)
          ========================================================================= */}
      <footer className="bg-[#050505] text-zinc-400 border-t border-zinc-800 pt-16 pb-12 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Column 1 & 2: Brand Identity & Official Logo */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-xl bg-white/10 border border-zinc-700 inline-block">
                  <img
                    src={ARANYA_LOGO_SRC}
                    alt="Aranya-Drishti Logo"
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto object-contain rounded"
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                <strong>Aranya-Drishti (ಅರಣ್ಯ ದೃಷ್ಟಿ)</strong> is the autonomous acoustic intelligence platform
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
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleSelectTower(towers[0])}>
                  • Tower A: Kudremukh North (13.234° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleSelectTower(towers[1])}>
                  • Tower B: Netravati Buffer (13.082° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleSelectTower(towers[2])}>
                  • Tower C: Kadaba Fringe (12.784° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleSelectTower(towers[3])}>
                  • Tower D: Shiradi Foothills (12.928° N)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleSelectTower(towers[4])}>
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
