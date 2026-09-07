import { Nasabah, FairnessMetric, ShapFeatureImportance, LocalShapContribution, LimeFactor } from '../types';

export function calculateMetrics(data: Nasabah[]) {
  if (data.length === 0) {
    return {
      totalNasabah: 0,
      defaultRate: 0,
      approvalRate: 0,
      rocAuc: 0.842,
      avgIncome: 0,
      avgDsr: 0,
      avgLtv: 0,
      avgDpd: 0,
    };
  }

  const total = data.length;
  const totalDefaults = data.filter(d => d.default === 1).length;
  const totalApproved = data.filter(d => d.approved === 1).length;
  const defaultRate = totalDefaults / total;
  const approvalRate = totalApproved / total;

  const avgIncome = data.reduce((acc, curr) => acc + curr.income, 0) / total;
  const avgDsr = data.reduce((acc, curr) => acc + curr.dsr, 0) / total;
  const avgLtv = data.reduce((acc, curr) => acc + curr.ltv, 0) / total;
  const avgDpd = data.reduce((acc, curr) => acc + curr.dpd, 0) / total;

  // Calculate empirical ROC-AUC using Mann-Whitney U on prob_default vs actual default
  const posScores = data.filter(d => d.default === 1).map(d => d.prob_default);
  const negScores = data.filter(d => d.default === 0).map(d => d.prob_default);

  let rocAuc = 0.845;
  if (posScores.length > 0 && negScores.length > 0) {
    let concordant = 0;
    let totalPairs = posScores.length * negScores.length;
    // Subsample pairs if too large for speed
    const maxPos = Math.min(posScores.length, 200);
    const maxNeg = Math.min(negScores.length, 500);
    for (let i = 0; i < maxPos; i++) {
      for (let j = 0; j < maxNeg; j++) {
        if (posScores[i] > negScores[j]) concordant += 1;
        else if (posScores[i] === negScores[j]) concordant += 0.5;
      }
    }
    rocAuc = concordant / (maxPos * maxNeg);
  }

  return {
    totalNasabah: total,
    defaultRate,
    approvalRate,
    rocAuc: Number(rocAuc.toFixed(4)),
    avgIncome,
    avgDsr: Number(avgDsr.toFixed(2)),
    avgLtv: Number(avgLtv.toFixed(2)),
    avgDpd: Number(avgDpd.toFixed(1)),
  };
}

export function calculateFairness(data: Nasabah[]): FairnessMetric[] {
  const pnsList = data.filter(d => d.status_pekerjaan === 'PNS');
  const pnsApprovalRate = pnsList.length > 0
    ? pnsList.filter(d => d.approved === 1).length / pnsList.length
    : 0.90;

  const targetGroups: Array<'Buruh' | 'Wiraswasta' | 'Lainnya'> = ['Buruh', 'Wiraswasta', 'Lainnya'];
  
  return targetGroups.map(group => {
    const groupList = data.filter(d => d.status_pekerjaan === group);
    const groupApprovalRate = groupList.length > 0
      ? groupList.filter(d => d.approved === 1).length / groupList.length
      : 0;

    const disparateImpact = pnsApprovalRate > 0 ? groupApprovalRate / pnsApprovalRate : 0;
    const meanDifference = groupApprovalRate - pnsApprovalRate;

    let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
    if (disparateImpact < 0.70) {
      status = 'CRITICAL';
    } else if (disparateImpact < 0.80) {
      status = 'WARNING';
    }

    return {
      kelompok: group,
      approvalRatePNS: Number(pnsApprovalRate.toFixed(4)),
      approvalRateKelompok: Number(groupApprovalRate.toFixed(4)),
      disparateImpact: Number(disparateImpact.toFixed(3)),
      meanDifference: Number(meanDifference.toFixed(3)),
      status,
    };
  });
}

