import React from 'react';
import { Users, TrendingDown, Target, Cpu, CheckCircle2, DollarSign, Clock, ShieldAlert } from 'lucide-react';

interface KpiMetricsProps {
  totalNasabah: number;
  filteredCount: number;
  defaultRate: number;
  rocAuc: number;
  approvalRate: number;
  avgIncome: number;
  avgDsr: number;
  avgLtv: number;
  avgDpd: number;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  totalNasabah,
  filteredCount,
  defaultRate,
  rocAuc,
  approvalRate,
  avgIncome,
  avgDsr,
  avgLtv,
  avgDpd,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
      {/* 1. Total Pendapatan / Nasabah Basis */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Nasabah</p>
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {filteredCount.toLocaleString('id-ID')}
          </h3>
          {filteredCount !== totalNasabah && (
            <span className="text-[10px] text-slate-400 font-normal">
              / {totalNasabah}
            </span>
          )}
        </div>
        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
          <span>Approval: <strong>{(approvalRate * 100).toFixed(1)}%</strong></span>
          <span className="text-slate-400 font-normal ml-auto">Rp {(avgIncome / 1000000).toFixed(1)}M avg</span>
        </p>
      </div>

      {/* 2. Default Rate */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Default Rate (NPL)</p>
          <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-xl font-bold text-amber-700 tracking-tight">
            {(defaultRate * 100).toFixed(2)}%
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800 font-bold uppercase">
            Imbalanced
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-600 inline shrink-0" />
          <span>Rata-rata DPD: <strong className="text-slate-700">{avgDpd} hari</strong></span>
        </p>
      </div>

      {/* 3. ROC-AUC Model */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ROC-AUC Model</p>
          <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-xl font-bold text-emerald-700 tracking-tight">
            {rocAuc.toFixed(4)}
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-bold uppercase">
            Excellent
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Gini: <strong>{(2 * rocAuc - 1).toFixed(3)}</strong></span>
          <span className="text-slate-400">KS: 0.582</span>
        </p>
      </div>

      {/* 4. Model Architecture & Exposure */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Model Architecture</p>
          <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-xl font-bold text-indigo-900 tracking-tight">
            XGBoost
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100/70 text-indigo-800 font-bold">
            300 Trees
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
          <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, avgDsr * 100)}%` }} title={`DSR: ${(avgDsr * 100).toFixed(0)}%`}></div>
          <div className="bg-indigo-400 h-full" style={{ width: `${Math.min(100, avgLtv * 100)}%` }} title={`LTV: ${(avgLtv * 100).toFixed(0)}%`}></div>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 flex justify-between">
          <span>DSR: <strong>{(avgDsr * 100).toFixed(0)}%</strong></span>
          <span>LTV: <strong>{(avgLtv * 100).toFixed(0)}%</strong></span>
        </p>
      </div>
    </div>
  );
};
