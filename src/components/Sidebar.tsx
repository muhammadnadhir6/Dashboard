import React from 'react';
import {
  BarChart3,
  Scale,
  Layers,
  UserCheck,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  Building2,
  X
} from 'lucide-react';
import { FilterState, AuditLog } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  auditLogs: AuditLog[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  onResetFilters,
  auditLogs,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const tabs = [
    { id: 'overview', label: 'Ringkasan & KPI', icon: BarChart3 },
    { id: 'fairness', label: 'Fairness & Bias Audit', icon: Scale },
    { id: 'shap', label: 'Global Explainability', icon: Layers },
    { id: 'customer', label: 'Explain Nasabah (LIME)', icon: UserCheck },
    { id: 'human', label: 'Human-in-the-Loop', icon: ShieldCheck },
    { id: 'analytics', label: 'Analisis Risiko Lanjutan', icon: FileSpreadsheet },
  ];

  const togglePekerjaan = (pek: string) => {
    setFilter(prev => {
      const exists = prev.statusPekerjaan.includes(pek);
      const updated = exists
        ? prev.statusPekerjaan.filter(p => p !== pek)
        : [...prev.statusPekerjaan, pek];
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

  const exportAuditCsv = () => {
    if (auditLogs.length === 0) {
      alert('Belum ada data audit trail untuk diunduh.');
      return;
    }
    const header = 'ID_Audit,ID_Nasabah,Timestamp,Reviewer,Prob_Default,Rekomendasi_Sistem,Keputusan_Akhir,Catatan\n';
    const rows = auditLogs.map(l =>
      `"${l.id}",${l.nasabahId},"${l.timestamp}","${l.reviewer}",${(l.probDefault * 100).toFixed(2)}%,"${l.systemRecommendation}","${l.finalDecision}","${(l.notes || l.overrideReason).replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_bri_high_density_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* High Density Aside */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 lg:w-64 bg-slate-900 flex-shrink-0 flex flex-col transition-transform duration-200 ease-in-out select-none border-r border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
              BRI
            </div>
            <div>
              <h1 className="text-white font-semibold text-base tracking-tight leading-none">Dashboard Risk Management</h1>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Dashboard v2.4</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body: Nav + Dynamic Filters + Export */}
        <div className="flex-1 p-3.5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Menu Nav */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
              Menu Navigasi
            </label>
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Filter Dinamis */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 block">
              Filter Dinamis
            </label>

            <div className="space-y-3">
              {/* Quick Search */}
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Cari ID Nasabah</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: 15..."
                    value={filter.searchQuery}
                    onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full pl-8 pr-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Pekerjaan */}
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Kelompok Pekerjaan</label>
                <div className="space-y-1.5">
                  {['PNS', 'Buruh', 'Wiraswasta', 'Lainnya'].map((pek) => {
                    const checked = filter.statusPekerjaan.includes(pek);
                    return (
                      <label
                        key={pek}
                        className="flex items-center gap-2 text-xs text-slate-300 px-1 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePekerjaan(pek)}
                          className="accent-blue-500 rounded cursor-pointer"
                        />
                        <span>{pek}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Wilayah Operasional */}
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Wilayah Operasional</label>
                <div className="grid grid-cols-2 gap-1">
                  {['Jakarta', 'Bandung', 'Surabaya', 'Medan'].map((kota) => {
                    const isSelected = filter.kodePos.includes(kota);
                    return (
                      <button
                        key={kota}
                        type="button"
                        onClick={() => toggleKota(kota)}
                        className={`text-[10px] text-center py-1 rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-blue-500 text-blue-400 font-semibold'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {kota}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Risiko Select */}
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Status Risiko</label>
                <select
                  value={filter.defaultStatus}
                  onChange={(e) => setFilter(prev => ({ ...prev, defaultStatus: e.target.value as any }))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">Semua Portofolio</option>
                  <option value="NON_DEFAULT">Hanya Lancar (Non-Default)</option>
                  <option value="DEFAULT">Hanya Macet (Default / NPL)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Ekspor & Laporan */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 block">
              Ekspor & Laporan
            </label>
            <button
              onClick={exportAuditCsv}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium mb-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV Audit</span>
            </button>
            <button
              onClick={onResetFilters}
              className="w-full py-2 border border-slate-700 text-slate-300 rounded text-xs font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* User Card at bottom */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-slate-600">
            AR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-white font-medium truncate">Analis Risiko Kredit</p>
            <p className="text-[10px] text-slate-500 truncate font-mono">risk.officer@bri.co.id</p>
          </div>
        </div>
      </aside>
    </>
  );
};
