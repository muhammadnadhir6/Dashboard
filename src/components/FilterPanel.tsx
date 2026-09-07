import React, { useState } from 'react';
import { Filter, RotateCcw, Search, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '../types';

interface FilterPanelProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  setFilter,
  onReset,
  filteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePekerjaan = (pekerjaan: string) => {
    setFilter(prev => {
      const exists = prev.statusPekerjaan.includes(pekerjaan);
      const updated = exists
        ? prev.statusPekerjaan.filter(p => p !== pekerjaan)
        : [...prev.statusPekerjaan, pekerjaan];
      return { ...prev, statusPekerjaan: updated };
    });
  };

  const toggleKota = (kota: string) => {
    setFilter(prev => {
      const exists = prev.kodePos.includes(kota);
      const updated = exists
        ? prev.kodePos.filter(k => k !== kota)
        : [...prev.kodePos, kota];
      return { ...prev, kodePos: updated };
    });
  };

  const activeFilterCount =
    (filter.statusPekerjaan.length > 0 ? 1 : 0) +
    (filter.kodePos.length > 0 ? 1 : 0) +
    (filter.defaultStatus !== 'ALL' ? 1 : 0) +
    (filter.maxDpd < 25 ? 1 : 0) +
    (filter.maxDsr < 1.0 ? 1 : 0) +
    (filter.maxLtv < 1.0 ? 1 : 0) +
    (filter.minIncome > 500000 ? 1 : 0) +
    (filter.searchQuery ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs mb-4 overflow-hidden">
      {/* Top Filter Bar */}
      <div className="px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filter Data Dinamis</h3>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white">
                  {activeFilterCount} aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Eksplorasi subset nasabah berdasarkan profil sosiodemografi, beban utang, dan riwayat risiko
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID Nasabah (e.g. 42)..."
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3 text-slate-500" />
            <span>{isExpanded ? 'Tutup Filter Detail' : 'Buka Filter Lengkap'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Pills (Always visible) */}
      <div className="px-3.5 py-2 bg-white flex flex-wrap items-center gap-3 text-xs border-b border-slate-100">
        {/* Status Pekerjaan Quick Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pekerjaan:</span>
          {['PNS', 'Buruh', 'Wiraswasta', 'Lainnya'].map((pek) => {
            const isSelected = filter.statusPekerjaan.includes(pek);
            return (
              <button
                key={pek}
                onClick={() => togglePekerjaan(pek)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pek}
              </button>
            );
          })}
        </div>

        {/* Kota Quick Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kota:</span>
          {['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Lainnya'].map((kota) => {
            const isSelected = filter.kodePos.includes(kota);
            return (
              <button
                key={kota}
                onClick={() => toggleKota(kota)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {kota}
              </button>
            );
          })}
        </div>

        {/* Default Status Filter */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Risiko:</span>
          <select
            value={filter.defaultStatus}
            onChange={(e) => setFilter(prev => ({ ...prev, defaultStatus: e.target.value as any }))}
            className="px-2 py-0.5 text-xs font-medium rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status (Lancar & Macet)</option>
            <option value="DEFAULT">Hanya Default (Gagal Bayar)</option>
            <option value="NON_DEFAULT">Hanya Non-Default (Lancar)</option>
          </select>
        </div>
      </div>

      {/* Expanded Slider Filters */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-200/80">
          {/* Max DPD Slider */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Maks. DPD (Hari Tunggakan)</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-900 font-bold">
                ≤ {filter.maxDpd} hari
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={filter.maxDpd}
              onChange={(e) => setFilter(prev => ({ ...prev, maxDpd: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 hari</span>
              <span>12 hari</span>
              <span>25+ hari</span>
            </div>
          </div>

          {/* Max DSR Slider */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Maks. DSR (Debt Service)</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-900 font-bold">
                ≤ {(filter.maxDsr * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.0"
              step="0.05"
              value={filter.maxDsr}
              onChange={(e) => setFilter(prev => ({ ...prev, maxDsr: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Max LTV Slider */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Maks. LTV (Loan-to-Value)</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-900 font-bold">
                ≤ {(filter.maxLtv * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.20"
              max="1.0"
              step="0.05"
              value={filter.maxLtv}
              onChange={(e) => setFilter(prev => ({ ...prev, maxLtv: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20%</span>
              <span>60%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Min Income Slider */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Min. Income (Pendapatan)</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-900 font-bold">
                ≥ Rp {(filter.minIncome / 1000000).toFixed(1)} jt
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="500000"
              value={filter.minIncome}
              onChange={(e) => setFilter(prev => ({ ...prev, minIncome: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Rp 500rb</span>
              <span>Rp 10jt</span>
              <span>Rp 20jt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
