/**
 * Main Controller Application - Vanilla JS
 */
import { FinanceMath } from './finance-math.js';
import { FinanceCharts } from './charts.js';
import { ExcelExport } from './excel-export.js';

// Application State
const state = {
  activeTab: 'tab-converter', // tab-converter | tab-schedule | tab-daily | tab-guide
  converterMode: 'flat-to-eff', // flat-to-eff | eff-to-flat
  
  // Parameter Utama Pinjaman
  principal: 100000000,
  rateAnnual: 6.0,
  nMonths: 12,
  startDate: new Date().toISOString().split('T')[0],
  dayCountConvention: 'ACTUAL_360',

  // State Tabel
  scheduleFilter: 'ALL', // ALL | ANUITAS | EFEKTIF | FLAT
  page: 1,
  pageSize: 12,
  showAllRows: false,

  // Bunga Harian
  dailyDays: 30,
  dailyPenaltyPercent: 0,

  // Hasil Kalkulasi
  results: {
    flat: null,
    effective: null,
    annuity: null,
    conversion: null,
    daily: null
  }
};

// DOM Elements
const elements = {
  // Tabs
  tabButtons: document.querySelectorAll('.nav-tab'),
  tabPanels: document.querySelectorAll('.tab-panel'),

  // Presets
  btnPresets: document.querySelectorAll('.btn-preset'),

  // Inputs Utama
  inputPrincipalText: document.getElementById('input-principal-text'),
  sliderPrincipal: document.getElementById('slider-principal'),
  inputRate: document.getElementById('input-rate'),
  sliderRate: document.getElementById('slider-rate'),
  inputTenorMonths: document.getElementById('input-tenor-months'),
  inputTenorYears: document.getElementById('input-tenor-years'),
  sliderTenor: document.getElementById('slider-tenor'),
  inputStartDate: document.getElementById('input-start-date'),
  selectConvention: document.getElementById('select-convention'),

  // Converter Elements
  btnModeFlatToEff: document.getElementById('btn-mode-flat-to-eff'),
  btnModeEffToFlat: document.getElementById('btn-mode-eff-to-flat'),
  converterTitle: document.getElementById('converter-title'),
  converterInputLabel: document.getElementById('converter-input-label'),
  convResultRateExact: document.getElementById('conv-result-rate-exact'),
  convResultRateComp: document.getElementById('conv-result-rate-comp'),
  convResultRateOjk: document.getElementById('conv-result-rate-ojk'),
  convResultPmt: document.getElementById('conv-result-pmt'),
  convResultTotalInterest: document.getElementById('conv-result-total-interest'),
  convResultTotalPay: document.getElementById('conv-result-total-pay'),
  convExplainBox: document.getElementById('conv-explain-box'),

  // Summary Cards
  kpiAnnuityPmt: document.getElementById('kpi-annuity-pmt'),
  kpiAnnuityInterest: document.getElementById('kpi-annuity-interest'),
  kpiEffPmtFirst: document.getElementById('kpi-eff-pmt-first'),
  kpiEffPmtLast: document.getElementById('kpi-eff-pmt-last'),
  kpiEffInterest: document.getElementById('kpi-eff-interest'),
  kpiFlatPmt: document.getElementById('kpi-flat-pmt'),
  kpiFlatInterest: document.getElementById('kpi-flat-interest'),
  kpiSavingsText: document.getElementById('kpi-savings-text'),

  // Table Controls
  tableFilterButtons: document.querySelectorAll('.table-filter-btn'),
  tableScheduleBody: document.getElementById('table-schedule-body'),
  tableTotalRow: document.getElementById('table-total-row'),
  tableInfoText: document.getElementById('table-info-text'),
  btnToggleAllRows: document.getElementById('btn-toggle-all-rows'),
  btnPrevPage: document.getElementById('btn-prev-page'),
  btnNextPage: document.getElementById('btn-next-page'),
  currentPageSpan: document.getElementById('current-page-span'),
  totalPagesSpan: document.getElementById('total-pages-span'),

  // Daily Simulator
  inputDailyDays: document.getElementById('input-daily-days'),
  sliderDailyDays: document.getElementById('slider-daily-days'),
  inputDailyPenalty: document.getElementById('input-daily-penalty'),
  resDailyRate: document.getElementById('res-daily-rate'),
  resDailyAmount: document.getElementById('res-daily-amount'),
  resDailyAccrued: document.getElementById('res-daily-accrued'),
  resDailyPayoff: document.getElementById('res-daily-payoff'),
  tableDailyMatrixBody: document.getElementById('table-daily-matrix-body'),

  // Action Buttons
  btnExportExcel: document.getElementById('btn-export-excel'),
  btnReset: document.getElementById('btn-reset')
};