export const GLOBAL_SHAP_IMPORTANCE: ShapFeatureImportance[] = [
  {
    feature: 'dpd',
    label: 'Days Past Due (DPD)',
    meanShap: 0.582,
    direction: 'Positif (Menaikkan Risiko)',
    category: 'Pinjaman',
  },
  {
    feature: 'income',
    label: 'Monthly Income (Pendapatan)',
    meanShap: 0.435,
    direction: 'Negatif (Menurunkan Risiko)',
    category: 'Karakter Finansial',
  },
  {
    feature: 'dsr',
    label: 'Debt Service Ratio (DSR)',
    meanShap: 0.388,
    direction: 'Positif (Menaikkan Risiko)',
    category: 'Karakter Finansial',
  },
  {
    feature: 'ltv',
    label: 'Loan-to-Value (LTV)',
    meanShap: 0.312,
    direction: 'Positif (Menaikkan Risiko)',
    category: 'Pinjaman',
  },
  {
    feature: 'status_pekerjaan_Buruh',
    label: 'Pekerjaan: Buruh',
    meanShap: 0.284,
    direction: 'Positif (Menaikkan Risiko)',
    category: 'Sosiodemografi',
  },
  {
    feature: 'status_pekerjaan_PNS',
    label: 'Pekerjaan: PNS',
    meanShap: 0.241,
    direction: 'Negatif (Menurunkan Risiko)',
    category: 'Sosiodemografi',
  },
  {
    feature: 'durasi_pinjaman',
    label: 'Durasi Pinjaman (Bulan)',
    meanShap: 0.176,
    direction: 'Positif (Menaikkan Risiko)',
    category: 'Pinjaman',
  },
  {
    feature: 'usia',
    label: 'Usia Nasabah (Tahun)',
    meanShap: 0.138,
    direction: 'Negatif (Menurunkan Risiko)',
    category: 'Sosiodemografi',
  },
  {
    feature: 'kode_pos_Surabaya',
    label: 'Kode Pos / Kota: Surabaya',
    meanShap: 0.082,
    direction: 'Negatif (Menurunkan Risiko)',
    category: 'Sosiodemografi',
  },
  {
    feature: 'kode_pos_Jakarta',
    label: 'Kode Pos / Kota: Jakarta',
    meanShap: 0.069,
    direction: 'Negatif (Menurunkan Risiko)',
    category: 'Sosiodemografi',
  },
];

