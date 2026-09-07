import React from 'react';
import { Scale, AlertTriangle, CheckCircle, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { FairnessMetric, Nasabah } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';

interface FairnessSectionProps {
  fairnessData: FairnessMetric[];
  dataset: Nasabah[];
}

export const FairnessSection: React.FC<FairnessSectionProps> = ({ fairnessData, dataset }) => {
  const minDI = Math.min(...fairnessData.map(f => f.disparateImpact));
  const hasDisparity = minDI < 0.80;

  // Chart data: Approval Rate comparison across all jobs including PNS
  const pnsRate = fairnessData[0]?.approvalRatePNS ?? 0.90;
  const approvalComparisonData = [
    { name: 'PNS (Acuan)', rate: pnsRate * 100, count: dataset.filter(d => d.status_pekerjaan === 'PNS').length },
    ...fairnessData.map(f => ({
      name: f.kelompok,
      rate: f.approvalRateKelompok * 100,
      count: dataset.filter(d => d.status_pekerjaan === f.kelompok).length,
    }))
  ];

  // Disparate Impact chart vs 0.80 threshold
  const diComparisonData = fairnessData.map(f => ({
    name: f.kelompok,
    di: f.disparateImpact,
    threshold: 0.80,
    status: f.disparateImpact < 0.80 ? 'Di Bawah Ambang 0.80' : 'Aman (≥ 0.80)'
  }));

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Fairness Monitoring & Bias Audit</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Evaluasi keadilan algoritmik (Demographic Parity & Disparate Impact) terhadap kelompok demografi/pekerjaan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Acuan: <strong>PNS</strong>
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Standar: <strong>EEOC DI ≥ 0.80</strong>
          </span>
        </div>
      </div>

      {/* Alert Banner based on app.py logic */}
      <div className="my-3">
        {hasDisparity ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Disparate Impact &lt; 0.80 Terdeteksi
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Model membutuhkan <strong>fairness investigation</strong>. Terdapat kelompok (misal: <em>Buruh/Lainnya</em>) dengan rasio persetujuan kredit relatif terhadap PNS di bawah 0.80 (80%). Hal ini berpotensi menimbulkan disparitas materiil dalam pemberian kredit dan perlu pengawasan ketat serta mitigasi bias.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                Tidak Ditemukan Disparate Impact &lt; 0.80
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Seluruh kelompok yang diuji memenuhi ambang batas 80% rule (DI ≥ 0.80) terhadap kelompok acuan PNS. Tetap lakukan monitoring berkala terhadap pergeseran data demografi (data drift).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fairness Metrics Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
        <table className="w-full text-left border-collapse text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2">Kelompok Pekerjaan</th>
              <th className="px-3 py-2">Approval Rate PNS (Acuan)</th>
              <th className="px-3 py-2">Approval Rate Kelompok</th>
              <th className="px-3 py-2">Disparate Impact (DI)</th>
              <th className="px-3 py-2">Mean Difference (MD)</th>
              <th className="px-3 py-2">Status Kepatuhan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fairnessData.map((row) => {
              const isLow = row.disparateImpact < 0.80;
              return (
                <tr key={row.kelompok} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-bold text-slate-900">{row.kelompok}</td>
                  <td className="px-3 py-2 font-mono">{(row.approvalRatePNS * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2 font-mono font-semibold">{(row.approvalRateKelompok * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                      isLow ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.disparateImpact.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    <span className={row.meanDifference < 0 ? 'text-amber-700 font-medium' : 'text-slate-700'}>
                      {row.meanDifference >= 0 ? '+' : ''}{row.meanDifference.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Perlu Investigasi (&lt; 0.80)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Memenuhi Standar
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual Charts: Approval Rates & Disparate Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
        {/* Chart 1: Approval Rate per Kelompok */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Perbandingan Approval Rate Kelompok (%)
            </h4>
            <span className="text-[10px] text-slate-400">Persentase Lolos Kredit</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(2)}%`, 'Tingkat Persetujuan']}
                  labelFormatter={(label) => `Kelompok: ${label}`}
                  contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                />
                <Bar dataKey="rate" fill="#00529B" radius={[3, 3, 0, 0]} name="Tingkat Persetujuan (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Disparate Impact vs 0.80 Benchmark */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Rasio Disparate Impact vs Threshold 0.80
            </h4>
            <span className="text-[10px] text-amber-700 font-bold">Target = 0.80</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1.2]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: number) => [val.toFixed(3), 'Disparate Impact']}
                  contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                />
                <ReferenceLine y={0.80} stroke="#e11d48" strokeDasharray="4 4" label={{ value: 'Target 0.80', fill: '#e11d48', fontSize: 9 }} />
                <Bar
                  dataKey="di"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                  name="Disparate Impact"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fairness Insight Guide */}
      <div className="mt-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-blue-900 text-xs">Penjelasan Metrik Keadilan:</strong>
          <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-slate-700">
            <li><strong>Disparate Impact (DI):</strong> Rasio persetujuan kelompok minoritas terhadap kelompok acuan istimewa (PNS). Aturan empat per lima (Four-Fifths Rule) mewajibkan rasio minimal 0.80 untuk menghindari adverse impact.</li>
            <li><strong>Mean Difference (MD):</strong> Selisih absolut persentase persetujuan kredit. MD negatif menandakan kelompok tersebut disetujui lebih sedikit dibanding PNS.</li>
            <li><strong>Langkah Mitigasi:</strong> Jika DI &lt; 0.80, lakukan re-weighing bobot pelatihan, penyesuaian threshold mitigasi bias, atau validasi business rationale untuk mencegah diskriminasi tidak disengaja.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