// Initial Setup
function init() {
  if (elements.inputStartDate) {
    elements.inputStartDate.value = state.startDate;
  }
  setupEventListeners();
  recalculateAll();
  lucide.createIcons();
}

// Recalculate Everything
function recalculateAll() {
  const P = state.principal;
  const r = state.rateAnnual;
  const n = state.nMonths;
  const start = new Date(state.startDate);

  // 1. Calculate 3 Methods
  state.results.flat = FinanceMath.calculateFlat(P, r, n, start);
  state.results.effective = FinanceMath.calculateEffective(P, r, n, start);
  state.results.annuity = FinanceMath.calculateAnnuity(P, r, n, start);

  // 2. Calculate Conversion
  if (state.converterMode === 'flat-to-eff') {
    state.results.conversion = FinanceMath.convertFlatToEffective(P, r, n);
  } else {
    state.results.conversion = FinanceMath.convertEffectiveToFlat(P, r, n);
  }

  // 3. Calculate Daily
  state.results.daily = FinanceMath.calculateDailyInterest(
    P,
    r,
    state.dailyDays,
    state.dayCountConvention,
    state.dailyPenaltyPercent
  );

  // Update UI Views
  updateKPIs();
  updateConverterUI();
  updateTableSchedule();
  updateDailyUI();
  updateCharts();
}

// Update KPI Cards
function updateKPIs() {
  const { flat, effective, annuity } = state.results;

  elements.kpiAnnuityPmt.textContent = FinanceMath.formatRupiah(annuity.monthlyInstallment) + ' /bln';
  elements.kpiAnnuityInterest.textContent = FinanceMath.formatRupiah(annuity.totalInterest);

  elements.kpiEffPmtFirst.textContent = FinanceMath.formatRupiah(effective.firstInstallment);
  elements.kpiEffPmtLast.textContent = FinanceMath.formatRupiah(effective.lastInstallment);
  elements.kpiEffInterest.textContent = FinanceMath.formatRupiah(effective.totalInterest);

  elements.kpiFlatPmt.textContent = FinanceMath.formatRupiah(flat.monthlyInstallment) + ' /bln';
  elements.kpiFlatInterest.textContent = FinanceMath.formatRupiah(flat.totalInterest);

  const savings = flat.totalInterest - effective.totalInterest;
  if (savings > 0) {
    elements.kpiSavingsText.innerHTML = `Hemat bunga <strong>${FinanceMath.formatRupiah(savings)}</strong> jika memilih bunga Efektif/Anuitas dibanding Flat pada persentase sama!`;
  } else {
    elements.kpiSavingsText.textContent = `Total bunga Flat, Efektif, dan Anuitas terhitung secara transparan.`;
  }
}

