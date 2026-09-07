import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Download, Trash2, FileText, User } from 'lucide-react';
import { Nasabah, AuditLog } from '../types';

interface HumanInTheLoopProps {
  currentNasabah: Nasabah;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export const HumanInTheLoop: React.FC<HumanInTheLoopProps> = ({
  currentNasabah,
  auditLogs,
  setAuditLogs,
}) => {
  const [reviewerName, setReviewerName] = useState<string>('Analisis Kredit BRI - Wilayah I');
  const [notes, setNotes] = useState<string>('');
  const [lastNotification, setLastNotification] = useState<{
    type: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT';
    message: string;
  } | null>(null);

  const getSystemRecommendation = (prob: number): 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT' => {
    if (prob < 0.35) return 'ACCEPT';
    if (prob < 0.60) return 'MANUAL REVIEW';
    return 'REJECT';
  };

  const handleDecision = (decision: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT') => {
    const sysRec = getSystemRecommendation(currentNasabah.prob_default);
    const newLog: AuditLog = {
      id: `AUDIT-${Date.now().toString().slice(-6)}`,
      nasabahId: currentNasabah.id,
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
      reviewer: reviewerName || 'Credit Officer',
      probDefault: currentNasabah.prob_default,
      systemRecommendation: sysRec,
      finalDecision: decision,
      overrideReason: sysRec !== decision
        ? (notes || 'Override keputusan model oleh Analis Risiko berwenang')
        : 'Sesuai rekomendasi model AI',
      notes: notes,
    };

    setAuditLogs(prev => [newLog, ...prev]);

    let notifMsg = '';
    if (decision === 'ACCEPT') notifMsg = `✅ Final Decision: ACCEPT untuk Nasabah #${currentNasabah.id}`;
    else if (decision === 'REJECT') notifMsg = `❌ Final Decision: REJECT untuk Nasabah #${currentNasabah.id}`;
    else notifMsg = `🧑‍💼 Nasabah #${currentNasabah.id} diarahkan ke MANUAL REVIEW komite kredit.`;

    setLastNotification({ type: decision, message: notifMsg });
    setNotes('');
  };

  const exportAuditTrailCsv = () => {
    if (auditLogs.length === 0) return;
    const header = 'ID_Audit,ID_Nasabah,Timestamp,Reviewer,Prob_Default,Rekomendasi_Sistem,Keputusan_Akhir,Alasan_Catatan\n';
    const rows = auditLogs.map(l =>
      `"${l.id}",${l.nasabahId},"${l.timestamp}","${l.reviewer}",${(l.probDefault * 100).toFixed(2)}%,"${l.systemRecommendation}","${l.finalDecision}","${(l.notes || l.overrideReason).replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_bri_credit_risk_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (window.confirm('Hapus seluruh riwayat log keputusan audit saat ini?')) {
      setAuditLogs([]);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-xs p-3.5 mb-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Human-in-the-Loop Decision & Audit Trail</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Keputusan akhir tetap memerlukan akuntabilitas manusia. Model AI tidak menjadi pengambil keputusan tunggal.
            </p>
          </div>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1.5">
          <User className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Nama Reviewer / Analis"
            className="font-medium text-slate-800 bg-transparent focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Live notification feedback */}
      {lastNotification && (
        <div className={`my-2.5 p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
          lastNotification.type === 'ACCEPT'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : lastNotification.type === 'REJECT'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <span>{lastNotification.message}</span>
          <button
            onClick={() => setLastNotification(null)}
            className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Decision Action Area */}
      <div className="my-3 p-3 rounded-lg bg-slate-50/80 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2.5">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Form Keputusan untuk Nasabah #{currentNasabah.id} ({currentNasabah.status_pekerjaan} - Rp {currentNasabah.income.toLocaleString('id-ID')})
            </span>
            <span className="text-xs text-slate-600">
              Rekomendasi AI: <strong>{getSystemRecommendation(currentNasabah.prob_default)}</strong> (PD: {(currentNasabah.prob_default * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan / Reason code jika override..."
              className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 3 Action Buttons from app.py */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleDecision('ACCEPT')}
            className="py-2 px-3 rounded font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept (Setujui)</span>
          </button>

          <button
            onClick={() => handleDecision('REJECT')}
            className="py-2 px-3 rounded font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject (Tolak)</span>
          </button>

          <button
            onClick={() => handleDecision('MANUAL REVIEW')}
            className="py-2 px-3 rounded font-semibold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Manual Review (Komite)</span>
          </button>
        </div>
      </div>

      {/* Audit Trail Log Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Audit Trail Log ({auditLogs.length} Keputusan Tercatat)
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            {auditLogs.length > 0 && (
              <>
                <button
                  onClick={exportAuditTrailCsv}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Unduh log dalam format CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors cursor-pointer"
                  title="Kosongkan log audit"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bersihkan</span>
                </button>
              </>
            )}
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-5 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
            Belum ada keputusan tercatat. Klik salah satu tombol keputusan di atas untuk mencatat ke dalam audit trail perbankan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-left border-collapse text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">ID Log</th>
                  <th className="px-3 py-2">Nasabah</th>
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Reviewer</th>
                  <th className="px-3 py-2">Prob. Default</th>
                  <th className="px-3 py-2">Rekomendasi AI</th>
                  <th className="px-3 py-2">Keputusan Manusia</th>
                  <th className="px-3 py-2">Catatan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => {
                  const isOverride = log.systemRecommendation !== log.finalDecision;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{log.id}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">#{log.nasabahId}</td>
                      <td className="px-3 py-2 text-slate-500 text-[11px]">{log.timestamp}</td>
                      <td className="px-3 py-2 text-slate-700">{log.reviewer}</td>
                      <td className="px-3 py-2 font-mono">{(log.probDefault * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {log.systemRecommendation}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.finalDecision === 'ACCEPT'
                            ? 'bg-emerald-50 text-emerald-800'
                            : log.finalDecision === 'REJECT'
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {log.finalDecision}
                        </span>
                        {isOverride && (
                          <span className="ml-1 text-[10px] text-amber-700 font-semibold">(Override)</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate text-xs" title={log.notes || log.overrideReason}>
                        {log.notes || log.overrideReason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
