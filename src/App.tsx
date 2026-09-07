import React, { useState, useMemo } from 'react';
import { INITIAL_NASABAH_DATA } from './data/creditData';
import { Nasabah, FilterState, AuditLog } from './types';
import { calculateMetrics, calculateFairness } from './utils/mlEngine';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KpiMetrics } from './components/KpiMetrics';
import { FilterPanel } from './components/FilterPanel';
import { FairnessSection } from './components/FairnessSection';
import { GlobalExplainability } from './components/GlobalExplainability';
import { CustomerInspector } from './components/CustomerInspector';
import { HumanInTheLoop } from './components/HumanInTheLoop';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { ResponsibleAIGuidelines } from './components/ResponsibleAIGuidelines';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedNasabahId, setSelectedNasabahId] = useState<number>(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Initial Filter State
  const initialFilter: FilterState = {
    statusPekerjaan: [],
    kodePos: [],
    minIncome: 500000,
    maxIncome: 25000000,
    minDsr: 0.10,
    maxDsr: 1.0,
    minLtv: 0.20,
    maxLtv: 1.0,
    minDpd: 0,
    maxDpd: 25,
    minUsia: 20,
    maxUsia: 65,
    defaultStatus: 'ALL',
    searchQuery: '',
  };

  const [filter, setFilter] = useState<FilterState>(initialFilter);

  // Initial Audit Logs for demonstration
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'AUDIT-891024',
      nasabahId: 14,
      timestamp: '07/09/2026, 10:15:32',
      reviewer: 'Hendra Wijaya (Senior Credit Risk Analyst)',
      probDefault: 0.684,
      systemRecommendation: 'REJECT',
      finalDecision: 'REJECT',
      overrideReason: 'Sesuai rekomendasi model AI',
      notes: 'DPD 16 hari dengan DSR 74% melebihi batas toleransi risiko.',
    },
    {
      id: 'AUDIT-890941',
      nasabahId: 8,
      timestamp: '07/09/2026, 09:42:18',
      reviewer: 'Siti Rahmawati (Komite Pemutus Kredit)',
      probDefault: 0.442,
      systemRecommendation: 'MANUAL REVIEW',
      finalDecision: 'ACCEPT',
      overrideReason: 'Override disetujui: Penjamin deposito dan omset usaha aktif terverifikasi',
      notes: 'Usaha toko sembako memiliki mutasi harian sehat di rekening BRI.',
    }
  ]);

  const handleResetFilters = () => {
    setFilter(initialFilter);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return INITIAL_NASABAH_DATA.filter((item) => {
      // Status Pekerjaan
      if (filter.statusPekerjaan.length > 0 && !filter.statusPekerjaan.includes(item.status_pekerjaan)) {
        return false;
      }
      // Kode Pos / Kota
      if (filter.kodePos.length > 0 && !filter.kodePos.includes(item.kode_pos)) {
        return false;
      }
      // Income
      if (item.income < filter.minIncome || item.income > filter.maxIncome) {
        return false;
      }
      // DSR
      if (item.dsr > filter.maxDsr) {
        return false;
      }
      // LTV
      if (item.ltv > filter.maxLtv) {
        return false;
      }
      // DPD
      if (item.dpd > filter.maxDpd) {
        return false;
      }
      // Default status
      if (filter.defaultStatus === 'DEFAULT' && item.default !== 1) {
        return false;
      }
      if (filter.defaultStatus === 'NON_DEFAULT' && item.default !== 0) {
        return false;
      }
      // Search query (Nasabah ID or text)
      if (filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.trim().toLowerCase();
        const idMatch = item.id.toString() === q || `nasabah #${item.id}`.includes(q);
        const jobMatch = item.status_pekerjaan.toLowerCase().includes(q);
        const cityMatch = item.kode_pos.toLowerCase().includes(q);
        if (!idMatch && !jobMatch && !cityMatch) {
          return false;
        }
      }
      return true;
    });
  }, [filter]);

  // Metrics computation
  const metrics = useMemo(() => {
    return calculateMetrics(filteredData);
  }, [filteredData]);

  // Fairness computation
  const fairnessData = useMemo(() => {
    return calculateFairness(filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA);
  }, [filteredData]);

  // Active customer for human in the loop & inspector
  const currentSelectedNasabah = useMemo(() => {
    return filteredData.find(d => d.id === selectedNasabahId) ||
      INITIAL_NASABAH_DATA.find(d => d.id === selectedNasabahId) ||
      filteredData[0] ||
      INITIAL_NASABAH_DATA[0];
  }, [filteredData, selectedNasabahId]);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* High Density Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filter={filter}
        setFilter={setFilter}
        onResetFilters={handleResetFilters}
        auditLogs={auditLogs}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Console Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredCount={filteredData.length}
          totalCount={INITIAL_NASABAH_DATA.length}
          onResetFilters={handleResetFilters}
          isSidebarOpen={isMobileSidebarOpen}
          setIsSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-4 max-w-full overflow-y-auto">
          {/* KPI Dashboard (Visible across main views) */}
          <KpiMetrics
            totalNasabah={INITIAL_NASABAH_DATA.length}
            filteredCount={filteredData.length}
            defaultRate={metrics.defaultRate}
            rocAuc={metrics.rocAuc}
            approvalRate={metrics.approvalRate}
            avgIncome={metrics.avgIncome}
            avgDsr={metrics.avgDsr}
            avgLtv={metrics.avgLtv}
            avgDpd={metrics.avgDpd}
          />

          {/* Dynamic Filter Panel (Always accessible) */}
          <FilterPanel
            filter={filter}
            setFilter={setFilter}
            onReset={handleResetFilters}
            filteredCount={filteredData.length}
            totalCount={INITIAL_NASABAH_DATA.length}
          />

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <CustomerInspector
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
                selectedId={selectedNasabahId}
                setSelectedId={setSelectedNasabahId}
              />
              <FairnessSection
                fairnessData={fairnessData}
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
              />
              <GlobalExplainability />
              <HumanInTheLoop
                currentNasabah={currentSelectedNasabah}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
              />
              <ResponsibleAIGuidelines />
            </div>
          )}

          {activeTab === 'fairness' && (
            <div className="space-y-4">
              <FairnessSection
                fairnessData={fairnessData}
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
              />
              <ResponsibleAIGuidelines />
            </div>
          )}

          {activeTab === 'shap' && (
            <div className="space-y-4">
              <GlobalExplainability />
              <CustomerInspector
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
                selectedId={selectedNasabahId}
                setSelectedId={setSelectedNasabahId}
              />
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="space-y-4">
              <CustomerInspector
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
                selectedId={selectedNasabahId}
                setSelectedId={setSelectedNasabahId}
              />
              <HumanInTheLoop
                currentNasabah={currentSelectedNasabah}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
              />
            </div>
          )}

          {activeTab === 'human' && (
            <div className="space-y-4">
              <HumanInTheLoop
                currentNasabah={currentSelectedNasabah}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
              />
              <ResponsibleAIGuidelines />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <AdvancedAnalytics
                dataset={filteredData.length > 0 ? filteredData : INITIAL_NASABAH_DATA}
              />
              <GlobalExplainability />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px]">
              🏦 <strong>Bank Rakyat Indonesia (Persero) Tbk.</strong> — Divisi Manajemen Risiko Kredit & AI Governance
            </span>
            <span className="text-[10px] text-slate-400">
              Responsible AI Framework: Fairness • Explainability • Human Oversight • Audit Trail
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
