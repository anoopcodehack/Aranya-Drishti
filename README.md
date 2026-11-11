# 🌲 Aranya-Drishti (ಅರಣ್ಯ ದೃಷ್ಟಿ)
### Autonomous Acoustic Surveillance Command Center for the Western Ghats

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38b2ac.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Mapping-199900.svg?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg?style=flat-square)](LICENSE)

> **Aranya-Drishti** (*Sanskrit / Kannada: "The Vision of the Forest"*) is an enterprise-grade autonomous acoustic intelligence dashboard engineered for forest divisions, anti-poaching squads, and rapid conflict mitigation teams across the UNESCO World Heritage Western Ghats reserve boundaries (Karnataka, India).

---

## 📑 Table of Contents

- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Core Features & Engineering Highlights](#-core-features--engineering-highlights)
- [Acoustic Sentinel Tower Grid (Kudremukh Perimeter)](#-acoustic-sentinel-tower-grid-kudremukh-perimeter)
- [Bioacoustic Machine Learning & Classification Pipeline](#-bioacoustic-machine-learning--classification-pipeline)
- [Getting Started / Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Installation & Startup](#installation--startup)
  - [Available Scripts](#available-scripts)
  - [Environment Variables](#environment-variables)
- [Directory & Component Layout](#-directory--component-layout)
- [Bilingual Alerting & Telegram Gateway](#-bilingual-alerting--telegram-gateway)
- [Standard Operating Procedure (SOP) & Legal Protocol](#-standard-operating-procedure-sop--legal-protocol)
- [Company Software Development Standards](#-company-software-development-standards)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🎯 Executive Overview

The Western Ghats of India house fragile tropical rainforest corridors subject to critical pressures:
1. **Illegal Timber Felling**: Clandestine extraction of valuable indigenous timber (Rosewood, Teak, Sandalwood) utilizing high-RPM two-stroke motorized chainsaws.
2. **Human-Elephant Conflict (HEC)**: Herds crossing fragmented buffer zones into agricultural arecanut, rubber, and paddy plantations near Kadaba and Shiradi, leading to crop damage and endangered animal retaliation.

**Aranya-Drishti** resolves these challenges by operating as an automated **edge-to-cloud acoustic command platform**:
- Ingests multi-spectral audio feeds from border acoustic towers.
- Runs bioacoustic inference on frequency, zero-crossing rates, and infrasound ratios.
- Renders high-contrast tactical GIS maps with real-time pulsing radar beacons.
- Dispatches bilingual warnings (**English and Kannada**) to frontline beat rangers and village panchayats via instant push alerts and Telegram Webhooks.

---

## 🏗️ System Architecture

```
                       +-------------------------------------------------------------+
                       |               Western Ghats Acoustic Perimeter              |
                       |       5x Solar-Powered Edge Sentinel Towers (A, B, C, D, E) |
                       +-------------------------------------------------------------+
                                       |                                    |
                    [Infrasound Sub-Sensors 14-35 Hz]        [MEMS Microphones 100Hz-8kHz]
                                       \                                    /
                                        +----------------------------------+
                                        |  VHF / LoRa / 4G Cellular Link   |
                                        +----------------------------------+
                                                         |
                                                         v
 +---------------------------------------------------------------------------------------------------------------+
 |                                          ARANYA-DRISHTI COMMAND ENGINE                                        |
 |                                                                                                               |
 |  +-------------------------------------+   +-------------------------------------+   +---------------------+  |
 |  |    Audio Ingestion & Screening      |   |   Bioacoustic Feature Extraction    |   |  Confidence Matrix  |  |
 |  |  - Live Workstation Mic Stream      |-->|  - Spectral Centroid & ZCR          |-->|  - Strict >75% Rule |  |
 |  |  - .WAV / .MP3 Drag & Drop Ingestion|   |  - Infrasonic Energy Ratio (<80Hz)  |   |  - Priority Alert   |  |
 |  |  - Synthesized Bioacoustic Presets  |   |  - Signal-to-Noise Ratio (dBFS)     |   |  - Review Required  |  |
 |  +-------------------------------------+   +-------------------------------------+   +---------------------+  |
 |                                                                                                 |             |
 |  +----------------------------------------------------------------------------------------------+             |
 |  |                                                                                                            |
 |  v                                              v                                               v             |
 | +-----------------------------+     +-----------------------------+               +-------------------------+ |
 | |   Leaflet Operations Map    |     |  Incident Operations Drawer |               |  Bilingual Alert Engine | |
 | | - Dark Ops / Satellite Tiles|     | - Audio Scrubber Replay     |               | - English & Kannada SMS | |
 | | - Green / Red Radar Beacons |     | - Strike Patrol Dispatch    |               | - Telegram Bot Webhook  | |
 | | - Forest Boundary Geometry  |     | - False Positive Resolution |               | - Gram Panchayat Audio  | |
 | +-----------------------------+     +-----------------------------+               +-------------------------+ |
 +---------------------------------------------------------------------------------------------------------------+
```

---

## 🚀 Core Features & Engineering Highlights

| Feature | Tech Implementation | Benefit |
| :--- | :--- | :--- |
| **Tactical Satellite GIS** | Leaflet.js + Custom SVG Markers + Dark Ops & Esri Tiles | Instant spatial awareness with concentric animated shockwave radar pings. |
| **Synthetic Audio Engine** | Pure Web Audio API (Multi-oscillator Formant Synthesis) | Runs **100% out-of-the-box** with zero external audio assets or audio file dependencies. |
| **Real-Time Visualizer** | HTML5 Canvas + `AnalyserNode` (Dual View) | Live oscilloscope waveform and 48-band FFT spectrum visualizer with dBFS meters. |
| **Bilingual Dispatch** | UTF-8 Kannada + English Notification Module | Delivers immediate, accessible warnings to both senior officials and local villagers. |
| **Patrol Strike Roster** | Tactical deployment modal with ETA calculations | Coordinates rapid anti-poaching squads and Elephant Task Force (ETF) vehicles. |
| **Evidence Dossier** | Filterable register with CSV report generation | Formats admissible records for documentation under the **Karnataka Forest Act 1963**. |

---

## 🗺️ Acoustic Sentinel Tower Grid (Kudremukh Perimeter)

| Tower ID | Sector Name | Kannada Sector Name | Coordinates (Lat, Lng) | Elevation | Range | Primary Eco-Zone |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TOWER-A** | Sector 1 - Kudremukh North | ವಲಯ 1 - ಕುದುರೆಮುಖ ಉತ್ತರ | `13.234° N, 75.252° E` | 1,894 m | 2.8 km | Shola Grasslands / Wet Evergreen |
| **TOWER-B** | Sector 2 - Netravati River Buffer | ವಲಯ 2 - ನೇತ್ರಾವತಿ ನದಿ ಬಫರ್ | `13.082° N, 75.318° E` | 820 m | 2.4 km | Riparian Dense River Valley |
| **TOWER-C** | Sector 3 - Kadaba Fringe | ವಲಯ 3 - ಕಡಬ ಗಡಿಭಾಗ | `12.784° N, 75.395° E` | 240 m | 3.2 km | Forest-Agriculture Elephant Corridor |
| **TOWER-D** | Sector 4 - Shiradi Foothills | ವಲಯ 4 - ಶಿರಾಡಿ ತಪ್ಪಲು | `12.928° N, 75.602° E` | 640 m | 2.6 km | Semi-Evergreen High-Felling Area |
| **TOWER-E** | Sector 5 - Nagarhole Border | ವಲಯ 5 - ನಾಗರಹೊಳೆ ಗಡಿಭಾಗ | `12.583° N, 75.681° E` | 910 m | 3.0 km | Moist Deciduous Wildlife Corridor |

---

## 🧠 Bioacoustic Machine Learning & Classification Pipeline

The client-side intelligence layer processes 48 kHz / 16-bit PCM audio through a multi-stage acoustic classifier:

### 1. Feature Extraction Parameters
- **Zero-Crossing Rate (ZCR)**: Quantifies the sign-change rate of the audio waveform. High ZCR ($\ge 0.55$) strongly correlates with mechanical friction, sawteeth biting timber, and combustion exhaust rasp.
- **Spectral Centroid**: The "center of mass" of the frequency spectrum. Mechanical chainsaws cluster between $1,800\text{ Hz} - 2,800\text{ Hz}$, whereas ambient rainfall sits above $3,500\text{ Hz}$.
- **Infrasonic Energy Ratio ($<80\text{ Hz}$)**: Measures subterranean acoustic energy. Elephant rumbles yield visceral energy in the $18\text{ Hz} - 35\text{ Hz}$ window.
- **Signal-to-Noise Ratio (SNR dB)**: Eliminates false triggers from wind gust turbulence.

### 2. Decision Logic
```typescript
if (infrasonicEnergy > 0.65 || (peakFrequencyHz < 350 && zeroCrossingRate < 0.25)) {
  // Classification: Elephant Vocalization Signature
  // Threat Severity: Warning / Conflict Mitigation
} else if (zeroCrossingRate > 0.50 && spectralCentroidHz > 1600 && snrDb > 14) {
  // Classification: Chainsaw Motor Signature
  // Threat Severity: CRITICAL (Illegal Timber Felling)
} else {
  // Classification: Normal Canopy Ambiance / Rain
  // Threat Severity: Nominal Baseline
}
```

- **Confidence Threshold Rule**:
  - $\text{Confidence} > 75\%$: Triggers instant **Priority Red Alert** with flashing radar blips and siren broadcast.
  - $\text{Confidence} \le 75\%$: Flags event for ranger review.

---

## 💻 Getting Started / Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher (tested on Node `22.x`)
- **Package Manager**: `npm` `10.x` or higher
- **Modern Browser**: Chrome, Edge, Safari, or Firefox with Web Audio API support.

### Installation & Startup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/aranya-drishti.git
cd aranya-drishti

# 2. Install dependencies cleanly
npm install

# 3. Setup environment variables (optional for local mock testing)
cp .env.example .env

# 4. Launch development server on port 3000
npm run dev
```

Visit **`http://localhost:3000`** in your browser. The application initializes immediately with fully functional mock generators and pre-configured telemetry.

---

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the local Vite dev server with hot reload at `localhost:3000` |
| `npm run build` | Compiles and packages production assets into `/dist` via `tsc -b && vite build` |
| `npm run lint` | Executes TypeScript compiler verification (`tsc --noEmit`) to catch type faults |
| `npm run preview` | Starts a local server to preview the production build artifacts |

---

### Environment Variables

Configure these in `.env` (or via the AI Studio Secrets panel in production):

```env
# GEMINI_API_KEY: Optional - enables server-side generative analysis reports
GEMINI_API_KEY="AIzaSy..."

# APP_URL: Production or preview host URL
APP_URL="https://your-domain.run.app"
```

*(Note: Live Telegram integration can also be configured dynamically in the UI modal via Bot Token and Chat ID).*

---

## 📂 Directory & Component Layout

```
.
├── .env.example                     # Environment template (no secrets committed)
├── index.html                       # HTML5 entry point with Manrope & JetBrains Mono fonts
├── metadata.json                    # AI Studio manifest & microphone permissions
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # Strict TypeScript configuration
├── vite.config.ts                   # Vite bundler configuration with Tailwind v4 plugin
└── src/
    ├── main.tsx                     # React 19 root bootstrap
    ├── index.css                    # Tailwind CSS v4 directives & Leaflet dark ops styling
    ├── App.tsx                      # Primary Command Center layout & Top Bar contract
    ├── data/
    │   └── towers.ts                # Sentinel towers array, GPS coordinates, initial incidents
    ├── utils/
    │   ├── audioEngine.ts           # Web Audio API engine (synthesizers, mic recorder, WAV encoder)
    │   └── inferenceEngine.ts       # Acoustic feature extraction, classification & Telegram dispatcher
    └── components/
        ├── OperationsMap.tsx        # Leaflet tactical satellite map with pulsing radar beacons
        ├── AudioIngestionModule.tsx # 3-mode audio intake (Mic, File Upload, 3 Quick-Demo presets)
        ├── AudioVisualizer.tsx      # Dual-mode HTML5 Canvas oscilloscope & 48-band FFT spectrum
        ├── IncidentDrawer.tsx       # Slide-over incident dossier with audio scrubber & team dispatch
        ├── IncidentLogTable.tsx     # Searchable/filterable incident table with CSV export
        ├── SentinelGridHealth.tsx   # 5-node hardware telemetry strip with quick-trigger drills
        ├── TelegramAlertModal.tsx   # Bilingual SMS/Telegram alert pop-up with Webhook gateway
        └── PatrolUnitsModal.tsx     # Tactical Anti-Poaching Camp (APC) and ETF vehicle roster
```

---

## 📱 Bilingual Alerting & Telegram Gateway

Every threat event generates synchronized bilingual communications:

### 1. Elephant Movement (ಕಡಬ ಗಡಿಭಾಗ / Kadaba Fringe)
- **English**:
  > `⚠️ ALERT: Elephant movement detected at Tower C (Kadaba Fringe). Avoid agricultural perimeters and fringe trails.`
- **Kannada**:
  > `⚠️ ಎಚ್ಚರಿಕೆ: ಗೋಪುರ C (ಕಡಬ ಗಡಿಭಾಗ) ಬಳಿ ಆನೆಗಳ ಚಲನವಲನ ಕಂಡುಬಂದಿದೆ. ರೈತರು ತೋಟಗಳ ಬಳಿ ಹೋಗದೆ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿರಿ.`

### 2. Illegal Chainsaw Logging (ಕುದುರೆಮುಖ ಉತ್ತರ / Kudremukh North)
- **English**:
  > `🚨 CRITICAL ALERT: Chainsaw motor acoustic signature detected at Tower A (Kudremukh North). Illegal timber felling in progress. Lat: 13.234, Lng: 75.252. Dispatch anti-poaching camp immediately.`
- **Kannada**:
  > `🚨 ಗಂಭೀರ ಎಚ್ಚರಿಕೆ: ಗೋಪುರ A (ಕುದುರೆಮುಖ ಉತ್ತರ) ಬಳಿ ಮರ ಕಡಿಯುವ ಯಂತ್ರದ (ಚೈನ್ಸಾ) ಶಬ್ದ ಪತ್ತೆಯಾಗಿದೆ. ಅಕ್ರಮ ಮರ ಕಡಿತ ನಡೆಯುತ್ತಿದೆ. ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ತಂಡವನ್ನು ಕೂಡಲೇ ರವಾನಿಸಿ.`

---

## 📋 Standard Operating Procedure (SOP) & Legal Protocol

When an alert triggers in the field, rangers follow a 4-step workflow compliant with the **Karnataka Forest Act 1963** & **Wildlife Protection Act 1972**:

```
[1. ACOUSTIC TRIGGER] ──> [2. CONFIRM & ACK] ──> [3. PATROL DISPATCH] ──> [4. RECORD & EXPORT]
- Infrasound / motor      - Review confidence %   - Select nearest APC    - Export time-stamped
  vibration detected       and replay snippet      unit (ETA 5-15 min)     CSV dossier for court
  at boundary tower.       in incident drawer.     via encrypted VHF.      evidence and FIR.
```

---

## 🏢 Company Software Development Standards

To maintain professional engineering hygiene, contributions must adhere to the following standards:

1. **Zero-Pill Typography Discipline**:
   - Avoid static decorative pill containers for metadata. Use clean unboxed text separated by typographic markers (`·`, `/`).
2. **Strict Top Bar Contract**:
   - The top navigation bar contains exactly three zones: `[Brand Wordmark]` — `[4-5 Single-line Links]` — `[1 Primary Action Button]`.
3. **Compositor-Only Animations**:
   - Animate only `transform`, `opacity`, and `filter`. Avoid layout thrashing on high-frequency audio visualizers.
4. **Hermetic Out-of-the-Box Operation**:
   - The project must build and run on any developer machine without external media hosts or proprietary local files.
5. **Git Commit Format**:
   - Follow [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat(audio): add Mel-frequency band classifier`
     - `fix(map): correct marker pulse anchor position`
     - `docs(readme): add enterprise deployment guidelines`

---

## 📜 License & Acknowledgments

- **License**: Distributed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.
- **Field Data Grounding**: Western Ghats Forest Division & Kudremukh Wildlife Division GIS coordinates.
- **Acoustic Standards**: Formulated in accordance with bioacoustic monitoring standards for the Asian Elephant (*Elephas maximus*) and motorized two-stroke forestry equipment.

---

*Dedicated to the forest guards and wildlife rangers defending the biodiversity of the Western Ghats.* 🌲🐅🐘