// Update Converter UI
function updateConverterUI() {
  const conv = state.results.conversion;
  if (!conv) return;

  if (state.converterMode === 'flat-to-eff') {
    elements.converterTitle.textContent = 'Hasil Konversi: Bunga Flat ke Bunga Efektif & Anuitas';
    elements.convResultRateExact.textContent = conv.effectiveNominal.toFixed(2) + '% p.a.';
    elements.convResultRateComp.textContent = conv.effectiveCompounded.toFixed(2) + '% p.a.';
    elements.convResultRateOjk.textContent = conv.ojkEstimate.toFixed(2) + '% p.a.';
    elements.convResultPmt.textContent = FinanceMath.formatRupiah(conv.monthlyPayment) + ' /bln';
    elements.convResultTotalInterest.textContent = FinanceMath.formatRupiah(conv.totalInterest);
    elements.convResultTotalPay.textContent = FinanceMath.formatRupiah(conv.totalPayment);

    elements.convExplainBox.innerHTML = `
      <p class="text-sm text-slate-700 mb-2">
        Suku bunga flat <strong>${state.rateAnnual}% per tahun</strong> selama <strong>${state.nMonths} bulan</strong> menghasilkan beban cicilan yang setara dengan suku bunga efektif/anuitas bank sebesar <strong>${conv.effectiveNominal.toFixed(2)}% per tahun</strong>.
      </p>
      <div class="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
        💡 <em>Formula OJK:</em> Bunga Efektif ≈ (2 × ${state.nMonths} / ${state.nMonths + 1}) × ${state.rateAnnual}% = <strong>${conv.ojkEstimate.toFixed(2)}%</strong>. Perhitungan eksak IRR perbankan menghasilkan <strong>${conv.effectiveNominal.toFixed(2)}%</strong>.
      </div>
    `;
  } else {
    elements.converterTitle.textContent = 'Hasil Konversi: Bunga Efektif / Anuitas ke Bunga Flat Ekuivalen';
    elements.convResultRateExact.textContent = conv.flatRateFromAnnuity.toFixed(2) + '% p.a.';
    elements.convResultRateComp.textContent = conv.flatRateFromSliding.toFixed(2) + '% p.a.';
    elements.convResultRateOjk.textContent = '-';
    elements.convResultPmt.textContent = FinanceMath.formatRupiah(conv.monthlyPaymentAnnuity) + ' /bln';
    elements.convResultTotalInterest.textContent = FinanceMath.formatRupiah(conv.totalInterestAnnuity);
    elements.convResultTotalPay.textContent = FinanceMath.formatRupiah(conv.totalPaymentAnnuity);

    elements.convExplainBox.innerHTML = `
      <p class="text-sm text-slate-700 mb-2">
        Suku bunga anuitas <strong>${state.rateAnnual}% per tahun</strong> selama <strong>${state.nMonths} bulan</strong> setara dengan bunga flat <strong>${conv.flatRateFromAnnuity.toFixed(2)}% per tahun</strong> (total bunga: ${FinanceMath.formatRupiah(conv.totalInterestAnnuity)}).
      </p>
      <div class="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
        💡 Jika pinjaman menggunakan bunga efektif menurun (sliding rate) dengan cicilan pokok rata, suku bunga flat ekuivalennya adalah <strong>${conv.flatRateFromSliding.toFixed(2)}% per tahun</strong>.
      </div>
    `;
  }
}

