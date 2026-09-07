import React, { useState, useMemo } from 'react';
import { BarChart3, ScatterChart, Activity, Sliders, PieChart, Layers, ArrowUpRight } from 'lucide-react';
import { Nasabah } from '../types';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine, AreaChart, Area } from 'recharts';

interface AdvancedAnalyticsProps {
  dataset: Nasabah[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ dataset }) => {
  const [cutoffThreshold, setCutoffThreshold] = useState<number>(0.50);

  // 1. Distribution of Probability of Default (Buckets)
  const pdDistribution = useMemo(() => {
    const buckets = [
      { range: '0-10%', min: 0.0, max: 0.10, count: 0, defaults: 0 },
      { range: '10-20%', min: 0.10, max: 0.20, count: 0, defaults: 0 },
      { range: '20-35%', min: 0.20, max: 0.35, count: 0, defaults: 0 },
      { range: '35-50%', min: 0.35, max: 0.50, count: 0, defaults: 0 },
      { range: '50-65%', min: 0.50, max: 0.65, count: 0, defaults: 0 },
      { range: '65-80%', min: 0.65, max: 0.80, count: 0, defaults: 0 },
      { range: '80-100%', min: 0.80, max: 1.01, count: 0, defaults: 0 },
    ];

    dataset.forEach(d => {
      const b = buckets.find(b => d.prob_default >= b.min && d.prob_default < b.max);
      if (b) {
        b.count += 1;
        if (d.default === 1) b.defaults += 1;
      }
    });

    return buckets.map(b => ({
      ...b,
      nonDefaults: b.count - b.defaults,
      defaultRate: b.count > 0 ? Number(((b.defaults / b.count) * 100).toFixed(1)) : 0,
    }));
  }, [dataset]);

  // 2. DPD vs Actual Default Rate Trend
  const dpdRiskCurve = useMemo(() => {
    const groups: { [dpd: number]: { total: number; defaults: number; avgProb: number } } = {};
    dataset.forEach(d => {
      const bucket = Math.min(d.dpd, 18);
      if (!groups[bucket]) groups[bucket] = { total: 0, defaults: 0, avgProb: 0 };
      groups[bucket].total += 1;
      if (d.default === 1) groups[bucket].defaults += 1;
      groups[bucket].avgProb += d.prob_default;
    });

    return Object.keys(groups).map(k => {
      const key = Number(k);
      const g = groups[key];
      return {
        dpd: `${key} hr`,
        dpdNum: key,
        empiricDefaultRate: Number(((g.defaults / g.total) * 100).toFixed(1)),
        modelProbDefault: Number(((g.avgProb / g.total) * 100).toFixed(1)),
        sampleCount: g.total,
      };
    }).sort((a, b) => a.dpdNum - b.dpdNum);
  }, [dataset]);

  // 3. Segment Heatmap (Pekerjaan x Kota)
  const segmentMatrix = useMemo(() => {
    const pekerjaan = ['PNS', 'Buruh', 'Wiraswasta', 'Lainnya'];
    const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Lainnya'];

    return pekerjaan.map(p => {
      const row: any = { pekerjaan: p };
      cities.forEach(c => {
        const matching = dataset.filter(d => d.status_pekerjaan === p && d.kode_pos === c);
        const defCount = matching.filter(d => d.default === 1).length;
        const rate = matching.length > 0 ? (defCount / matching.length) * 100 : 0;
        row[c] = {
          rate: Number(rate.toFixed(1)),
          count: matching.length,
          defaults: defCount,
        };
      });
      return row;
    });
  }, [dataset]);

  // 4. ROC Curve Simulation at various cutoffs
  const rocPoints = useMemo(() => {
    const cutoffs = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const totalPos = dataset.filter(d => d.default === 1).length || 1;
    const totalNeg = dataset.filter(d => d.default === 0).length || 1;

    return cutoffs.map(c => {
      const tp = dataset.filter(d => d.prob_default >= c && d.default === 1).length;
      const fp = dataset.filter(d => d.prob_default >= c && d.default === 0).length;
      const tpr = tp / totalPos;
      const fpr = fp / totalNeg;
      return {
        cutoff: c,
        fpr: Number((fpr * 100).toFixed(1)),
        tpr: Number((tpr * 100).toFixed(1)),
        precision: (tp + fp) > 0 ? Number(((tp / (tp + fp)) * 100).toFixed(1)) : 100,
      };
    }).sort((a, b) => a.fpr - b.fpr);
  }, [dataset]);

  // Current threshold performance
  const thresholdStats = useMemo(() => {
    const tp = dataset.filter(d => d.prob_default >= cutoffThreshold && d.default === 1).length;
    const fp = dataset.filter(d => d.prob_default >= cutoffThreshold && d.default === 0).length;
    const tn = dataset.filter(d => d.prob_default < cutoffThreshold && d.default === 0).length;
    const fn = dataset.filter(d => d.prob_default < cutoffThreshold && d.default === 1).length;
    const accuracy = (tp + tn) / (dataset.length || 1);
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;

    return { tp, fp, tn, fn, accuracy, precision, recall };
  }, [dataset, cutoffThreshold]);

  return (
    <div className="space-y-4 mb-4">
      {/* 1. Risk Distribution & Probability Density */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Probabilitas Gagal Bayar (PD Distribution)
              </h3>
              <p className="text-[11px] text-slate-500">
                Sebaran nasabah berdasarkan rentang probabilitas default model XGBoost
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            Total Sampel: <strong>{dataset.length}</strong>
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pdDistribution} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(val: number, name: string) => [
                  val,
                  name === 'nonDefaults' ? 'Nasabah Lancar' : 'Nasabah Default'
                ]}
                contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="nonDefaults" stackId="a" fill="#00529B" name="Nasabah Lancar (Non-Default)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="defaults" stackId="a" fill="#f43f5e" name="Nasabah Default" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. DPD vs Risk Curve & ROC-AUC Cutoff Interactive Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DPD vs Risk Curve */}
        <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sensitivitas Hari Tunggakan (DPD) Terhadap Default
              </h4>
              <p className="text-[11px] text-slate-500">
                Korelasi riwayat DPD dengan lonjakan tingkat kredit macet empiris
              </p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dpdRiskCurve} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dpd" tick={{ fontSize: 9 }} />
                <YAxis unit="%" tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Tingkat Default']}
                  contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                />
                <Area type="monotone" dataKey="empiricDefaultRate" stroke="#f43f5e" fill="#ffe4e6" strokeWidth={1.5} name="Default Rate (%)" />
                <Line type="monotone" dataKey="modelProbDefault" stroke="#00529B" strokeWidth={1.5} strokeDasharray="3 3" name="Model PD (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Tunggakan 0-5 hari: risiko &lt; 5%</span>
            <span className="text-rose-600 font-semibold">Tunggakan &gt; 10 hari: risiko &gt; 40%</span>
          </div>
        </section>

        {/* Interactive Decision Cutoff & ROC Simulator */}
        <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Simulator Decision Threshold / Cutoff ({(cutoffThreshold * 100).toFixed(0)}%)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Uji trade-off antara True Positive vs False Positive
                </p>
              </div>
            </div>

            <div className="mb-2.5">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Threshold Klasifikasi Default</span>
                <span className="font-mono text-blue-700 font-bold px-1.5 py-0.5 rounded bg-blue-50 text-xs">
                  {cutoffThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={cutoffThreshold}
                onChange={(e) => setCutoffThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
              />
            </div>

            {/* Confusion Matrix Metric Pills */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-2.5">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-[9px] uppercase font-bold text-emerald-700 block">TP</span>
                <strong className="text-xs font-bold text-emerald-900">{thresholdStats.tp}</strong>
              </div>
              <div className="p-1.5 rounded bg-rose-50 border border-rose-200">
                <span className="text-[9px] uppercase font-bold text-rose-700 block">FP</span>
                <strong className="text-xs font-bold text-rose-900">{thresholdStats.fp}</strong>
              </div>
              <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-600 block">TN</span>
                <strong className="text-xs font-bold text-slate-900">{thresholdStats.tn}</strong>
              </div>
              <div className="p-1.5 rounded bg-amber-50 border border-amber-200">
                <span className="text-[9px] uppercase font-bold text-amber-700 block">FN</span>
                <strong className="text-xs font-bold text-amber-900">{thresholdStats.fn}</strong>
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block text-[10px]">Model Accuracy</span>
              <strong className="text-slate-900 text-xs">{(thresholdStats.accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Precision</span>
              <strong className="text-slate-900 text-xs">{(thresholdStats.precision * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Recall</span>
              <strong className="text-slate-900 text-xs">{(thresholdStats.recall * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Heatmap Matrix: Pekerjaan x Wilayah */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Matriks Konsentrasi Risiko Default: Status Pekerjaan vs Kota (%)
            </h4>
            <p className="text-[11px] text-slate-500">
              Heatmap persentase default rate berdasarkan iris wilayah dan profil nasabah
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Warna lebih pekat = Risiko Default Lebih Tinggi</span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Kelompok Pekerjaan</th>
                <th className="px-3 py-2">Jakarta</th>
                <th className="px-3 py-2">Bandung</th>
                <th className="px-3 py-2">Surabaya</th>
                <th className="px-3 py-2">Medan</th>
                <th className="px-3 py-2">Lainnya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segmentMatrix.map((row) => (
                <tr key={row.pekerjaan} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 font-bold text-slate-900 text-xs">{row.pekerjaan}</td>
                  {['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Lainnya'].map((c) => {
                    const cell = row[c];
                    const rate = cell?.rate ?? 0;
                    // Color gradient based on default rate
                    let bg = 'bg-emerald-50 text-emerald-900';
                    if (rate >= 25) bg = 'bg-rose-200 text-rose-950 font-bold';
                    else if (rate >= 15) bg = 'bg-rose-100 text-rose-900';
                    else if (rate >= 8) bg = 'bg-amber-50 text-amber-900';

                    return (
                      <td key={c} className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono text-xs ${bg}`}>
                          {rate.toFixed(1)}% <span className="text-[9px] font-normal opacity-70">({cell.count})</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
