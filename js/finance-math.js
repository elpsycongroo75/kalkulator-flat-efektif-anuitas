/**
 * Financial Mathematics Engine - Vanilla JS
 * Standar Perbankan Bank Indonesia (BI) & Otoritas Jasa Keuangan (OJK)
 */

export const FinanceMath = {
  calculateFlat(P, rFlatAnnual, nMonths, startDate = new Date()) {
    const r = rFlatAnnual / 100;
    const totalInterest = P * r * (nMonths / 12);
    const totalPayment = P + totalInterest;
    const principalPerMonth = P / nMonths;
    const interestPerMonth = totalInterest / nMonths;
    const monthlyInstallment = principalPerMonth + interestPerMonth;

    const schedule = [];
    let remainingBalance = P;

    for (let k = 1; k <= nMonths; k++) {
      const initialBalance = remainingBalance;
      const principal = k === nMonths ? remainingBalance : principalPerMonth;
      const interest = interestPerMonth;
      remainingBalance = Math.max(0, initialBalance - principal);
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + k);

      schedule.push({
        month: k,
        dueDate: dueDate.toISOString().split('T')[0],
        initialBalance,
        principal,
        interest,
        totalInstallment: principal + interest,
        remainingBalance
      });
    }

    return {
      type: 'FLAT',
      name: 'Bunga Flat (Tetap)',
      principal: P,
      rateAnnual: rFlatAnnual,
      nMonths,
      monthlyInstallment,
      firstInstallment: monthlyInstallment,
      lastInstallment: monthlyInstallment,
      totalInterest,
      totalPayment,
      schedule
    };
  },

  calculateEffective(P, rEffAnnual, nMonths, startDate = new Date()) {
    const rMonthly = (rEffAnnual / 100) / 12;
    const principalPerMonth = P / nMonths;
    
    const schedule = [];
    let remainingBalance = P;
    let totalInterest = 0;

    for (let k = 1; k <= nMonths; k++) {
      const initialBalance = remainingBalance;
      const interest = initialBalance * rMonthly;
      const principal = k === nMonths ? remainingBalance : principalPerMonth;
      const installment = principal + interest;
      remainingBalance = Math.max(0, initialBalance - principal);
      totalInterest += interest;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + k);

      schedule.push({
        month: k,
        dueDate: dueDate.toISOString().split('T')[0],
        initialBalance,
        principal,
        interest,
        totalInstallment: installment,
        remainingBalance
      });
    }

    return {
      type: 'EFEKTIF',
      name: 'Bunga Efektif (Menurun/Sliding)',
      principal: P,
      rateAnnual: rEffAnnual,
      nMonths,
      monthlyInstallment: schedule[0].totalInstallment,
      firstInstallment: schedule[0].totalInstallment,
      lastInstallment: schedule[schedule.length - 1].totalInstallment,
      totalInterest,
      totalPayment: P + totalInterest,
      schedule
    };
  },

  calculateAnnuity(P, rAnnuityAnnual, nMonths, startDate = new Date()) {
    const i = (rAnnuityAnnual / 100) / 12;
    let monthlyInstallment = 0;

    if (i === 0) {
      monthlyInstallment = P / nMonths;
    } else {
      monthlyInstallment = P * (i * Math.pow(1 + i, nMonths)) / (Math.pow(1 + i, nMonths) - 1);
    }

    const schedule = [];
    let remainingBalance = P;
    let totalInterest = 0;

    for (let k = 1; k <= nMonths; k++) {
      const initialBalance = remainingBalance;
      const interest = initialBalance * i;
      let principal = monthlyInstallment - interest;
      
      if (k === nMonths || principal > remainingBalance) {
        principal = remainingBalance;
      }
      
      const installment = principal + interest;
      remainingBalance = Math.max(0, initialBalance - principal);
      totalInterest += interest;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + k);

      schedule.push({
        month: k,
        dueDate: dueDate.toISOString().split('T')[0],
        initialBalance,
        principal,
        interest,
        totalInstallment: installment,
        remainingBalance
      });
    }

    return {
      type: 'ANUITAS',
      name: 'Bunga Anuitas (Cicilan Tetap)',
      principal: P,
      rateAnnual: rAnnuityAnnual,
      nMonths,
      monthlyInstallment,
      firstInstallment: monthlyInstallment,
      lastInstallment: monthlyInstallment,
      totalInterest,
      totalPayment: P + totalInterest,
      schedule
    };
  },

  convertFlatToEffective(P, rFlatAnnual, nMonths) {
    const rFlat = rFlatAnnual / 100;
    const totalInterest = P * rFlat * (nMonths / 12);
    const pmt = (P + totalInterest) / nMonths;

    // Formula Pendekatan OJK / Bank: r_eff ~ 2n / (n + 1) * r_flat
    const rOjkEstimated = rFlatAnnual * (2 * nMonths) / (nMonths + 1);

    // Initial guess untuk Newton-Raphson
    let i = (rOjkEstimated / 100) / 12;
    if (i <= 0) i = 0.01;

    const tol = 1e-9;
    const maxIter = 100;
    let iter = 0;

    while (iter < maxIter) {
      const powTerm = Math.pow(1 + i, -nMonths);
      const pv = pmt * (1 - powTerm) / i;
      const f = P - pv;

      if (Math.abs(f) < tol) break;

      const df = -pmt * (nMonths * i * Math.pow(1 + i, -nMonths - 1) - (1 - powTerm)) / (i * i);
      const iNext = i - f / df;

      if (Math.abs(iNext - i) < tol) {
        i = iNext;
        break;
      }
      i = iNext;
      iter++;
    }

    const rEffNominal = i * 12 * 100; // Standar Perbankan Indonesia (% p.a. nominal)
    const rEffCompounded = (Math.pow(1 + i, 12) - 1) * 100; // Compounding APR / APY

    return {
      flatRate: rFlatAnnual,
      effectiveNominal: rEffNominal,
      effectiveCompounded: rEffCompounded,
      ojkEstimate: rOjkEstimated,
      monthlyPayment: pmt,
      totalInterest,
      totalPayment: P + totalInterest,
      iterations: iter
    };
  },

  convertEffectiveToFlat(P, rEffAnnual, nMonths) {
    const i = (rEffAnnual / 100) / 12;
    let pmt = 0;

    if (i === 0) {
      pmt = P / nMonths;
    } else {
      pmt = P * (i * Math.pow(1 + i, nMonths)) / (Math.pow(1 + i, nMonths) - 1);
    }

    const totalPayment = pmt * nMonths;
    const totalInterest = totalPayment - P;
    const rFlatAnnual = (totalInterest / (P * (nMonths / 12))) * 100;

    // Untuk bunga efektif menurun (sliding rate) jika pokok dicicil rata
    const totalInterestSliding = i * P * (nMonths + 1) / 2;
    const rFlatSlidingEquivalent = (totalInterestSliding / (P * (nMonths / 12))) * 100;

    return {
      effectiveRate: rEffAnnual,
      flatRateFromAnnuity: rFlatAnnual,
      flatRateFromSliding: rFlatSlidingEquivalent,
      monthlyPaymentAnnuity: pmt,
      totalInterestAnnuity: totalInterest,
      totalPaymentAnnuity: totalPayment,
      totalInterestSliding
    };
  },

  calculateDailyInterest(P, rAnnual, days, dayCountConvention = 'ACTUAL_360', penaltyPercent = 0, method = 'EFEKTIF', startDate = new Date(), nMonths = 12, facilityType = 'AMORTIZING') {
    let basis = 360;
    if (dayCountConvention === 'ACTUAL_365') basis = 365;
    else if (dayCountConvention === '30_360') basis = 360;

    const rDecimal = rAnnual / 100;
    const dailyRate = rDecimal / basis;

    // Hitung amortisasi bulanan 3 metode sebagai referensi baki debet
    const flatCalc = this.calculateFlat(P, rAnnual, nMonths, startDate);
    const effCalc = this.calculateEffective(P, rAnnual, nMonths, startDate);
    const annCalc = this.calculateAnnuity(P, rAnnual, nMonths, startDate);

    // Jadwal tanggal jatuh tempo per bulan
    const sDate = new Date(startDate);
    const dueDates = [];
    for (let m = 1; m <= nMonths; m++) {
      const dDate = new Date(sDate);
      dDate.setMonth(dDate.getMonth() + m);
      dueDates.push(dDate);
    }

    // Fungsi simulasi harian untuk satu metode spesifik
    const simulateSingle = (targetMethod) => {
      let sched = effCalc.schedule;
      if (targetMethod === 'FLAT') sched = flatCalc.schedule;
      else if (targetMethod === 'ANUITAS') sched = annCalc.schedule;

      let cumInterest = 0;
      let curBalance = P;
      let curDailyInterest = 0;
      const dailySchedule = [];
      const maxTableDays = Math.min(days, 365);
      const daysPerMonth = basis / 12; // 30 hari pada basis 360, 30.4167 pada basis 365
      const maxTenorDays = Math.round(nMonths * daysPerMonth);

      for (let d = 1; d <= days; d++) {
        const curDate = new Date(sDate);
        curDate.setDate(curDate.getDate() + d);

        let principalForInterest = P;
        if (facilityType === 'AMORTIZING') {
          if (d > maxTenorDays) {
            // Pinjaman sudah mencapai jatuh tempo penuh (lunas)
            const lastIdx = nMonths - 1;
            curBalance = 0;
            curDailyInterest = (targetMethod === 'FLAT' ? P : sched[lastIdx].initialBalance) * dailyRate;
            // Bunga tidak bertambah lagi setelah tenor selesai
          } else {
            const mIdx = Math.min(nMonths - 1, Math.floor((d - 1) / daysPerMonth));
            curBalance = sched[mIdx].initialBalance;
            // Bunga Flat: bank menagih bunga dari 100% plafon awal (P)
            // Bunga Efektif / Anuitas: bank menagih bunga dari sisa baki debet bulan berjalan
            principalForInterest = targetMethod === 'FLAT' ? P : curBalance;
            curDailyInterest = principalForInterest * dailyRate;
            cumInterest += curDailyInterest;
          }
        } else {
          // Fasilitas Rekening Koran (PRK) / Non-Amortisasi: Pokok konstan
          curBalance = P;
          principalForInterest = P;
          curDailyInterest = P * dailyRate;
          cumInterest += curDailyInterest;
        }

        if (d <= maxTableDays) {
          const penaltyToday = curBalance * (penaltyPercent / 100);
          dailySchedule.push({
            day: d,
            date: curDate.toISOString().split('T')[0],
            balance: curBalance,
            dailyRatePercent: dailyRate * 100,
            dailyInterest: curDailyInterest,
            accruedInterest: cumInterest,
            payoff: curBalance + curDailyInterest + penaltyToday
          });
        }
      }

      const penaltyFee = curBalance * (penaltyPercent / 100);
      const totalEarlyPayoff = curBalance + curDailyInterest + penaltyFee;

      return {
        method: targetMethod,
        dailyRatePercent: dailyRate * 100,
        dailyInterestAmount: curDailyInterest,
        totalAccruedInterest: cumInterest,
        remainingBalance: curBalance,
        penaltyPercent,
        penaltyFee,
        totalEarlyPayoff,
        dailySchedule
      };
    };

    const flatRes = simulateSingle('FLAT');
    const effRes = simulateSingle('EFEKTIF');
    const annRes = simulateSingle('ANUITAS');

    let activeRes = effRes;
    if (method === 'FLAT') activeRes = flatRes;
    else if (method === 'ANUITAS') activeRes = annRes;

    return {
      principal: P,
      rateAnnual: rAnnual,
      days,
      convention: dayCountConvention,
      basisDays: basis,
      method,
      nMonths,
      facilityType,
      dailyRatePercent: activeRes.dailyRatePercent,
      dailyInterestAmount: activeRes.dailyInterestAmount,
      totalAccruedInterest: activeRes.totalAccruedInterest,
      remainingBalance: activeRes.remainingBalance,
      penaltyPercent,
      penaltyFee: activeRes.penaltyFee,
      totalEarlyPayoff: activeRes.totalEarlyPayoff,
      dailySchedule: activeRes.dailySchedule,
      comparison: {
        flat: flatRes,
        effective: effRes,
        annuity: annRes,
        savingsVsFlat: flatRes.totalAccruedInterest - effRes.totalAccruedInterest,
        savingsVsAnnuity: annRes.totalAccruedInterest - effRes.totalAccruedInterest
      }
    };
  },

  formatRupiah(amount) {
    if (isNaN(amount) || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount));
  },

  formatNumber(val) {
    if (isNaN(val) || val === null) return '0';
    return new Intl.NumberFormat('id-ID').format(Math.round(val));
  },

  formatPercent(rate, decimals = 2) {
    return (Number(rate) || 0).toFixed(decimals) + '%';
  },

  parseRupiah(str) {
    if (typeof str === 'number') return str;
    const cleanStr = String(str).replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  }
};
