import { 
  extractAcousticFeatures,
  classifyAcousticSignature,
  InferenceResult
} from '../src/utils/inferenceEngine.ts';
import { SENTINEL_TOWERS, FOREST_BOUNDARY_COORDS, ELEPHANT_CORRIDOR_COORDS, INITIAL_INCIDENTS } from '../src/data/towers.ts';
import { PATROL_UNITS_DATA } from '../src/components/PatrolUnitsModal.tsx';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

console.log('--- 1. TESTING SENTINEL TOWERS & GEODATA ---');
assert(SENTINEL_TOWERS.length === 5, 'Exactly 5 sentinel towers configured');
const towerIds = SENTINEL_TOWERS.map(t => t.id);
assert(towerIds.includes('TOWER-A') && towerIds.includes('TOWER-E'), 'Tower IDs A through E present');

for (const tower of SENTINEL_TOWERS) {
  assert(tower.lat >= 12.0 && tower.lat <= 14.0, `${tower.name} lat in Western Ghats range (${tower.lat})`);
  assert(tower.lng >= 74.5 && tower.lng <= 76.5, `${tower.name} lng in Western Ghats range (${tower.lng})`);
  assert(tower.radiusKm >= 2.0 && tower.radiusKm <= 4.0, `${tower.name} valid listening radius (${tower.radiusKm} km)`);
  assert(typeof tower.kannadaName === 'string' && tower.kannadaName.length > 0, `${tower.name} has Kannada name`);
}

assert(FOREST_BOUNDARY_COORDS.length > 5, 'Reserve boundary polygon coordinates defined');
assert(ELEPHANT_CORRIDOR_COORDS.length >= 4, 'Elephant corridor polygon coordinates defined');
assert(INITIAL_INCIDENTS.length >= 3, 'Pre-loaded threat incidents present');
assert(PATROL_UNITS_DATA.length === 5, '5 Anti-poaching patrol camps configured');

console.log('\n--- 2. TESTING BIOACOUSTIC INFERENCE ENGINE & CLASSIFICATION ---');

const dummyFeatures = {
  peakFrequencyHz: 1250,
  spectralCentroidHz: 2150,
  infrasonicEnergy: 0.12,
  zeroCrossingRate: 0.62,
  snrDb: 22,
  harmonicDensity: 0.8,
  rms: 0.25,
};

// Test 2a: Chainsaw Preset Inference
const chainsawInference = classifyAcousticSignature(dummyFeatures, 'chainsaw', 'Tower A (Sector 1 - Kudremukh North)');
assert(chainsawInference.threatType === 'chainsaw', 'Chainsaw correctly classified');
assert(chainsawInference.severity === 'critical', 'Chainsaw is critical severity');
assert(chainsawInference.confidence >= 75.0, `Chainsaw confidence (${chainsawInference.confidence}%) > 75% threshold`);
assert(chainsawInference.bilingualAlert.kannada.includes('ಚೈನ್ಸಾ') || chainsawInference.bilingualAlert.kannada.includes('ಮರ'), 'Chainsaw Kannada alert contains relevant keywords');
assert(chainsawInference.bilingualAlert.english.includes('ALERT'), 'Chainsaw English alert formatted');

// Test 2b: Elephant Infrasound Inference
const elephantInference = classifyAcousticSignature(dummyFeatures, 'elephant', 'Tower C (Sector 3 - Kadaba Fringe)');
assert(elephantInference.threatType === 'elephant', 'Elephant infrasound correctly classified');
assert(elephantInference.severity === 'warning', 'Elephant threat severity is warning');
assert(elephantInference.confidence >= 75.0, `Elephant confidence (${elephantInference.confidence}%) > 75% threshold`);
assert(elephantInference.bilingualAlert.kannada.includes('ಆನೆ'), 'Elephant Kannada alert contains "ಆನೆ"');
assert(elephantInference.bilingualAlert.english.includes('Elephant'), 'Elephant English alert formatted');

// Test 2c: Ambient baseline Inference
const ambientInference = classifyAcousticSignature(dummyFeatures, 'ambient', 'Tower B (Sector 2 - Netravati River Buffer)');
assert(ambientInference.threatType === 'ambient', 'Ambient rain/cicadas correctly classified');
assert(ambientInference.severity === 'nominal', 'Ambient severity is nominal');
assert(ambientInference.confidence >= 80.0, `Ambient confidence (${ambientInference.confidence}%) high baseline`);

// Test 2d: Raw feature-driven classification (no preset hint)
const rawElephantFeatures = {
  peakFrequencyHz: 220,
  spectralCentroidHz: 350,
  infrasonicEnergy: 0.75, // > 0.45 triggers elephant
  zeroCrossingRate: 0.15,
  snrDb: 18,
  harmonicDensity: 0.7,
  rms: 0.2,
};
const rawElephantResult = classifyAcousticSignature(rawElephantFeatures, undefined, 'Tower C');
assert(rawElephantResult.threatType === 'elephant', 'Raw audio with infrasonicEnergy > 0.45 classifies as elephant');

const rawChainsawFeatures = {
  peakFrequencyHz: 1300,
  spectralCentroidHz: 2100, // > 1400
  infrasonicEnergy: 0.1,
  zeroCrossingRate: 0.58, // > 0.48 triggers chainsaw
  snrDb: 22,
  harmonicDensity: 0.85,
  rms: 0.3,
};
const rawChainsawResult = classifyAcousticSignature(rawChainsawFeatures, undefined, 'Tower A');
assert(rawChainsawResult.threatType === 'chainsaw', 'Raw audio with ZCR > 0.48 & Centroid > 1400 classifies as chainsaw');

console.log('\n--- 3. TESTING AUDIO BUFFER FEATURE EXTRACTION ---');
const sampleRate = 48000;
const length = sampleRate * 1; // 1 second
const mockChannel = new Float32Array(length);

// Generate 1200 Hz tone
for (let i = 0; i < length; i++) {
  mockChannel[i] = Math.sin(2 * Math.PI * 1200 * (i / sampleRate));
}

const mockAudioBuffer = {
  sampleRate,
  length,
  duration: 1.0,
  numberOfChannels: 1,
  getChannelData: () => mockChannel,
} as unknown as AudioBuffer;

const extracted = extractAcousticFeatures(mockAudioBuffer);
assert(extracted.zeroCrossingRate > 0, `ZCR calculated: ${extracted.zeroCrossingRate}`);
assert(extracted.spectralCentroidHz > 0, `Centroid calculated: ${extracted.spectralCentroidHz} Hz`);
assert(extracted.snrDb > 0, `SNR calculated: ${extracted.snrDb} dB`);
assert(extracted.rms > 0, `RMS calculated: ${extracted.rms.toFixed(3)}`);

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED! System verified.');
}
