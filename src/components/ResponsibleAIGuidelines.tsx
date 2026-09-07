import React, { useState } from 'react';
import { Shield, Scale, Eye, Users, FileCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResponsibleAIGuidelines: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    f1: true,
    f2: true,
    e1: true,
    h1: true,
    p1: true,
    a1: true,
  });

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pillars = [
    {
      id: 'fairness',
      icon: Scale,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      title: 'Fairness & Non-Discrimination',
      rules: [
        { id: 'f1', text: 'Monitor Disparate Impact (DI) dan Mean Difference (MD) secara periodik setiap siklus kredit.' },
        { id: 'f2', text: 'Wajib lakukan investigasi materiil apabila rasio persetujuan (DI) kelompok rentan di bawah 0.80 (80% rule).' },
      ],
    },
    {
      id: 'explainability',
      icon: Eye,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      title: 'Explainability & Transparency',
      rules: [
        { id: 'e1', text: 'Simpan kontribusi SHAP dan LIME sebagai Reason Codes yang jelas dan dapat dipahami nasabah.' },
        { id: 'e2', text: 'Sediakan hak bagi nasabah untuk memperoleh alasan penolakan kredit (Right to Explanation).' },
      ],
    },
    {
      id: 'oversight',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'Human Oversight (Human-in-the-Loop)',
      rules: [
        { id: 'h1', text: 'Borderline cases (probabilitas default 35% - 60%) wajib diarahkan ke Manual Review analis kredit.' },
        { id: 'h2', text: 'Model AI tidak boleh menjadi pengambil keputusan kredit tunggal tanpa hak override analis.' },
      ],
    },
    {
      id: 'proxy',
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      title: 'Proxy Discrimination Prevention',
      rules: [
        { id: 'p1', text: 'Fitur lokasi (kode pos) dan sosiodemografi harus memiliki business rationale yang terjustifikasi.' },
        { id: 'p2', text: 'Lakukan proxy discrimination test sebelum deployment untuk memastikan tidak ada fitur tersembunyi yang menggantikan variabel terproteksi.' },
      ],
    },
    {
      id: 'audit',
      icon: FileCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'Audit Trail & Accountability',
      rules: [
        { id: 'a1', text: 'Catat model version, input features, risk score, reason code, keputusan, reviewer, override reason, dan timestamp.' },
        { id: 'a2', text: 'Simpan riwayat log audit dalam penyimpanan yang tidak dapat diubah (tamper-evident log).' },
      ],
    },
    {
      id: 'privacy',
      icon: Lock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      title: 'Privacy & Security (UU PDP & OJK)',
      rules: [
        { id: 'pr1', text: 'Terapkan prinsip data minimization: hanya kumpulkan data yang relevan dengan evaluasi kredit.' },
        { id: 'pr2', text: 'Terapkan access control ketat (RBAC), retention policy, dan enkripsi data in-transit maupun at-rest.' },
      ],
    },
  ];

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 mb-4">
      {/* Title */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-3">
        <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Responsible AI Recommendation & Tata Kelola
          </h2>
          <p className="text-[11px] text-slate-500">
            6 Pilar Prinsip Kecerdasan Buatan yang Bertanggung Jawab sesuai standar Bank Indonesia dan OJK
          </p>
        </div>
      </div>

      {/* 6 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div key={pillar.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center border ${pillar.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {pillar.title}
                </h4>
              </div>

              <ul className="space-y-1.5 text-xs">
                {pillar.rules.map((rule) => {
                  const isChecked = checkedItems[rule.id];
                  return (
                    <li
                      key={rule.id}
                      onClick={() => toggleCheck(rule.id)}
                      className="flex items-start gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer select-none text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={!!isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                      />
                      <span className={isChecked ? 'text-slate-800' : 'text-slate-400 line-through'}>
                        {rule.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Disclaimer from app.py */}
      <div className="mt-3 p-2.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
        <span>
          <strong>Informasi:</strong> Dashboard ini menggunakan dataset untuk keperluan simulasi dan pelatihan <em>Responsible AI</em> BRI dan bukan sistem keputusan kredit production final.
        </span>
      </div>
    </section>
  );
};
