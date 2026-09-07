import React, { useState, useMemo } from 'react';
import { User, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Search, Sliders, ArrowRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Nasabah } from '../types';
import { computeLocalShap, computeLimeFactors, simulateRiskScore } from '../utils/mlEngine';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';

interface CustomerInspectorProps {
  dataset: Nasabah[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  onDecisionTrigger?: (decision: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT', reason: string) => void;
}

export const CustomerInspector: React.FC<CustomerInspectorProps> = ({
  dataset,
  selectedId,
  setSelectedId,
  onDecisionTrigger
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  // Selected customer from dataset
  const currentNasabah = useMemo(() => {
    return dataset.find(d => d.id === selectedId) || dataset[0];
  }, [dataset, selectedId]);

  // Simulation state
  const [simNasabah, setSimNasabah] = useState<Nasabah>(currentNasabah);

  // Sync simulation state when customer selection changes
  React.useEffect(() => {
    if (currentNasabah) {
      setSimNasabah(currentNasabah);
    }
  }, [currentNasabah]);

  // Evaluate active nasabah (simulated or real)
  const activeNasabah = isSimulationMode ? simNasabah : currentNasabah;

  // Real-time calculation if in simulation mode
  const currentRisk = useMemo(() => {
    if (isSimulationMode) {
      const sim = simulateRiskScore(simNasabah);
      return {
        probDefault: sim.probDefault,
        recommendation: sim.recommendation,
      };
    }
    const prob = currentNasabah.prob_default;
    let rec: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT' = 'ACCEPT';
    if (prob >= 0.60) rec = 'REJECT';
    else if (prob >= 0.35) rec = 'MANUAL REVIEW';
    return { probDefault: prob, recommendation: rec };
  }, [isSimulationMode, simNasabah, currentNasabah]);

  // Compute local SHAP and LIME
  const localShap = useMemo(() => {
    return computeLocalShap(activeNasabah);
  }, [activeNasabah]);

  const limeFactors = useMemo(() => {
    return computeLimeFactors(activeNasabah);
  }, [activeNasabah]);

  // Waterfall chart dataset format
  const waterfallChartData = useMemo(() => {
    const data = [
      {
        name: 'Baseline E[f(x)]',
        value: Number((localShap.baseValue * 100).toFixed(1)),
        displayVal: `+${(localShap.baseValue * 100).toFixed(1)}%`,
        type: 'base',
      },
      ...localShap.contributions.map(c => ({
        name: c.label,
        value: Number((c.contribution * 100).toFixed(1)),
        displayVal: `${c.contribution >= 0 ? '+' : ''}${(c.contribution * 100).toFixed(1)}%`,
        type: c.contribution >= 0 ? 'increase' : 'decrease',
      })),
      {
        name: 'Hasil Prediksi f(x)',
        value: Number((currentRisk.probDefault * 100).toFixed(1)),
        displayVal: `${(currentRisk.probDefault * 100).toFixed(1)}%`,
        type: 'final',
      }
    ];
    return data;
  }, [localShap, currentRisk]);

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 mb-4">
      {/* Top Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Explain Nasabah Ini & Local Interpretability
            </h2>
            <p className="text-[11px] text-slate-500">
              Inspeksi individual profil risiko kredit, rekomendasi otomatis, dekomposisi SHAP Waterfall & LIME Top 5 Factors
            </p>
          </div>
        </div>

        {/* Customer Select Dropdown & Simulation Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label htmlFor="nasabah-select" className="text-xs font-semibold text-slate-700">Nasabah:</label>
            <select
              id="nasabah-select"
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="px-2 py-1 text-xs font-semibold rounded border border-slate-300 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {dataset.slice(0, 150).map((n) => (
                <option key={n.id} value={n.id}>
                  #{n.id} • {n.status_pekerjaan} • {n.kode_pos} ({n.default === 1 ? 'Default' : 'Lancar'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              isSimulationMode
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>{isSimulationMode ? 'Simulasi Aktif' : 'Simulasi What-If'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Banner Notice */}
      {isSimulationMode && (
        <div className="my-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Simulasi What-If Aktif:</strong> Anda dapat mengubah parameter di bawah untuk melihat bagaimana perubahan profil mempengaruhi estimasi risiko kredit secara real-time.
            </span>
          </div>
          <button
            onClick={() => setSimNasabah(currentNasabah)}
            className="text-[11px] underline font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
          >
            Kembalikan ke Nilai Asli
          </button>
        </div>
      )}

      {/* Profile & Risk Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
        {/* Left: Customer Profile (7 cols) */}
        <div className="md:col-span-7 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-200/70 pb-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Profil Nasabah #{activeNasabah.id}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
              Data Historis: {activeNasabah.default === 1 ? '🔴 Pernah Default' : '🟢 Kredit Lancar'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* Income */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Income</span>
              {isSimulationMode ? (
                <input
                  type="number"
                  step="500000"
                  value={simNasabah.income}
                  onChange={(e) => setSimNasabah({ ...simNasabah, income: Number(e.target.value) })}
                  className="w-full text-xs font-bold text-slate-900 border-b border-blue-400 focus:outline-none"
                />
              ) : (
                <strong className="text-xs font-bold text-slate-900">
                  Rp {activeNasabah.income.toLocaleString('id-ID')}
                </strong>
              )}
            </div>

            {/* DSR */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">DSR</span>
              {isSimulationMode ? (
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="1.0"
                  value={simNasabah.dsr}
                  onChange={(e) => setSimNasabah({ ...simNasabah, dsr: Number(e.target.value) })}
                  className="w-full text-xs font-bold text-slate-900 border-b border-blue-400 focus:outline-none"
                />
              ) : (
                <strong className="text-xs font-bold text-slate-900">
                  {activeNasabah.dsr.toFixed(2)} ({(activeNasabah.dsr * 100).toFixed(0)}%)
                </strong>
              )}
            </div>

            {/* LTV */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">LTV</span>
              {isSimulationMode ? (
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={simNasabah.ltv}
                  onChange={(e) => setSimNasabah({ ...simNasabah, ltv: Number(e.target.value) })}
                  className="w-full text-xs font-bold text-slate-900 border-b border-blue-400 focus:outline-none"
                />
              ) : (
                <strong className="text-xs font-bold text-slate-900">
                  {activeNasabah.ltv.toFixed(2)} ({(activeNasabah.ltv * 100).toFixed(0)}%)
                </strong>
              )}
            </div>

            {/* DPD */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">DPD (Hari)</span>
              {isSimulationMode ? (
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="30"
                  value={simNasabah.dpd}
                  onChange={(e) => setSimNasabah({ ...simNasabah, dpd: Number(e.target.value) })}
                  className="w-full text-xs font-bold text-slate-900 border-b border-blue-400 focus:outline-none"
                />
              ) : (
                <strong className={`text-xs font-bold ${activeNasabah.dpd >= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {activeNasabah.dpd} hari
                </strong>
              )}
            </div>

            {/* Status Pekerjaan */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Pekerjaan</span>
              {isSimulationMode ? (
                <select
                  value={simNasabah.status_pekerjaan}
                  onChange={(e) => setSimNasabah({ ...simNasabah, status_pekerjaan: e.target.value as any })}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-blue-400 focus:outline-none"
                >
                  <option value="PNS">PNS</option>
                  <option value="Buruh">Buruh</option>
                  <option value="Wiraswasta">Wiraswasta</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              ) : (
                <strong className="text-xs font-bold text-slate-900">
                  {activeNasabah.status_pekerjaan}
                </strong>
              )}
            </div>

            {/* Kode Pos / Wilayah */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Wilayah</span>
              <strong className="text-xs font-bold text-slate-900">
                {activeNasabah.kode_pos}
              </strong>
            </div>

            {/* Durasi Pinjaman */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Tenor Pinjaman</span>
              <strong className="text-xs font-bold text-slate-900">
                {activeNasabah.durasi_pinjaman} bulan
              </strong>
            </div>

            {/* Usia */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Usia Nasabah</span>
              <strong className="text-xs font-bold text-slate-900">
                {activeNasabah.usia} tahun
              </strong>
            </div>

            {/* Risk Tier */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Kategori</span>
              <strong className={`text-xs font-bold ${
                currentRisk.probDefault < 0.35 ? 'text-emerald-700' : currentRisk.probDefault < 0.60 ? 'text-amber-700' : 'text-rose-700'
              }`}>
                {currentRisk.probDefault < 0.35 ? 'Low Risk' : currentRisk.probDefault < 0.60 ? 'Medium Risk' : 'High Risk'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Risk Assessment (5 cols) */}
        <div className="md:col-span-5 bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 border-b border-slate-200/70 pb-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Risk Assessment
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Model Output</span>
            </div>

            {/* Probability of Default Metric */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 mb-2.5 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Probability of Default (PD)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl font-bold tracking-tight ${
                  currentRisk.probDefault < 0.35
                    ? 'text-emerald-700'
                    : currentRisk.probDefault < 0.60
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}>
                  {(currentRisk.probDefault * 100).toFixed(2)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentRisk.probDefault < 0.35
                      ? 'bg-emerald-500'
                      : currentRisk.probDefault < 0.60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, currentRisk.probDefault * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% Aman</span>
                <span className="text-amber-600 font-medium">35% Review</span>
                <span className="text-rose-600 font-medium">60% Tolak</span>
              </div>
            </div>

            {/* System Recommendation Box matching app.py */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                System Recommendation
              </span>
              {currentRisk.recommendation === 'ACCEPT' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="text-xs font-bold">System Recommendation: ACCEPT</strong>
                    <p className="text-[10px] text-emerald-800">Probabilitas gagal bayar di bawah 35%. Kelayakan kredit prima.</p>
                  </div>
                </div>
              )}
              {currentRisk.recommendation === 'MANUAL REVIEW' && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <strong className="text-xs font-bold">System Recommendation: MANUAL REVIEW</strong>
                    <p className="text-[10px] text-amber-800">Kasus batas (35% - 60%). Memerlukan verifikasi analis kredit.</p>
                  </div>
                </div>
              )}
              {currentRisk.recommendation === 'REJECT' && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <div>
                    <strong className="text-xs font-bold">System Recommendation: REJECT</strong>
                    <p className="text-[10px] text-rose-800">Probabilitas gagal bayar ≥ 60%. Risiko default tinggi.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: Explain Nasabah Ini */}
          <div className="mt-3 pt-2.5 border-t border-slate-200">
            <button
              onClick={() => setShowExplanation(true)}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Explain Nasabah Ini (SHAP & LIME)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local Explanation Section (SHAP Waterfall & LIME Top 5 Factors) */}
      {showExplanation && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Local Explainability (SHAP Waterfall & LIME)
              </h3>
              <p className="text-[11px] text-slate-500">
                Transparansi faktor spesifik yang mendorong skor kredit nasabah #{activeNasabah.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. SHAP Waterfall Chart */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  SHAP Waterfall — Kontribusi Fitur
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  Base: {(localShap.baseValue * 100).toFixed(1)}% → Final: {(currentRisk.probDefault * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                Grafik kontribusi aditif (warna merah menaikkan risiko default, warna hijau menurunkan risiko).
              </p>

              <div className="h-56 w-full bg-slate-50/50 p-2 rounded border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={waterfallChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 35, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" unit="%" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, width: 100 }} width={100} />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, 'Dampak']}
                      contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                    />
                    <ReferenceLine x={0} stroke="#94a3b8" />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                      {waterfallChartData.map((entry, idx) => {
                        let fill = '#00529B';
                        if (entry.type === 'increase') fill = '#e11d48'; // Red
                        else if (entry.type === 'decrease') fill = '#10b981'; // Green
                        else if (entry.type === 'base') fill = '#64748b'; // Slate
                        return <Cell key={`cell-${idx}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span> Menaikkan Risiko
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Menurunkan Risiko
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span> Probabilitas Akhir
                </span>
              </div>
            </div>

            {/* 2. LIME Top 5 Factors Table */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  LIME — Top 5 Factors
                </h4>
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  Local Surrogate
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                Kondisi fitur spesifik yang paling relevan dalam radius pertimbangan model untuk nasabah ini.
              </p>

              <div className="overflow-hidden rounded border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Kondisi Fitur</th>
                      <th className="px-3 py-2">Bobot Kontribusi</th>
                      <th className="px-3 py-2">Arah Dampak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {limeFactors.map((factor, index) => {
                      const isRiskRaiser = factor.weight > 0;
                      return (
                        <tr key={index} className="hover:bg-slate-50/80">
                          <td className="px-3 py-2 font-medium text-slate-900 font-mono text-[11px]">
                            {factor.condition}
                          </td>
                          <td className="px-3 py-2 font-mono font-bold">
                            <span className={isRiskRaiser ? 'text-rose-600' : 'text-emerald-600'}>
                              {factor.weight >= 0 ? '+' : ''}{factor.weight.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isRiskRaiser ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {isRiskRaiser ? <TrendingUp className="w-3 h-3 text-rose-600" /> : <TrendingDown className="w-3 h-3 text-emerald-600" />}
                              {factor.impact}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-2.5 p-2 rounded bg-indigo-50/60 border border-indigo-100 text-[10px] text-indigo-900 leading-relaxed">
                <strong>Catatan LIME:</strong> Analis kredit dapat menyertakan 5 faktor ini sebagai alasan penolakan/persetujuan (Reason Code) dalam dokumen akuntabilitas audit perbankan.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
