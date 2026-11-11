import { ThreatIncident } from '../data/towers';

export interface InferenceResult {
  threatType: 'chainsaw' | 'elephant' | 'ambient' | 'poaching_gunshot';
  title: string;
  titleKannada: string;
  confidence: number; // 0 - 100
  severity: 'critical' | 'warning' | 'nominal';
  requiresReview: boolean; // true if confidence <= 75
  classificationLabel: string;
  classificationLabelKannada: string;
  description: string;
  descriptionKannada: string;
  spectralFeatures: {
    peakFrequencyHz: number;
    spectralCentroidHz: number;
    infrasonicEnergy: number; // 0 to 1
    zeroCrossingRate: number; // 0 to 1
    snrDb: number;
    harmonicDensity: number;
  };
  recommendedActions: {
    en: string[];
    kn: string[];
  };
  bilingualAlert: {
    english: string;
    kannada: string;
  };
}

/**
 * Perform acoustic feature extraction from AudioBuffer PCM data
 */
export function extractAcousticFeatures(buffer: AudioBuffer): {
  peakFrequencyHz: number;
  spectralCentroidHz: number;
  infrasonicEnergy: number;
  zeroCrossingRate: number;
  snrDb: number;
  harmonicDensity: number;
  rms: number;
} {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const length = data.length;

  // 1. Zero Crossing Rate (ZCR)
  let zeroCrossings = 0;
  let sumSquares = 0;
  for (let i = 1; i < length; i++) {
    if ((data[i] >= 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] >= 0)) {
      zeroCrossings++;
    }
    sumSquares += data[i] * data[i];
  }
  const zcr = zeroCrossings / length;
  const rms = Math.sqrt(sumSquares / length);

  // 2. Frequency Analysis via simple DFT sampling on a representative slice
  const fftSize = 1024;
  const numSlices = Math.min(8, Math.floor(length / fftSize));
  let lowFreqPower = 0; // < 80 Hz (infrasound / low rumble)
  let midFreqPower = 0; // 100 - 1800 Hz (chainsaw fundamental + elephant trumpet)
  let highFreqPower = 0; // > 3000 Hz (cicadas, wind rasp)
  let totalPower = 0;
  let weightedFreqSum = 0;
  let maxBinMagnitude = 0;
  let maxBinIndex = 0;

  for (let s = 0; s < numSlices; s++) {
    const offset = s * Math.floor(length / numSlices);
    for (let k = 1; k < fftSize / 2; k++) {
      let real = 0;
      let imag = 0;
      const binFreq = (k * sampleRate) / fftSize;

      // subsample by 2 for speed
      for (let n = 0; n < fftSize; n += 2) {
        const val = data[offset + n] || 0;
        const angle = (2 * Math.PI * k * n) / fftSize;
        real += val * Math.cos(angle);
        imag -= val * Math.sin(angle);
      }

      const mag = Math.sqrt(real * real + imag * imag);
      totalPower += mag;
      weightedFreqSum += mag * binFreq;

      if (mag > maxBinMagnitude) {
        maxBinMagnitude = mag;
        maxBinIndex = k;
      }

      if (binFreq < 90) lowFreqPower += mag;
      else if (binFreq >= 90 && binFreq <= 2200) midFreqPower += mag;
      else highFreqPower += mag;
    }
  }

  const peakFreq = Math.round((maxBinIndex * sampleRate) / fftSize);
  const spectralCentroid = totalPower > 0 ? Math.round(weightedFreqSum / totalPower) : 1200;
  const infrasonicRatio = totalPower > 0 ? Math.min(1, (lowFreqPower * 2.5) / totalPower) : 0.1;
  const snr = Math.max(4, Math.min(32, Math.round(20 * Math.log10((rms + 0.001) / 0.012))));
  const harmonicDensity = Math.min(1, Math.max(0.1, (midFreqPower / (totalPower || 1))));

  return {
    peakFrequencyHz: peakFreq || 440,
    spectralCentroidHz: Math.max(120, spectralCentroid),
    infrasonicEnergy: Number(infrasonicRatio.toFixed(3)),
    zeroCrossingRate: Number(zcr.toFixed(3)),
    snrDb: snr,
    harmonicDensity: Number(harmonicDensity.toFixed(3)),
    rms,
  };
}

/**
 * Primary AI Bioacoustic Classifier
 */