export function computeLocalShap(nasabah: Nasabah): {
  baseValue: number;
  finalValue: number;
  contributions: LocalShapContribution[];
} {
  const baseValue = 0.145; // baseline E[f(x)] default probability
  const contribs: LocalShapContribution[] = [];

  // 1. DPD
  const dpdContrib = (nasabah.dpd - 7.5) * 0.024;
  contribs.push({
    feature: 'dpd',
    label: `DPD = ${nasabah.dpd} hari`,
    value: nasabah.dpd,
    contribution: Number(dpdContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 2. DSR
  const dsrContrib = (nasabah.dsr - 0.52) * 0.28;
  contribs.push({
    feature: 'dsr',
    label: `DSR = ${(nasabah.dsr * 100).toFixed(0)}%`,
    value: nasabah.dsr,
    contribution: Number(dsrContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 3. LTV
  const ltvContrib = (nasabah.ltv - 0.56) * 0.22;
  contribs.push({
    feature: 'ltv',
    label: `LTV = ${(nasabah.ltv * 100).toFixed(0)}%`,
    value: nasabah.ltv,
    contribution: Number(ltvContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 4. Income
  const incomeNormalized = (nasabah.income - 8000000) / 5000000;
  const incomeContrib = -incomeNormalized * 0.065;
  contribs.push({
    feature: 'income',
    label: `Income = Rp ${nasabah.income.toLocaleString('id-ID')}`,
    value: nasabah.income,
    contribution: Number(incomeContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 5. Status Pekerjaan
  let jobContrib = 0;
  if (nasabah.status_pekerjaan === 'PNS') jobContrib = -0.055;
  else if (nasabah.status_pekerjaan === 'Buruh') jobContrib = 0.075;
  else if (nasabah.status_pekerjaan === 'Wiraswasta') jobContrib = 0.02;
  else jobContrib = 0.04;
  contribs.push({
    feature: 'status_pekerjaan',
    label: `Status = ${nasabah.status_pekerjaan}`,
    value: nasabah.status_pekerjaan,
    contribution: Number(jobContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 6. Usia
  const usiaContrib = -(nasabah.usia - 42) * 0.0018;
  contribs.push({
    feature: 'usia',
    label: `Usia = ${nasabah.usia} thn`,
    value: nasabah.usia,
    contribution: Number(usiaContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // 7. Durasi Pinjaman
  const durasiContrib = (nasabah.durasi_pinjaman - 36) * 0.0012;
  contribs.push({
    feature: 'durasi_pinjaman',
    label: `Durasi = ${nasabah.durasi_pinjaman} bln`,
    value: nasabah.durasi_pinjaman,
    contribution: Number(durasiContrib.toFixed(4)),
    cumulativeValue: 0,
  });

  // Sort by absolute impact
  contribs.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  let running = baseValue;
  contribs.forEach(c => {
    running += c.contribution;
    c.cumulativeValue = Math.max(0.001, Math.min(0.999, Number(running.toFixed(4))));
  });

  return {
    baseValue,
    finalValue: nasabah.prob_default,
    contributions: contribs,
  };
}

export function computeLimeFactors(nasabah: Nasabah): LimeFactor[] {
  const factors: LimeFactor[] = [];

  if (nasabah.dpd >= 10) {
    factors.push({
      condition: `DPD (Hari Tunggakan) >= 10 [${nasabah.dpd} hari]`,
      weight: 0.28,
      impact: 'Menaikkan Risiko Default',
    });
  } else if (nasabah.dpd <= 4) {
    factors.push({
      condition: `DPD (Hari Tunggakan) <= 4 [${nasabah.dpd} hari]`,
      weight: -0.19,
      impact: 'Menurunkan Risiko Default',
    });
  }

  if (nasabah.dsr >= 0.65) {
    factors.push({
      condition: `DSR (Beban Hutang) > 65% [${(nasabah.dsr * 100).toFixed(0)}%]`,
      weight: 0.22,
      impact: 'Menaikkan Risiko Default',
    });
  } else if (nasabah.dsr <= 0.30) {
    factors.push({
      condition: `DSR (Beban Hutang) <= 30% [${(nasabah.dsr * 100).toFixed(0)}%]`,
      weight: -0.16,
      impact: 'Menurunkan Risiko Default',
    });
  }

  if (nasabah.ltv >= 0.75) {
    factors.push({
      condition: `LTV (Plafon / Agunan) >= 75% [${(nasabah.ltv * 100).toFixed(0)}%]`,
      weight: 0.17,
      impact: 'Menaikkan Risiko Default',
    });
  } else if (nasabah.ltv <= 0.40) {
    factors.push({
      condition: `LTV (Plafon / Agunan) <= 40% [${(nasabah.ltv * 100).toFixed(0)}%]`,
      weight: -0.14,
      impact: 'Menurunkan Risiko Default',
    });
  }

  if (nasabah.income >= 12000000) {
    factors.push({
      condition: `Income >= Rp 12.000.000 [Rp ${(nasabah.income / 1000000).toFixed(1)} jt]`,
      weight: -0.21,
      impact: 'Menurunkan Risiko Default',
    });
  } else if (nasabah.income <= 2000000) {
    factors.push({
      condition: `Income Rendah <= Rp 2.000.000`,
      weight: 0.18,
      impact: 'Menaikkan Risiko Default',
    });
  }

  if (nasabah.status_pekerjaan === 'PNS') {
    factors.push({
      condition: `Status Pekerjaan adalah PNS`,
      weight: -0.15,
      impact: 'Menurunkan Risiko Default',
    });
  } else if (nasabah.status_pekerjaan === 'Buruh') {
    factors.push({
      condition: `Status Pekerjaan adalah Buruh`,
      weight: 0.16,
      impact: 'Menaikkan Risiko Default',
    });
  }

  if (nasabah.durasi_pinjaman > 48) {
    factors.push({
      condition: `Tenor Pinjaman Panjang > 48 Bulan [${nasabah.durasi_pinjaman} bln]`,
      weight: 0.08,
      impact: 'Menaikkan Risiko Default',
    });
  }

  if (nasabah.usia < 25) {
    factors.push({
      condition: `Usia Muda < 25 Tahun [${nasabah.usia} thn]`,
      weight: 0.09,
      impact: 'Menaikkan Risiko Default',
    });
  } else if (nasabah.usia >= 50) {
    factors.push({
      condition: `Usia Mapan >= 50 Tahun [${nasabah.usia} thn]`,
      weight: -0.07,
      impact: 'Menurunkan Risiko Default',
    });
  }

  // Ensure top 5 factors
  factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  return factors.slice(0, 5);
}

export function simulateRiskScore(nasabah: Partial<Nasabah>): {
  probDefault: number;
  recommendation: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT';
} {
  const dpd = nasabah.dpd ?? 7;
  const dsr = nasabah.dsr ?? 0.5;
  const ltv = nasabah.ltv ?? 0.55;
  const income = nasabah.income ?? 8000000;
  const statusPek = nasabah.status_pekerjaan ?? 'Wiraswasta';
  const durasi = nasabah.durasi_pinjaman ?? 36;
  const usia = nasabah.usia ?? 40;

  const jobFactor = statusPek === 'Buruh' ? 0.45 : (statusPek === 'PNS' ? -0.35 : (statusPek === 'Wiraswasta' ? 0.10 : 0.25));
  const z = (
    -4.60
    + 0.22 * (dpd - 7)
    + 2.85 * (dsr - 0.50)
    + 2.10 * (ltv - 0.55)
    - 0.00000015 * (income - 8000000)
    + jobFactor
    + 0.015 * (60 - durasi) / 10
    - 0.012 * (usia - 40)
  );

  const probDefault = Number((1 / (1 + Math.exp(-z))).toFixed(4));
  let recommendation: 'ACCEPT' | 'MANUAL REVIEW' | 'REJECT' = 'ACCEPT';
  if (probDefault >= 0.60) {
    recommendation = 'REJECT';
  } else if (probDefault >= 0.35) {
    recommendation = 'MANUAL REVIEW';
  }

  return { probDefault, recommendation };
}
