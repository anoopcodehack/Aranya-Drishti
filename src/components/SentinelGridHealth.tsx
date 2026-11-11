import React from 'react';
import { SentinelTower } from '../data/towers';
import { Radio, Battery, Sun, Mountain, Signal, AlertTriangle, Play } from 'lucide-react';

interface SentinelGridHealthProps {
  towers: SentinelTower[];
  selectedTowerId: string | null;
  onSelectTower: (tower: SentinelTower) => void;
  onTriggerTestAcoustic: (tower: SentinelTower, type: 'chainsaw' | 'elephant') => void;
}

export const SentinelGridHealth: React.FC<SentinelGridHealthProps> = ({
  towers,
  selectedTowerId,
  onSelectTower,
  onTriggerTestAcoustic,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-tight text-slate-100 uppercase">
              Sentinel Tower Array Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous acoustic surveillance towers across the Western Ghats Reserve perimeter.
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
          5 / 5 OPERATIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {towers.map((tower) => {
          const isAlert = tower.status === 'alert';
          const isSelected = selectedTowerId === tower.id;

          return (
            <div
              key={tower.id}
              onClick={() => onSelectTower(tower)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'border-emerald-500 bg-slate-950 shadow-md ring-1 ring-emerald-500/50'
                  : isAlert
                  ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                  : 'border-slate-800/90 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-100">
                    {tower.id}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAlert ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-semibold text-slate-300 mt-1 line-clamp-1">
                  {tower.sector}
                </div>
                <div className="text-[10px] font-kannada text-emerald-400/90 truncate">
                  {tower.kannadaName}
                </div>
              </div>

              {/* Hardware Telemetry stats */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/70">
                <div className="flex items-center gap-1">
                  <Battery className="w-3 h-3 text-emerald-400" />
                  <span>{tower.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>{tower.solarOutput}W</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-slate-400" />
                  <span>{tower.elevation}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-sky-400" />
                  <span>{tower.signalRssi} dBm</span>
                </div>
              </div>

              {/* Quick Trigger Buttons */}
              <div
                className="pt-2 border-t border-slate-800/60 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onTriggerTestAcoustic(tower, 'chainsaw')}
                  className="flex-1 py-1 px-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-[10px] font-semibold text-red-300 transition-colors flex items-center justify-center gap-1"
                  title="Simulate Chainsaw Alert at this node"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>Chainsaw</span>
                </button>
                <button
                  onClick={() => onTriggerTestAcoustic(tower, 'elephant')}
                  className="flex-1 py-1 px-1 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-[10px] font-semibold text-amber-300 transition-colors flex items-center justify-center gap-1"
                  title="Simulate Elephant Alert at this node"
                >
                  <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
                  <span>Elephant</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