// Update Table Schedule
function updateTableSchedule() {
  const { flat, effective, annuity } = state.results;
  const n = state.nMonths;
  const filter = state.scheduleFilter;

  const totalPages = Math.ceil(n / state.pageSize);
  if (state.page > totalPages) state.page = totalPages || 1;

  elements.currentPageSpan.textContent = state.page;
  elements.totalPagesSpan.textContent = totalPages;

  const startIndex = state.showAllRows ? 0 : (state.page - 1) * state.pageSize;
  const endIndex = state.showAllRows ? n : Math.min(n, startIndex + state.pageSize);

  let rowsHtml = '';

  for (let i = startIndex; i < endIndex; i++) {
    const annRow = annuity.schedule[i];
    const effRow = effective.schedule[i];
    const flatRow = flat.schedule[i];

    rowsHtml += `
      <tr class="table-hover-row border-b border-slate-200 text-xs md:text-sm">
        <td class="px-3 py-2.5 font-bold text-slate-900 text-center bg-slate-50">${annRow.month}</td>
        <td class="px-3 py-2.5 text-slate-600">${annRow.dueDate}</td>
    `;

    if (filter === 'ALL' || filter === 'ANUITAS') {
      rowsHtml += `
        <td class="px-3 py-2.5 text-right font-medium text-slate-700">${FinanceMath.formatNumber(annRow.initialBalance)}</td>
        <td class="px-3 py-2.5 text-right text-blue-700 font-medium">${FinanceMath.formatNumber(annRow.principal)}</td>
        <td class="px-3 py-2.5 text-right text-rose-600">${FinanceMath.formatNumber(annRow.interest)}</td>
        <td class="px-3 py-2.5 text-right font-bold text-slate-900 bg-blue-50/40">${FinanceMath.formatNumber(annRow.totalInstallment)}</td>
        <td class="px-3 py-2.5 text-right text-slate-600">${FinanceMath.formatNumber(annRow.remainingBalance)}</td>
      `;
    }

    if (filter === 'ALL' || filter === 'EFEKTIF') {
      rowsHtml += `
        <td class="px-3 py-2.5 text-right font-medium text-emerald-800 bg-emerald-50/20">${FinanceMath.formatNumber(effRow.principal)}</td>
        <td class="px-3 py-2.5 text-right text-rose-600 bg-emerald-50/20">${FinanceMath.formatNumber(effRow.interest)}</td>
        <td class="px-3 py-2.5 text-right font-bold text-emerald-900 bg-emerald-100/40">${FinanceMath.formatNumber(effRow.totalInstallment)}</td>
      `;
    }

    if (filter === 'ALL' || filter === 'FLAT') {
      rowsHtml += `
        <td class="px-3 py-2.5 text-right font-medium text-amber-800 bg-amber-50/20">${FinanceMath.formatNumber(flatRow.principal)}</td>
        <td class="px-3 py-2.5 text-right text-rose-600 bg-amber-50/20">${FinanceMath.formatNumber(flatRow.interest)}</td>
        <td class="px-3 py-2.5 text-right font-bold text-amber-900 bg-amber-100/40">${FinanceMath.formatNumber(flatRow.totalInstallment)}</td>
      `;
    }

    rowsHtml += `</tr>`;
  }

  elements.tableScheduleBody.innerHTML = rowsHtml;

  // Render Total Row
  let totalHtml = `
    <tr class="bg-slate-900 text-white font-bold text-xs md:text-sm">
      <td class="px-3 py-3 text-center" colspan="2">TOTAL KESELURUHAN</td>
  `;

  if (filter === 'ALL' || filter === 'ANUITAS') {
    totalHtml += `
      <td class="px-3 py-3 text-right text-slate-300">-</td>
      <td class="px-3 py-3 text-right text-blue-300">${FinanceMath.formatNumber(annuity.principal)}</td>
      <td class="px-3 py-3 text-right text-rose-300">${FinanceMath.formatNumber(annuity.totalInterest)}</td>
      <td class="px-3 py-3 text-right text-yellow-300">${FinanceMath.formatNumber(annuity.totalPayment)}</td>
      <td class="px-3 py-3 text-right text-slate-300">0</td>
    `;
  }

  if (filter === 'ALL' || filter === 'EFEKTIF') {
    totalHtml += `
      <td class="px-3 py-3 text-right text-emerald-300">${FinanceMath.formatNumber(effective.principal)}</td>
      <td class="px-3 py-3 text-right text-rose-300">${FinanceMath.formatNumber(effective.totalInterest)}</td>
      <td class="px-3 py-3 text-right text-emerald-300">${FinanceMath.formatNumber(effective.totalPayment)}</td>
    `;
  }

  if (filter === 'ALL' || filter === 'FLAT') {
    totalHtml += `
      <td class="px-3 py-3 text-right text-amber-300">${FinanceMath.formatNumber(flat.principal)}</td>
      <td class="px-3 py-3 text-right text-rose-300">${FinanceMath.formatNumber(flat.totalInterest)}</td>
      <td class="px-3 py-3 text-right text-amber-300">${FinanceMath.formatNumber(flat.totalPayment)}</td>
    `;
  }

  totalHtml += `</tr>`;
  elements.tableTotalRow.innerHTML = totalHtml;

  elements.tableInfoText.textContent = `Menampilkan bulan ${startIndex + 1} - ${endIndex} dari total ${n} bulan`;
}

