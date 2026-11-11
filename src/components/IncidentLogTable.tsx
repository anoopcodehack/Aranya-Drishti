import React, { useState, useMemo } from 'react';
import {
  ThreatIncident,
  SentinelTower,
} from '../data/towers';
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Volume2,
  TreePine,
  CheckCircle2,
  Eye,
  ShieldAlert,
} from 'lucide-react';

interface IncidentLogTableProps {
  incidents: ThreatIncident[];
  onSelectIncident: (incident: ThreatIncident) => void;
  onAcknowledge: (incidentId: string) => void;
}

export const IncidentLogTable: React.FC<IncidentLogTableProps> = ({
  incidents,
  onSelectIncident,
  onAcknowledge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      const matchesSearch =
        item.towerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.towerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || item.threatType === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [incidents, searchQuery, filterType, filterStatus]);

  const handleExportCSV = () => {
    const headers = ['IncidentID', 'TowerID', 'Sector', 'ThreatType', 'Confidence', 'Timestamp', 'Status', 'Latitude', 'Longitude'];
    const rows = filteredIncidents.map((inc) => [
      inc.id,
      inc.towerId,
      `"${inc.sector}"`,
      inc.threatType,
      `${inc.confidence}%`,
      `"${inc.timestamp}"`,
      inc.status,
      inc.coordinates[0],
      inc.coordinates[1],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aranya_Drishti_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-tight text-slate-100 uppercase">
              Western Ghats Acoustic Incident Log
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time acoustic event register across Kudremukh, Netravati, Kadaba & Shiradi sectors.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Tower ID, Sector, Threat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-2">
          {/* Threat Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['all', 'chainsaw', 'elephant', 'ambient'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-xs transition-colors capitalize ${
                  filterType === type
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'all' ? 'All Threats' : type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="dispatched">Dispatched</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase">
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Sentinel Node</th>
              <th className="py-2.5 px-3">Threat Signature</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No acoustic incidents matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => {
                const isCrit = inc.severity === 'critical';
                const isWarn = inc.severity === 'warning';

                return (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectIncident(inc)}
                  >
                    {/* Event ID */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-300">
                      {inc.id}
                    </td>

                    {/* Sentinel Node */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-100">{inc.towerId}</div>
                      <div className="text-[11px] text-slate-400">{inc.sector}</div>
                    </td>

                    {/* Threat Signature */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {inc.threatType === 'chainsaw' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : inc.threatType === 'elephant' ? (
                          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <TreePine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-medium text-slate-100 truncate max-w-[220px]">
                          {inc.title}
                        </span>
                      </div>
                      <div className="text-[10px] font-kannada text-slate-400 truncate max-w-[220px]">
                        {inc.titleKannada}
                      </div>
                    </td>

                    {/* Confidence Meter */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {inc.confidence}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${inc.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {inc.timestamp}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          inc.status === 'unacknowledged'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : inc.status === 'dispatched'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : inc.status === 'acknowledged'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Open Incident Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {inc.status === 'unacknowledged' && (
                          <button
                            onClick={() => onAcknowledge(inc.id)}
                            className="px-2 py-1 rounded bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-semibold transition-colors"
                            title="Acknowledge"
                          >
                            Ack
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