export function classifyAcousticSignature(
  features: ReturnType<typeof extractAcousticFeatures>,
  hintType?: 'chainsaw' | 'elephant' | 'ambient' | 'custom',
  targetTowerName = 'Tower C (Sector 3 - Kadaba Fringe)'
): InferenceResult {
  // If simulated preset is chosen, inject domain ground-truth model characteristics
  if (hintType === 'chainsaw') {
    const conf = 88.4 + Math.random() * 6.2;
    return {
      threatType: 'chainsaw',
      title: 'Illegal Felling Detected (Two-Stroke Motor)',
      titleKannada: 'ಅಕ್ರಮ ಮರ ಕಡಿಯುವ ಯಂತ್ರ ಪತ್ತೆ (ಚೈನ್ಸಾ)',
      confidence: Number(conf.toFixed(1)),
      severity: 'critical',
      requiresReview: conf <= 75,
      classificationLabel: 'Chainsaw Motor Signature (Illegal Timber Felling)',
      classificationLabelKannada: 'ಚೈನ್ಸಾ ಮೋಟಾರ್ ಶಬ್ದ (ಅಕ್ರಮ ಮರ ಕಡಿತ)',
      description: 'Persistent 2-stroke mechanical harmonics (110–260 Hz base firing with cutting blade friction rasp) detected within reserve boundary.',
      descriptionKannada: 'ಅರಣ್ಯ ಗಡಿಭಾಗದಲ್ಲಿ ದ್ವಿ-ಸ್ಟ್ರೋಕ್ ಎಂಜಿನ್ ಮತ್ತು ಮರ ಕಡಿಯುವ ಗರಗಸದ ತೀವ್ರ ಧ್ವನಿ ತರಂಗಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
      spectralFeatures: {
        peakFrequencyHz: 1280,
        spectralCentroidHz: 2340,
        infrasonicEnergy: 0.14,
        zeroCrossingRate: 0.64,
        snrDb: 24.2,
        harmonicDensity: 0.82,
      },
      recommendedActions: {
        en: [
          'Dispatch Sector Anti-Poaching Camp (APC) strike team immediately.',
          'Secure peripheral forest entry tracks and river ghat checkposts.',
          'Notify Range Forest Officer (RFO) and initiate drone aerial thermal scout.',
        ],
        kn: [
          'ಕೂಡಲೇ ವಲಯ ವಿರೋಧಿ ಬೇಟೆ ತಡೆ ಶಿಬಿರ (APC) ಸಿಬ್ಬಂದಿಯನ್ನು ನಿಯೋಜಿಸಿ.',
          'ಅರಣ್ಯ ಪ್ರವೇಶ ದ್ವಾರಗಳು ಮತ್ತು ನದಿ ಚೆಕ್ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಬಂದ್ ಮಾಡಿ.',
          'ವಲಯ ಅರಣ್ಯಾಧಿಕಾರಿಗಳಿಗೆ (RFO) ಮಾಹಿತಿ ನೀಡಿ ಡ್ರೋನ್ ಮೂಲಕ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
        ],
      },
      bilingualAlert: {
        english: `🚨 CRITICAL ALERT: Illegal chainsaw felling acoustic signature detected at ${targetTowerName}. Confidence: ${conf.toFixed(1)}%. Dispatching anti-poaching strike camp.`,
        kannada: `🚨 ಗಂಭೀರ ಎಚ್ಚರಿಕೆ: ${targetTowerName} ಬಳಿ ಮರ ಕಡಿಯುವ ಯಂತ್ರದ (ಚೈನ್ಸಾ) ಶಬ್ದ ಪತ್ತೆಯಾಗಿದೆ. ನಂಬಿಕೆ: ${conf.toFixed(1)}%. ಅರಣ್ಯ ಗಸ್ತು ತಂಡ ನಿಯೋಜಿಸಲಾಗಿದೆ.`,
      },
    };
  }

  if (hintType === 'elephant') {
    const conf = 91.2 + Math.random() * 5.4;
    return {
      threatType: 'elephant',
      title: 'Elephant Herd Movement (Infrasound / Trumpet)',
      titleKannada: 'ಆನೆಗಳ ಹಿಂಡಿನ ಚಲನವಲನ (ಘರ್ಜನೆ ಮತ್ತು ಕರೆ)',
      confidence: Number(conf.toFixed(1)),
      severity: 'warning',
      requiresReview: conf <= 75,
      classificationLabel: 'Elephant Vocalization (Human-Wildlife Conflict Risk)',
      classificationLabelKannada: 'ಆನೆಗಳ ಧ್ವನಿ (ಮಾನವ-ವನ್ಯಜೀವಿ ಸಂಘರ್ಷದ ಅಪಾಯ)',
      description: 'Deep infrasonic chest vibrations (18–32 Hz) coupled with high-formant trumpet vocalizations indicate herd movement towards forest edge.',
      descriptionKannada: 'ಆನೆಗಳ ಆಳವಾದ ಇನ್‌ಫ್ರಾಸಾನಿಕ್ ಶಬ್ದ (18–32 Hz) ಮತ್ತು ತುರ್ತು ಕಹಳೆ ಕೂಗು ಕೃಷಿ ಭೂಮಿಯತ್ತ ಹಿಂಡಿನ ಆಗಮನವನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
      spectralFeatures: {
        peakFrequencyHz: 240,
        spectralCentroidHz: 380,
        infrasonicEnergy: 0.91,
        zeroCrossingRate: 0.15,
        snrDb: 19.5,
        harmonicDensity: 0.74,
      },
      recommendedActions: {
        en: [
          'Trigger solar acoustic warning sirens along agricultural fencing.',
          'Broadcast bilingual SMS/Telegram advisory to Kadaba / Shiradi farmers.',
          'Deploy Elephant Task Force (ETF) vehicle with searchlights and noise crackers.',
        ],
        kn: [
          'ಕೃಷಿ ಗಡಿಭಾಗದ ಸೌರ ವಿದ್ಯುತ್ ಬೇಲಿ ಸೈರನ್‌ಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
          'ಕಡಬ ಮತ್ತು ಶಿರಾಡಿ ಗ್ರಾಮಸ್ಥರಿಗೆ ತುರ್ತು ಕನ್ನಡ ಎಸ್‌ಎಂಎಸ್ ರವಾನಿಸಿ.',
          'ಆನೆ ಕಾರ್ಯಪಡೆ (ETF) ವಾಹನವನ್ನು ಸ್ಥಳಕ್ಕೆ ರವಾನಿಸಿ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಡಿಗೆ ಮರಳಿಸಿ.',
        ],
      },
      bilingualAlert: {
        english: `⚠️ ALERT: Elephant movement detected at ${targetTowerName}. Avoid agricultural perimeters and forest fringe trails.`,
        kannada: `⚠️ ಎಚ್ಚರಿಕೆ: ${targetTowerName} ಬಳಿ ಆನೆಗಳ ಚಲನವಲನ ಕಂಡುಬಂದಿದೆ. ರೈತರು ತೋಟಗಳ ಬಳಿ ಹೋಗದೆ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿರಿ.`,
      },
    };
  }

  if (hintType === 'ambient') {
    const conf = 95.0 + Math.random() * 3.8;
    return {
      threatType: 'ambient',
      title: 'Normal Forest Ambiance (Rain & Insects)',
      titleKannada: 'ಸಾಮಾನ್ಯ ಅರಣ್ಯ ವಾತಾವರಣ (ಮಳೆ ಮತ್ತು ಕೀಟಗಳು)',
      confidence: Number(conf.toFixed(1)),
      severity: 'nominal',
      requiresReview: false,
      classificationLabel: 'Normal Forest Baseline (No Threat Detected)',
      classificationLabelKannada: 'ಸಾಮಾನ್ಯ ಅರಣ್ಯ ಸಹಜ ವಾತಾವರಣ (ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ)',
      description: 'Acoustic landscape dominated by Western Ghats canopy wind, monsoon raindrop impact, and nocturnal cicada stridulation (5–7 kHz).',
      descriptionKannada: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಳೆ ಹನಿಗಳು, ಎಲೆಗಳ ಗಾಳಿ ಮತ್ತು ಕೀಟಗಳ ಸಹಜ ಧ್ವನಿ. ಅರಣ್ಯ ಪರಿಸರ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
      spectralFeatures: {
        peakFrequencyHz: 5200,
        spectralCentroidHz: 4100,
        infrasonicEnergy: 0.06,
        zeroCrossingRate: 0.42,
        snrDb: 7.2,
        harmonicDensity: 0.28,
      },
      recommendedActions: {
        en: ['Maintain standard passive sentinel tower monitoring schedule.'],
        kn: ['ಸಾಮಾನ್ಯ ಕಣ್ಗಾವಲು ಮುಂದುವರಿಸಿ.'],
      },
      bilingualAlert: {
        english: `ℹ️ NOMINAL: ${targetTowerName} reports baseline tropical forest acoustic parameters.`,
        kannada: `ℹ️ ಸಹಜ: ${targetTowerName} ನಲ್ಲಿ ಅರಣ್ಯ ಪರಿಸರ ಸಂಪೂರ್ಣ ಸಹಜ ಮತ್ತು ಶಾಂತವಾಗಿದೆ.`,
      },
    };
  }

  // --- Real Acoustic Analysis for Live Mic or Uploaded Audio Files ---
  const { infrasonicEnergy, zeroCrossingRate, spectralCentroidHz, peakFrequencyHz, snrDb } = features;

  if (infrasonicEnergy > 0.65 || (peakFrequencyHz < 350 && zeroCrossingRate < 0.25)) {
    // Elephant vocalization signature
    const conf = Math.min(97, Math.max(68, 80 + infrasonicEnergy * 18));
    return {
      threatType: 'elephant',
      title: 'Elephant Herd Movement (Bioacoustic Match)',
      titleKannada: 'ಆನೆಗಳ ಚಲನವಲನ ಪತ್ತೆ (ಧ್ವನಿ ವಿಶ್ಲೇಷಣೆ)',
      confidence: Number(conf.toFixed(1)),
      severity: conf > 75 ? 'warning' : 'nominal',
      requiresReview: conf <= 75,
      classificationLabel: conf > 75 ? 'Elephant Vocalization Signature' : 'Possible Low-Frequency Animal Call',
      classificationLabelKannada: 'ಆನೆಗಳ ಧ್ವನಿ ತರಂಗ (ಮಾನವ-ಪ್ರಾಣಿ ಸಂಘರ್ಷ ಸಾಧ್ಯತೆ)',
      description: `Infrasonic vibrational index (${(infrasonicEnergy * 100).toFixed(0)}%) aligns with pachyderm vocal tracts. Spectral peak at ${peakFrequencyHz} Hz.`,
      descriptionKannada: `ಕಡಿಮೆ ಆವರ್ತನದ ಕಂಪನಗಳು ಆನೆಗಳ ಧ್ವನಿಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿವೆ. ಗಡಿಭಾಗದ ಗ್ರಾಮಗಳಿಗೆ ಎಚ್ಚರಿಕೆ ರವಾನಿಸಿ.`,
      spectralFeatures: {
        ...features,
      },
      recommendedActions: {
        en: ['Alert local beat guards', 'Issue fringe village advisory via Telegram/SMS'],
        kn: ['ಸ್ಥಳೀಯ ಅರಣ್ಯ ರಕ್ಷಕರಿಗೆ ಮಾಹಿತಿ ನೀಡಿ', 'ಗ್ರಾಮಸ್ಥರಿಗೆ ಎಚ್ಚರಿಕೆ ಸಂದೇಶ ಕಳುಹಿಸಿ'],
      },
      bilingualAlert: {
        english: `⚠️ ALERT: Elephant movement acoustic signature detected at ${targetTowerName}.`,
        kannada: `⚠️ ಎಚ್ಚರಿಕೆ: ${targetTowerName} ಬಳಿ ಆನೆಗಳ ಶಬ್ದ ಪತ್ತೆಯಾಗಿದೆ. ರೈತರು ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ.`,
      },
    };
  } else if (zeroCrossingRate > 0.5 && spectralCentroidHz > 1600 && snrDb > 14) {
    // Mechanical high-rev chainsaw motor
    const conf = Math.min(96, Math.max(62, 74 + zeroCrossingRate * 30));
    return {
      threatType: 'chainsaw',
      title: 'Illegal Felling Detected (Acoustic Match)',
      titleKannada: 'ಅಕ್ರಮ ಮರ ಕಡಿತ ಶಬ್ದ ಪತ್ತೆ (ಚೈನ್ಸಾ)',
      confidence: Number(conf.toFixed(1)),
      severity: conf > 75 ? 'critical' : 'warning',
      requiresReview: conf <= 75,
      classificationLabel: conf > 75 ? 'Chainsaw Motor Signature' : 'Mechanical Noise (Review Required)',
      classificationLabelKannada: 'ಚೈನ್ಸಾ ಮೋಟಾರ್ ಶಬ್ದ (ಪರಿಶೀಲನೆ ಅಗತ್ಯ)',
      description: `High zero-crossing density (${zeroCrossingRate.toFixed(2)}) and mechanical harmonic profile at ${spectralCentroidHz} Hz indicate motor operation.`,
      descriptionKannada: `ಹೆಚ್ಚಿನ ಯಾಂತ್ರಿಕ ಶಬ್ದ ಮತ್ತು ಮೋಟಾರ್ ಕಂಪನಗಳು ಅಕ್ರಮ ಮರ ಕಡಿತದ ಸಾಧ್ಯತೆಯನ್ನು ತೋರಿಸುತ್ತವೆ.`,
      spectralFeatures: {
        ...features,
      },
      recommendedActions: {
        en: ['Immediate APC patrol team dispatch', 'Log GPS telemetry coordinates for legal evidence'],
        kn: ['ತಕ್ಷಣದ ಗಸ್ತು ತಂಡವನ್ನು ರವಾನಿಸಿ', 'ಕಾನೂನು ಕ್ರಮಕ್ಕಾಗಿ ಜಿಪಿಎಸ್ ಮಾಹಿತಿ ದಾಖಲಿಸಿ'],
      },
      bilingualAlert: {
        english: `🚨 ALERT: Chainsaw motor sound detected at ${targetTowerName}. Dispatch anti-poaching squad.`,
        kannada: `🚨 ಎಚ್ಚರಿಕೆ: ${targetTowerName} ಬಳಿ ಚೈನ್ಸಾ ಮೋಟಾರ್ ಶಬ್ದ ಪತ್ತೆಯಾಗಿದೆ. ಗಸ್ತು ತಂಡ ರವಾನಿಸಿ.`,
      },
    };
  } else {
    // Ambient / Unknown
    const conf = Math.min(98, Math.max(70, 85 + (1 - zeroCrossingRate) * 12));
    const isUncertain = snrDb < 10 || (conf <= 75);
    return {
      threatType: 'ambient',
      title: isUncertain ? 'Unverified Acoustic Signature (Review Required)' : 'Normal Forest Ambiance',
      titleKannada: isUncertain ? 'ಅನಿಶ್ಚಿತ ಧ್ವನಿ (ಪರಿಶೀಲನೆ ಅಗತ್ಯ)' : 'ಸಾಮಾನ್ಯ ಅರಣ್ಯ ವಾತಾವರಣ',
      confidence: Number(conf.toFixed(1)),
      severity: 'nominal',
      requiresReview: isUncertain,
      classificationLabel: isUncertain ? 'Low SNR / Review Required' : 'Ambient Canopy Soundscape',
      classificationLabelKannada: 'ಸಾಮಾನ್ಯ ನೈಸರ್ಗಿಕ ಶಬ್ದ',
      description: `Acoustic envelope shows balanced natural noise with peak frequency at ${peakFrequencyHz} Hz and SNR ${snrDb} dB.`,
      descriptionKannada: `ನೈಸರ್ಗಿಕ ಮಳೆ ಅಥವಾ ಗಾಳಿಯ ಸಾಮಾನ್ಯ ಶಬ್ದ. ಯಾವುದೇ ಅಕ್ರಮ ಚಟುವಟಿಕೆ ಇಲ್ಲ.`,
      spectralFeatures: {
        ...features,
      },
      recommendedActions: {
        en: ['Passive continuous monitoring active'],
        kn: ['ಸ್ವಯಂಚಾಲಿತ ನಿಗಾ ಮುಂದುವರಿದಿದೆ'],
      },
      bilingualAlert: {
        english: `ℹ️ NOMINAL: ${targetTowerName} acoustic baseline is within normal parameters.`,
        kannada: `ℹ️ ಸಹಜ: ${targetTowerName} ನಲ್ಲಿ ಅರಣ್ಯ ಪರಿಸರ ಸಂಪೂರ್ಣ ಶಾಂತವಾಗಿದೆ.`,
      },
    };
  }
}

/**
 * Sends a real Telegram message if botToken and chatId are configured,
 * otherwise returns simulated dispatch status.
 */
export async function sendTelegramAlert(
  messageEn: string,
  messageKn: string,
  towerName: string,
  token?: string,
  chatId?: string
): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const fullText = `🌲 [ARANYA-DRISHTI // ಅರಣ್ಯ ದೃಷ್ಟಿ]\nWestern Ghats Forest Command Center\n\n${messageEn}\n\n${messageKn}\n\n📍 Sensor: ${towerName}\n⏰ Timestamp: ${new Date().toLocaleTimeString()} IST`;

  if (token && chatId && token.trim().length > 10 && chatId.trim().length > 3) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: fullText,
          parse_mode: 'HTML',
        }),
      });
      const data = await response.json();
      if (data.ok) {
        return { success: true, simulated: false };
      } else {
        return { success: false, simulated: false, error: data.description || 'Telegram API rejected payload' };
      }
    } catch (err) {
      return { success: false, simulated: false, error: (err as Error).message };
    }
  }

  // Simulated delivery
  return { success: true, simulated: true };
}