// Update Daily UI
function updateDailyUI() {
  const d = state.results.daily;
  if (!d) return;

  elements.resDailyRate.textContent = d.dailyRatePercent.toFixed(6) + '% /hari';
  elements.resDailyAmount.textContent = FinanceMath.formatRupiah(d.dailyInterestAmount) + ' /hari';
  elements.resDailyAccrued.textContent = FinanceMath.formatRupiah(d.totalAccruedInterest);
  elements.resDailyPayoff.textContent = FinanceMath.formatRupiah(d.totalEarlyPayoff);

  // Matrix Sample Days
  const samplePeriods = [1, 7, 14, 30, 45, 60, 90, 120, 180, 270, 360];
  let matrixHtml = '';

  samplePeriods.forEach(days => {
    const interest = d.dailyInterestAmount * days;
    const total = d.principal + interest;
    matrixHtml += `
      <tr class="border-b border-slate-200 hover:bg-slate-50 text-xs md:text-sm">
        <td class="px-4 py-2 font-medium text-slate-800">${days} Hari</td>
        <td class="px-4 py-2 text-right text-rose-600 font-medium">${FinanceMath.formatRupiah(interest)}</td>
        <td class="px-4 py-2 text-right text-slate-600">${FinanceMath.formatRupiah(d.principal)}</td>
        <td class="px-4 py-2 text-right font-bold text-blue-900 bg-blue-50/50">${FinanceMath.formatRupiah(total)}</td>
      </tr>
    `;
  });

  elements.tableDailyMatrixBody.innerHTML = matrixHtml;
}

// Update Charts
function updateCharts() {
  const { flat, effective, annuity } = state.results;
  FinanceCharts.renderComparisonChart('chart-comparison', flat, effective, annuity);
  FinanceCharts.renderAmortizationCurveChart('chart-curve', flat, effective, annuity);
}

