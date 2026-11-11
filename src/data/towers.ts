export interface SentinelTower {
  id: string;
  name: string;
  sector: string;
  kannadaName: string;
  lat: number;
  lng: number;
  elevation: number; // in meters
  battery: number; // percentage
  solarOutput: number; // in watts
  signalRssi: number; // dBm
  status: 'nominal' | 'alert' | 'warning' | 'offline';
  habitat: string;
  radiusKm: number;
  activeThreat?: ThreatIncident;
}

export interface ThreatIncident {
  id: string;
  towerId: string;
  towerName: string;
  sector: string;
  threatType: 'chainsaw' | 'elephant' | 'ambient' | 'poaching_gunshot';
  title: string;
  titleKannada: string;
  description: string;
  confidence: number; // percentage 0 - 100
  timestamp: string;
  coordinates: [number, number];
  status: 'unacknowledged' | 'acknowledged' | 'dispatched' | 'resolved' | 'false_positive';
  severity: 'critical' | 'warning' | 'nominal';
  audioSnippetUrl?: string;
  audioDurationSec: number;
  spectralFeatures: {
    peakFrequencyHz: number;
    spectralCentroidHz: number;
    infrasonicEnergy: number; // 0 - 1
    zeroCrossingRate: number;
    snrDb: number;
  };
  dispatchedUnit?: {
    unitName: string;
    personnelCount: number;
    etaMinutes: number;
    callSign: string;
  };
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export const SENTINEL_TOWERS: SentinelTower[] = [
  {
    id: 'TOWER-A',
    name: 'Tower A (Sector 1 - Kudremukh North)',
    sector: 'Sector 1 - Kudremukh North',
    kannadaName: 'ಗೋಪುರ A (ವಲಯ 1 - ಕುದುರೆಮುಖ ಉತ್ತರ)',
    lat: 13.234,
    lng: 75.252,
    elevation: 1894,
    battery: 94,
    solarOutput: 42,
    signalRssi: -68,
    status: 'nominal',
    habitat: 'Shola Grassland & Montane Wet Evergreen',
    radiusKm: 2.8,
  },
  {
    id: 'TOWER-B',
    name: 'Tower B (Sector 2 - Netravati River Buffer)',
    sector: 'Sector 2 - Netravati River Buffer',
    kannadaName: 'ಗೋಪುರ B (ವಲಯ 2 - ನೇತ್ರಾವತಿ ನದಿ ಬಫರ್)',
    lat: 13.082,
    lng: 75.318,
    elevation: 820,
    battery: 88,
    solarOutput: 38,
    signalRssi: -74,
    status: 'nominal',
    habitat: 'Riparian Dense Evergreen Canopy',
    radiusKm: 2.4,
  },
  {
    id: 'TOWER-C',
    name: 'Tower C (Sector 3 - Kadaba Fringe)',
    sector: 'Sector 3 - Kadaba Fringe',
    kannadaName: 'ಗೋಪುರ C (ವಲಯ 3 - ಕಡಬ ಗಡಿಭಾಗ)',
    lat: 12.784,
    lng: 75.395,
    elevation: 240,
    battery: 91,
    solarOutput: 45,
    signalRssi: -62,
    status: 'nominal',
    habitat: 'Forest-Agriculture Buffer (Elephant Corridor)',
    radiusKm: 3.2,
  },
  {
    id: 'TOWER-D',
    name: 'Tower D (Sector 4 - Shiradi Foothills)',
    sector: 'Sector 4 - Shiradi Foothills',
    kannadaName: 'ಗೋಪುರ D (ವಲಯ 4 - ಶಿರಾಡಿ ತಪ್ಪಲು)',
    lat: 12.928,
    lng: 75.602,
    elevation: 640,
    battery: 76,
    solarOutput: 29,
    signalRssi: -81,
    status: 'nominal',
    habitat: 'Semi-evergreen Dense Valley',
    radiusKm: 2.6,
  },
  {
    id: 'TOWER-E',
    name: 'Tower E (Sector 5 - Nagarhole Border)',
    sector: 'Sector 5 - Nagarhole Border',
    kannadaName: 'ಗೋಪುರ E (ವಲಯ 5 - ನಾಗರಹೊಳೆ ಗಡಿಭಾಗ)',
    lat: 12.583,
    lng: 75.681,
    elevation: 910,
    battery: 85,
    solarOutput: 36,
    signalRssi: -70,
    status: 'nominal',
    habitat: 'Moist Deciduous Wildlife Corridor',
    radiusKm: 3.0,
  },
];

// Western Ghats Reserve Protected Boundary Polygon (approximate Geo boundary)
export const FOREST_BOUNDARY_COORDS: [number, number][] = [
  [13.36, 75.14],
  [13.38, 75.32],
  [13.26, 75.40],
  [13.12, 75.46],
  [12.98, 75.68],
  [12.75, 75.72],
  [12.48, 75.78],
  [12.44, 75.58],
  [12.65, 75.34],
  [12.82, 75.24],
  [13.02, 75.18],
  [13.20, 75.12],
  [13.36, 75.14],
];

// High-priority Elephant corridor polygon
export const ELEPHANT_CORRIDOR_COORDS: [number, number][] = [
  [12.86, 75.32],
  [12.85, 75.48],
  [12.72, 75.52],
  [12.68, 75.36],
  [12.86, 75.32],
];

export const INITIAL_INCIDENTS: ThreatIncident[] = [
  {
    id: 'INC-2026-0891',
    towerId: 'TOWER-C',
    towerName: 'Tower C (Sector 3 - Kadaba Fringe)',
    sector: 'Sector 3 - Kadaba Fringe',
    threatType: 'elephant',
    title: 'Elephant Herd Movement (Rumbles & Trumpets)',
    titleKannada: 'ಆನೆಗಳ ಹಿಂಡಿನ ಚಲನವಲನ (ಘರ್ಜನೆ ಮತ್ತು ಕರೆ)',
    description: 'Infrasonic rumbles (18-24 Hz) and loud trumpeting vocalizations detected approaching Arecanut plantations within 400m of the reserve fence.',
    confidence: 91.2,
    timestamp: '14 mins ago',
    coordinates: [12.784, 75.395],
    status: 'unacknowledged',
    severity: 'critical',
    audioDurationSec: 4.8,
    spectralFeatures: {
      peakFrequencyHz: 220,
      spectralCentroidHz: 310,
      infrasonicEnergy: 0.88,
      zeroCrossingRate: 0.12,
      snrDb: 18.4,
    },
    dispatchedUnit: {
      unitName: 'Kadaba Rapid Conflict Mitigation Unit',
      personnelCount: 4,
      etaMinutes: 12,
      callSign: 'GAJARAJ-03',
    },
  },
  {
    id: 'INC-2026-0887',
    towerId: 'TOWER-A',
    towerName: 'Tower A (Sector 1 - Kudremukh North)',
    sector: 'Sector 1 - Kudremukh North',
    threatType: 'chainsaw',
    title: 'Illegal Felling Detected (Two-Stroke Motor)',
    titleKannada: 'ಅಕ್ರಮ ಮರ ಕಡಿಯುವ ಯಂತ್ರ ಪತ್ತೆ (ಚೈನ್ಸಾ)',
    description: 'Persistent 2-stroke chainsaw motor revving at 7,800 RPM with periodic timber load harmonic drops. Sector 1 Shola forest buffer.',
    confidence: 88.4,
    timestamp: '1 hr 22 mins ago',
    coordinates: [13.234, 75.252],
    status: 'dispatched',
    severity: 'critical',
    audioDurationSec: 5.2,
    spectralFeatures: {
      peakFrequencyHz: 1240,
      spectralCentroidHz: 2150,
      infrasonicEnergy: 0.15,
      zeroCrossingRate: 0.68,
      snrDb: 22.8,
    },
    dispatchedUnit: {
      unitName: 'Kudremukh Special Anti-Poaching Camp',
      personnelCount: 6,
      etaMinutes: 5,
      callSign: 'TIGER-FORCE-1',
    },
  },
  {
    id: 'INC-2026-0882',
    towerId: 'TOWER-B',
    towerName: 'Tower B (Sector 2 - Netravati River Buffer)',
    sector: 'Sector 2 - Netravati River Buffer',
    threatType: 'ambient',
    title: 'Normal Forest Ambiance (Rain & Insects)',
    titleKannada: 'ಸಾಮಾನ್ಯ ಅರಣ್ಯ ವಾತಾವರಣ (ಮಳೆ ಮತ್ತು ಕೀಟಗಳು)',
    description: 'Continuous cicada stridulation and light canopy rain patter. Baseline acoustic signature maintained.',
    confidence: 96.5,
    timestamp: '2 hrs 40 mins ago',
    coordinates: [13.082, 75.318],
    status: 'resolved',
    severity: 'nominal',
    audioDurationSec: 4.5,
    spectralFeatures: {
      peakFrequencyHz: 4800,
      spectralCentroidHz: 3900,
      infrasonicEnergy: 0.08,
      zeroCrossingRate: 0.44,
      snrDb: 6.2,
    },
  },
];
