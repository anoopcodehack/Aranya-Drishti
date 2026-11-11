import React from 'react';
import { Users, Shield, Radio, Truck, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';

export interface PatrolUnit {
  id: string;
  name: string;
  callSign: string;
  sector: string;
  status: 'patrolling' | 'standby' | 'dispatched' | 'intercepting';
  personnelCount: number;
  vehicle: string;
  leadOfficer: string;
  contactFreq: string;
  batteryRadio: number;
}

export const PATROL_UNITS_DATA: PatrolUnit[] = [
  {
    id: 'UNIT-01',
    name: 'Kudremukh Anti-Poaching Camp Strike Force',
    callSign: 'TIGER-FORCE-1',
    sector: 'Sector 1 - Kudremukh North',
    status: 'dispatched',
    personnelCount: 6,
    vehicle: 'Mahindra Bolero 4WD (KA-19-G-4021)',
    leadOfficer: 'Ranger Suresh Gowda',
    contactFreq: '154.250 MHz',
    batteryRadio: 92,
  },
  {
    id: 'UNIT-02',
    name: 'Kadaba Rapid Conflict Mitigation Unit (Elephant ETF)',
    callSign: 'GAJARAJ-03',
    sector: 'Sector 3 - Kadaba Fringe',
    status: 'dispatched',
    personnelCount: 4,
    vehicle: 'Custom Light Tactical Siren Truck (KA-21-G-1108)',
    leadOfficer: 'Deputy Range Officer Anand Kumar',
    contactFreq: '156.400 MHz',
    batteryRadio: 87,
  },
  {
    id: 'UNIT-03',
    name: 'Netravati Riverine Forest Patrol',
    callSign: 'RIVER-GUARD-2',
    sector: 'Sector 2 - Netravati River Buffer',
    status: 'patrolling',
    personnelCount: 4,
    vehicle: 'Motorized Inflatable Boat + All-Terrain Quad',
    leadOfficer: 'Forester Manjunath Shenoy',
    contactFreq: '155.800 MHz',
    batteryRadio: 95,
  },
  {
    id: 'UNIT-04',
    name: 'Shiradi Foothills Quick Response Patrol',
    callSign: 'GHAT-SCOUT-4',
    sector: 'Sector 4 - Shiradi Foothills',
    status: 'standby',
    personnelCount: 5,
    vehicle: 'Mahindra Scorpio-N Forest Recon',
    leadOfficer: 'Forester Rajesh Bhat',
    contactFreq: '154.900 MHz',
    batteryRadio: 78,
  },
  {
    id: 'UNIT-05',
    name: 'Nagarhole Border Perimeter Recon',
    callSign: 'CORRIDOR-EAGLE',
    sector: 'Sector 5 - Nagarhole Border',
    status: 'patrolling',
    personnelCount: 4,
    vehicle: '4WD Patrol Gypsy (KA-12-G-0914)',
    leadOfficer: 'Ranger Venkatesh Nayak',
    contactFreq: '157.100 MHz',
    batteryRadio: 84,
  },
];

interface PatrolUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatrolUnitsModal: React.FC<PatrolUnitsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Karnataka Forest Department // Tactical Patrol Deployments
              </h2>
              <p className="text-xs text-slate-400 font-kannada">
                ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ ಸಂರಕ್ಷಣಾ ಗಸ್ತು ಪಡೆಗಳು
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-mono"
          >
            [CLOSE]
          </button>
        </div>

        {/* List of Patrol Units */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {PATROL_UNITS_DATA.map((unit) => {
            const isDispatched = unit.status === 'dispatched';

            return (
              <div
                key={unit.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDispatched
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {unit.id}
                      </span>
                      <span className="font-bold text-slate-100 text-xs">
                        {unit.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Call Sign: <span className="font-mono text-slate-200">{unit.callSign}</span> · Sector: {unit.sector}
                    </div>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold self-start sm:self-auto ${
                      isDispatched
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {unit.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">COMMANDER</span>
                    <span>{unit.leadOfficer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">STRENGTH</span>
                    <span>{unit.personnelCount} Rangers</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RADIO FREQ</span>
                    <span className="text-sky-400">{unit.contactFreq}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">VEHICLE</span>
                    <span className="truncate block" title={unit.vehicle}>{unit.vehicle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            VHF Repeater: Kudremukh Peak (154.250 MHz Encrypted)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Acknowledge Status
          </button>
        </div>
      </div>
    </div>
  );
};
