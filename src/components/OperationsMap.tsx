import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SentinelTower, FOREST_BOUNDARY_COORDS, ELEPHANT_CORRIDOR_COORDS } from '../data/towers';
import { Layers, Shield, Radio, LocateFixed, Eye, Volume2 } from 'lucide-react';

interface OperationsMapProps {
  towers: SentinelTower[];
  selectedTowerId: string | null;
  onSelectTower: (tower: SentinelTower) => void;
  onTestAcousticAtNode?: (tower: SentinelTower) => void;
}

type MapLayerType = 'dark' | 'satellite' | 'terrain';

export const OperationsMap: React.FC<OperationsMapProps> = ({
  towers,
  selectedTowerId,
  onSelectTower,
  onTestAcousticAtNode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const circlesRef = useRef<{ [key: string]: L.Circle }>({});
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [showRings, setShowRings] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Kudremukh / Mangaluru forest division (13.133, 75.258)
    const map = L.map(mapContainerRef.current, {
      center: [13.133, 75.258],
      zoom: 10,
      minZoom: 8,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: false,
    });

    // Default Dark Matter CartoDB tiles
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Add Western Ghats Forest Boundary Polygon
    const boundaryPolygon = L.polygon(FOREST_BOUNDARY_COORDS, {
      color: '#10b981',
      weight: 1.5,
      dashArray: '5, 8',
      fillColor: '#059669',
      fillOpacity: 0.08,
    }).addTo(map);

    boundaryPolygon.bindTooltip('Kudremukh Forest Reserve Buffer', {
      sticky: true,
      className: 'bg-slate-900 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30',
    });

    // Add Elephant Corridor Polygon
    const elephantPolygon = L.polygon(ELEPHANT_CORRIDOR_COORDS, {
      color: '#f59e0b',
      weight: 1.5,
      dashArray: '3, 6',
      fillColor: '#d97706',
      fillOpacity: 0.12,
    }).addTo(map);

    elephantPolygon.bindTooltip('Kadaba-Shiradi Elephant Migratory Corridor', {
      sticky: true,
      className: 'bg-slate-900 text-amber-400 text-xs px-2 py-1 rounded border border-amber-500/30',
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer switching
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '';

    if (activeLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (activeLayer === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: 18,
      subdomains: activeLayer === 'dark' ? 'abcd' : 'abc',
    }).addTo(map);
  }, [activeLayer]);

  // Update Tower Markers and Acoustic Detection Circles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    Object.values(circlesRef.current).forEach((circle) => map.removeLayer(circle));
    markersRef.current = {};
    circlesRef.current = {};

    towers.forEach((tower) => {
      const isAlert = tower.status === 'alert';
      const isWarning = tower.status === 'warning';
      const isSelected = selectedTowerId === tower.id;

      // Color scheme based on state
      const primaryColor = isAlert ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
      const pulseClass = isAlert ? 'animate-radar-red' : 'animate-radar-green';
      const ringFill = isAlert ? '#dc2626' : isWarning ? '#d97706' : '#059669';

      // Custom SVG Marker HTML
      const customIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 48px; height: 48px;">
          <!-- Concentric animated radar shockwave ring -->
          <div class="absolute inset-0 rounded-full ${pulseClass}" style="background-color: ${primaryColor}; opacity: ${isAlert ? '0.45' : '0.25'}; pointer-events: none;"></div>
          ${isAlert ? `<div class="absolute -inset-2 rounded-full animate-radar-red" style="background-color: ${primaryColor}; opacity: 0.3; animation-delay: 0.6s; pointer-events: none;"></div>` : ''}
          
          <!-- Tower Hub Core -->
          <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border ${isSelected ? 'ring-2 ring-white scale-110' : ''} shadow-lg transition-transform" 
               style="background-color: #0b1329; border-color: ${primaryColor};">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
              <circle cx="12" cy="12" r="2" fill="${primaryColor}"/>
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
            </svg>
          </div>

          <!-- Label tooltip underneath -->
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-tight shadow-md"
               style="background-color: rgba(11, 19, 41, 0.9); color: ${primaryColor}; border: 1px solid ${primaryColor}40;">
            ${tower.id}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-sentinel-icon',
        html: customIconHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const marker = L.marker([tower.lat, tower.lng], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div class="p-2 space-y-2 min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div>
              <span class="text-xs font-mono font-bold text-slate-100">${tower.id}</span>
              <p class="text-[11px] text-slate-400">${tower.sector}</p>
            </div>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}">
              ${tower.status.toUpperCase()}
            </span>
          </div>

          <div class="text-[11px] font-kannada text-emerald-400/90">${tower.kannadaName}</div>

          <div class="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
            <div>Elev: <span class="text-slate-100">${tower.elevation}m</span></div>
            <div>Batt: <span class="text-slate-100">${tower.battery}%</span></div>
            <div>Solar: <span class="text-slate-100">${tower.solarOutput}W</span></div>
            <div>RSSI: <span class="text-slate-100">${tower.signalRssi} dBm</span></div>
          </div>

          <div class="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
            ${tower.habitat}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectTower(tower);
      });

      markersRef.current[tower.id] = marker;

      // Acoustic listening radius circle
      if (showRings) {
        const circle = L.circle([tower.lat, tower.lng], {
          radius: tower.radiusKm * 1000,
          color: primaryColor,
          weight: 1,
          dashArray: isAlert ? undefined : '4, 6',
          fillColor: ringFill,
          fillOpacity: isAlert ? 0.16 : 0.05,
        }).addTo(map);

        circlesRef.current[tower.id] = circle;
      }
    });
  }, [towers, selectedTowerId, showRings, onSelectTower]);

  // Center on selected tower
  useEffect(() => {
    if (!selectedTowerId || !mapInstanceRef.current) return;
    const tower = towers.find((t) => t.id === selectedTowerId);
    if (tower) {
      mapInstanceRef.current.panTo([tower.lat, tower.lng], { animate: true, duration: 0.8 });
      const marker = markersRef.current[tower.id];
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedTowerId, towers]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([13.133, 75.258], 10, { animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Map Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        {/* Layer Selector */}
        <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg shadow-lg">
          <button
            onClick={() => setActiveLayer('dark')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'dark' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Ops Contrast Map"
          >
            Dark Ops
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="High-Resolution Satellite Imagery"
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveLayer('terrain')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'terrain' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Western Ghats Topographic Elevation"
          >
            Terrain
          </button>
        </div>

        {/* Radius Toggle */}
        <button
          onClick={() => setShowRings(!showRings)}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border shadow-lg backdrop-blur flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            showRings
              ? 'bg-slate-900/90 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Acoustic Pickup Radius"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Acoustic Range</span>
        </button>

        {/* Recenter Map */}
        <button
          onClick={handleResetView}
          className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-emerald-400 shadow-lg backdrop-blur transition-colors"
          title="Reset Western Ghats Center (Kudremukh Lat 13.133)"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Legend & Sector Indicator Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-[1000] p-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg shadow-xl text-xs space-y-1.5 max-w-[280px]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1">
          <span className="font-semibold text-slate-200">Kudremukh Sentinel Grid</span>
          <span className="font-mono text-emerald-400">5 / 5 Online</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <span>Nominal Patrol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></span>
            <span>Threat Alert (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></span>
            <span>Reserve Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400"></span>
            <span>Elephant Corridor</span>
          </div>
        </div>
      </div>

      {/* Node Quick-Selector Strip Top-Right */}
      <div className="absolute top-3 right-3 z-[1000] hidden md:flex items-center gap-1 bg-slate-900/90 backdrop-blur p-1 rounded-lg border border-slate-800 shadow-lg">
        {towers.map((tower) => (
          <button
            key={tower.id}
            onClick={() => onSelectTower(tower)}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors flex items-center gap-1 ${
              selectedTowerId === tower.id
                ? 'bg-emerald-600 text-white font-bold'
                : tower.status === 'alert'
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tower.status === 'alert' ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            {tower.id.replace('TOWER-', '')}
          </button>
        ))}
      </div>
    </div>
  );
};
