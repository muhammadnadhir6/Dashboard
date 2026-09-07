export interface Nasabah {
  id: number;
  income: number;
  dsr: number;
  ltv: number;
  dpd: number;
  durasi_pinjaman: number;
  status_pekerjaan: 'PNS' | 'Buruh' | 'Wiraswasta' | 'Lainnya';
  usia: number;
  default: number; // 0 or 1
  kode_pos: 'Jakarta' | 'Bandung' | 'Surabaya' | 'Medan' | 'Lainnya';
  prob_default: number;
  pred_default: number;
  approved: number;
}

export interface FairnessMetric {
  kelompok: string;
  approvalRatePNS: number;
  approvalRateKelompok: number;
  disparateImpact: number;
  meanDifference: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface ShapFeatureImportance {
  feature: string;
  label: string;
  meanShap: number;
  direction: 'Positif (Menaikkan Risiko)' | 'Negatif (Menurunkan Risiko)';
  category: 'Karakter Finansial' | 'Pinjaman' | 'Sosiodemografi';
}

export interface LocalShapContribution {
  feature: string;
  label: string;
  value: string | number;
  contribution: number; // positive increases default risk, negative reduces
  cumulativeValue: number;
}

export interface LimeFactor {
  condition: string;
  weight: number;
  impact: 'Menaikkan Risiko Default' | 'Menurunkan Risiko Default';
}

export interface AuditLog {
  id: string;
  nasabahId: number;
  timestamp: string;
  reviewer: string;
  probDefault: number;
  systemRecommendation: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT';
  finalDecision: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT';
  overrideReason: string;
  notes?: string;
}

export interface FilterState {
  statusPekerjaan: string[];
  kodePos: string[];
  minIncome: number;
  maxIncome: number;
  minDsr: number;
  maxDsr: number;
  minLtv: number;
  maxLtv: number;
  minDpd: number;
  maxDpd: number;
  minUsia: number;
  maxUsia: number;
  defaultStatus: 'ALL' | 'DEFAULT' | 'NON_DEFAULT';
  searchQuery: string;
}
