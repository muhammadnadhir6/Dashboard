import React from 'react';
import { ShieldCheck, Database, RefreshCw, BarChart3, Scale, UserCheck, Layers, FileSpreadsheet, Bell, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  filteredCount,
  totalCount,
  onResetFilters,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const tabs = [
    { id: 'overview', label: 'Ringkasan & Risk KPI', icon: BarChart3 },
    { id: 'fairness', label: 'Fairness & Bias Audit', icon: Scale },
    { id: 'shap', label: 'Global SHAP', icon: Layers },
    { id: 'customer', label: 'Explain Nasabah (LIME)', icon: UserCheck },
    { id: 'human', label: 'Human-in-the-Loop', icon: ShieldCheck },
    { id: 'analytics', label: 'Analisis Risiko Lanjutan', icon: FileSpreadsheet },
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* High-density top bar */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile menu toggle + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {setIsSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 hidden sm:inline">Responsible AI</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="font-semibold text-slate-800 truncate">{currentTabObj.label}</span>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
            <Database className="w-3 h-3 text-blue-600" />
            <span><strong className="text-slate-900">{filteredCount}</strong>/{totalCount} nasabah</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Sistem Stabil</span>
          </div>

          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200">
            <span>Model: XGBoost AUC 0.85</span>
          </div>

          {filteredCount !== totalCount && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              title="Reset semua filter ke default"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <div className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full cursor-pointer" title="Notifikasi Sistem">
            <Bell className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sub-tab strip (for direct desktop / mobile tab switching) */}
      <div className="px-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center overflow-x-auto py-1 scrollbar-none gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