// Event Listeners
function setupEventListeners() {
  // Tabs Navigation
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      state.activeTab = targetTab;

      elements.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      elements.tabPanels.forEach(panel => {
        if (panel.id === targetTab) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });

      if (targetTab === 'tab-schedule') {
        setTimeout(() => updateCharts(), 50);
      }
    });
  });

  // Converter Mode Buttons
  elements.btnModeFlatToEff.addEventListener('click', () => {
    state.converterMode = 'flat-to-eff';
    elements.btnModeFlatToEff.className = 'px-4 py-2 rounded-md font-semibold text-sm bg-blue-600 text-white shadow-sm';
    elements.btnModeEffToFlat.className = 'px-4 py-2 rounded-md font-medium text-sm text-slate-600 hover:text-slate-900';
    elements.converterInputLabel.textContent = 'Suku Bunga Flat (% per tahun)';
    recalculateAll();
  });

  elements.btnModeEffToFlat.addEventListener('click', () => {
    state.converterMode = 'eff-to-flat';
    elements.btnModeEffToFlat.className = 'px-4 py-2 rounded-md font-semibold text-sm bg-blue-600 text-white shadow-sm';
    elements.btnModeFlatToEff.className = 'px-4 py-2 rounded-md font-medium text-sm text-slate-600 hover:text-slate-900';
    elements.converterInputLabel.textContent = 'Suku Bunga Efektif/Anuitas (% per tahun)';
    recalculateAll();
  });

  // Presets
  elements.btnPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = Number(btn.getAttribute('data-p'));
      const r = Number(btn.getAttribute('data-r'));
      const n = Number(btn.getAttribute('data-n'));

      state.principal = p;
      state.rateAnnual = r;
      state.nMonths = n;

      // Sync inputs
      elements.inputPrincipalText.value = FinanceMath.formatRupiah(p);
      elements.sliderPrincipal.value = p;
      elements.inputRate.value = r;
      elements.sliderRate.value = r;
      elements.inputTenorMonths.value = n;
      elements.inputTenorYears.value = (n / 12).toFixed(1);
      elements.sliderTenor.value = n;

      recalculateAll();
    });
  });

  // Principal Input & Slider
  elements.inputPrincipalText.addEventListener('input', (e) => {
    const val = FinanceMath.parseRupiah(e.target.value);
    state.principal = val;
    elements.sliderPrincipal.value = Math.min(val, 5000000000);
    recalculateAll();
  });

  elements.inputPrincipalText.addEventListener('blur', () => {
    elements.inputPrincipalText.value = FinanceMath.formatRupiah(state.principal);
  });

  elements.sliderPrincipal.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.principal = val;
    elements.inputPrincipalText.value = FinanceMath.formatRupiah(val);
    recalculateAll();
  });

  // Suku Bunga Input & Slider
  elements.inputRate.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value) || 0;
    val = Math.max(0.1, Math.min(60, val));
    state.rateAnnual = val;
    elements.sliderRate.value = val;
    recalculateAll();
  });

  elements.sliderRate.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.rateAnnual = val;
    elements.inputRate.value = val;
    recalculateAll();
  });

  // Tenor Months, Years & Slider
  elements.inputTenorMonths.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.max(1, Math.min(360, val));
    state.nMonths = val;
    elements.inputTenorYears.value = (val / 12).toFixed(1);
    elements.sliderTenor.value = val;
    state.page = 1;
    recalculateAll();
  });

  elements.inputTenorYears.addEventListener('input', (e) => {
    let valYears = parseFloat(e.target.value) || 1;
    valYears = Math.max(0.1, Math.min(30, valYears));
    const valMonths = Math.round(valYears * 12);
    state.nMonths = valMonths;
    elements.inputTenorMonths.value = valMonths;
    elements.sliderTenor.value = valMonths;
    state.page = 1;
    recalculateAll();
  });

  elements.sliderTenor.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.nMonths = val;
    elements.inputTenorMonths.value = val;
    elements.inputTenorYears.value = (val / 12).toFixed(1);
    state.page = 1;
    recalculateAll();
  });

  // Start Date
  elements.inputStartDate.addEventListener('change', (e) => {
    state.startDate = e.target.value;
    recalculateAll();
  });

  // Day Convention
  elements.selectConvention.addEventListener('change', (e) => {
    state.dayCountConvention = e.target.value;
    recalculateAll();
  });

  // Daily Simulator Inputs
  elements.inputDailyDays.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    val = Math.max(1, Math.min(3650, val));
    state.dailyDays = val;
    elements.sliderDailyDays.value = Math.min(val, 365);
    recalculateAll();
  });

  elements.sliderDailyDays.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.dailyDays = val;
    elements.inputDailyDays.value = val;
    recalculateAll();
  });

  elements.inputDailyPenalty.addEventListener('input', (e) => {
    state.dailyPenaltyPercent = parseFloat(e.target.value) || 0;
    recalculateAll();
  });

  // Table Filter Buttons
  elements.tableFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tableFilterButtons.forEach(b => {
        b.className = 'table-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
      });
      btn.className = 'table-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm';
      state.scheduleFilter = btn.getAttribute('data-filter');
      updateTableSchedule();
    });
  });

  // Pagination Controls
  elements.btnPrevPage.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      updateTableSchedule();
    }
  });

  elements.btnNextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(state.nMonths / state.pageSize);
    if (state.page < totalPages) {
      state.page++;
      updateTableSchedule();
    }
  });

  elements.btnToggleAllRows.addEventListener('click', () => {
    state.showAllRows = !state.showAllRows;
    elements.btnToggleAllRows.textContent = state.showAllRows ? 'Batasi Tampilan Per Halaman' : 'Tampilkan Seluruh Bulan Sekaligus';
    updateTableSchedule();
  });

  // Export Excel
  elements.btnExportExcel.addEventListener('click', () => {
    ExcelExport.exportAmortizationWorkbook({
      flatData: state.results.flat,
      effData: state.results.effective,
      annData: state.results.annuity,
      dailyData: state.results.daily,
      params: {
        principal: state.principal,
        rateAnnual: state.rateAnnual,
        nMonths: state.nMonths,
        startDate: state.startDate,
        dayCountConvention: state.dayCountConvention
      }
    });
  });

  // Reset
  elements.btnReset.addEventListener('click', () => {
    state.principal = 100000000;
    state.rateAnnual = 6.0;
    state.nMonths = 12;
    state.converterMode = 'flat-to-eff';
    state.page = 1;

    elements.inputPrincipalText.value = FinanceMath.formatRupiah(state.principal);
    elements.sliderPrincipal.value = state.principal;
    elements.inputRate.value = state.rateAnnual;
    elements.sliderRate.value = state.rateAnnual;
    elements.inputTenorMonths.value = state.nMonths;
    elements.inputTenorYears.value = (state.nMonths / 12).toFixed(1);
    elements.sliderTenor.value = state.nMonths;

    recalculateAll();
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
