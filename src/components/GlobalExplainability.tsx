import React, { useState } from 'react';
import { Layers, HelpCircle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { GLOBAL_SHAP_IMPORTANCE } from '../utils/mlEngine';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const GlobalExplainability: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredFeatures = selectedCategory === 'ALL'
    ? GLOBAL_SHAP_IMPORTANCE
    : GLOBAL_SHAP_IMPORTANCE.filter(f => f.category === selectedCategory);

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 mb-4">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              SHAP — Global Explainability
            </h2>
            <p className="text-[11px] text-slate-500">
              Pengaruh global setiap fitur terhadap prediksi probabilitas default model XGBoost
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Kategori:</span>
          {['ALL', 'Karakter Finansial', 'Pinjaman', 'Sosiodemografi'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Bar Chart & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Top 10 Feature Importance — SHAP</span>
            <span className="text-[10px] text-slate-400">Mean |SHAP Value|</span>
          </div>

          <div className="h-64 w-full bg-slate-50/50 p-2 rounded-lg border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={filteredFeatures}
                margin={{ top: 5, right: 25, left: 65, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 0.7]} tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 10, width: 130 }}
                  width={130}
                />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(3)}`, 'Mean |SHAP|']}
                  contentStyle={{ borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                />
                <Bar dataKey="meanShap" radius={[0, 3, 3, 0]}>
                  {filteredFeatures.map((entry, index) => {
                    const color = entry.category === 'Pinjaman'
                      ? '#00529B' // BRI Blue
                      : entry.category === 'Karakter Finansial'
                      ? '#0284c7' // Sky Blue
                      : '#8b5cf6'; // Violet
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#00529B]"></span> Pinjaman / Fasilitas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7]"></span> Karakter Finansial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#8b5cf6]"></span> Sosiodemografi / Wilayah
            </span>
          </div>
        </div>

        {/* Feature Insights & Direction (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Arah Pengaruh Fitur Terhadap Risiko</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              {filteredFeatures.slice(0, 5).map((f) => {
                const isPositive = f.direction.includes('Menaikkan');
                return (
                  <div
                    key={f.feature}
                    className="p-2 rounded border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">{f.label}</span>
                      <span className="text-[10px] text-slate-400">{f.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isPositive
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {isPositive ? 'Menaikkan' : 'Menurunkan'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded bg-slate-50 text-[10px] text-slate-500 border border-slate-200 leading-relaxed">
            <strong className="text-slate-800">Interpretasi Perbankan:</strong>
            <p className="mt-0.5">
              Fitur <strong>DPD (Days Past Due)</strong> dan <strong>DSR (Debt Service Ratio)</strong> mendominasi penentuan kredit macet. Karakter sosiodemografi dipantau secara ketat agar tidak menjadi proxy diskriminasi finansial.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
