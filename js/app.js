/**
 * Main Controller Application - Vanilla JS
 * Menghubungkan UI Desain B, Engine Matematika Finansial & ExcelJS
 */
import { FinanceMath } from './finance-math.js';
import { FinanceCharts } from './charts.js';
import { ExcelExport } from './excel-export.js';

// Application State
const state = {
  activeTab: 'tab-comparison', // tab-comparison | tab-schedule | tab-daily | tab-guide
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

  // State Bunga Harian
  dailyMethod: 'EFEKTIF', // EFEKTIF | FLAT | ANUITAS
  dailyFacilityType: 'AMORTIZING', // AMORTIZING | REKENING_KORAN
  dailyDays: 360,
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

  // Desain B: Highlight Cards
  headerRateDisplay: document.getElementById('header-rate-display'),
  cardEffPmtFirst: document.getElementById('card-eff-pmt-first'),
  cardEffPmtLast: document.getElementById('card-eff-pmt-last'),
  cardEffInterest: document.getElementById('card-eff-interest'),
  cardEffTotalPay: document.getElementById('card-eff-total-pay'),

  cardAnnPmt: document.getElementById('card-ann-pmt'),
  cardAnnInterest: document.getElementById('card-ann-interest'),
  cardAnnTotalPay: document.getElementById('card-ann-total-pay'),
  cardAnnDiff: document.getElementById('card-ann-diff'),

  cardFlatPmt: document.getElementById('card-flat-pmt'),
  cardFlatInterest: document.getElementById('card-flat-interest'),
  cardFlatTotalPay: document.getElementById('card-flat-total-pay'),
  cardFlatDiff: document.getElementById('card-flat-diff'),

  // Savings Banner
  bannerSavingsHeadline: document.getElementById('banner-savings-headline'),
  bannerSavingsBadge: document.getElementById('banner-savings-badge'),
  bannerSavingsDesc: document.getElementById('banner-savings-desc'),

  // Matrix Table
  matrixComparisonTbody: document.getElementById('matrix-comparison-tbody'),

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
  dailyFacilityButtons: document.querySelectorAll('.daily-facility-btn'),
  facilityDescText: document.getElementById('facility-desc-text'),
  dailyMethodButtons: document.querySelectorAll('.daily-method-btn'),
  inputDailyDays: document.getElementById('input-daily-days'),
  sliderDailyDays: document.getElementById('slider-daily-days'),
  dailyChips: document.querySelectorAll('.btn-daily-chip'),
  inputDailyPenalty: document.getElementById('input-daily-penalty'),
  labelTenorEquiv: document.getElementById('label-tenor-equiv'),
  resDailyRate: document.getElementById('res-daily-rate'),
  resDailyRateSub: document.getElementById('res-daily-rate-sub'),
  resDailyAmount: document.getElementById('res-daily-amount'),
  resDailyAmountSub: document.getElementById('res-daily-amount-sub'),
  resDailyAccrued: document.getElementById('res-daily-accrued'),
  resDailyAccruedSub: document.getElementById('res-daily-accrued-sub'),
  resDailyPayoff: document.getElementById('res-daily-payoff'),
  resDailyPayoffSub: document.getElementById('res-daily-payoff-sub'),
  dailyCompDayNum: document.getElementById('daily-comp-day-num'),
  dailyCompSavingsTag: document.getElementById('daily-comp-savings-tag'),
  dailyHeadToHeadTbody: document.getElementById('daily-head-to-head-tbody'),
  dailyHeadToHeadNote: document.getElementById('daily-head-to-head-note'),
  tableDailyScheduleBody: document.getElementById('table-daily-schedule-body'),
  dailyTableCountLabel: document.getElementById('daily-table-count-label'),
  btnQuickExportDaily: document.getElementById('btn-quick-export-daily'),
  btnQuickExportDailyText: document.getElementById('btn-quick-export-daily-text'),

  // Dropdown Export
  btnExportDropdownToggle: document.getElementById('btn-export-dropdown-toggle'),
  exportMenuDropdown: document.getElementById('export-menu-dropdown'),
  btnDoExports: document.querySelectorAll('.btn-do-export'),
  btnReset: document.getElementById('btn-reset')
};

// Initial Setup
function init() {
  if (elements.inputStartDate) {
    elements.inputStartDate.value = state.startDate;
  }
  setupEventListeners();
  recalculateAll();
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
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

  // 3. Calculate Daily dengan nMonths dan facilityType akurat
  state.results.daily = FinanceMath.calculateDailyInterest(
    P,
    r,
    state.dailyDays,
    state.dayCountConvention,
    state.dailyPenaltyPercent,
    state.dailyMethod,
    start,
    state.nMonths,
    state.dailyFacilityType
  );

  // Update UI Views
  updateDesainBViews();
  updateConverterUI();
  updateTableSchedule();
  updateDailyUI();
  updateCharts();
}

// Update Desain B UI Views
function updateDesainBViews() {
  const { flat, effective, annuity } = state.results;
  const P = state.principal;
  const n = state.nMonths;
  const r = state.rateAnnual;

  // Header status
  if (elements.headerRateDisplay) {
    elements.headerRateDisplay.textContent = `${r}% p.a. • ${n} Bulan (${(n / 12).toFixed(1)} Thn)`;
  }

  // Card 1: Efektif
  if (elements.cardEffPmtFirst) {
    elements.cardEffPmtFirst.textContent = FinanceMath.formatRupiah(effective.firstInstallment);
    elements.cardEffPmtLast.textContent = FinanceMath.formatRupiah(effective.lastInstallment);
    elements.cardEffInterest.textContent = FinanceMath.formatRupiah(effective.totalInterest);
    elements.cardEffTotalPay.textContent = FinanceMath.formatRupiah(effective.totalPayment);
  }

  // Card 2: Anuitas
  if (elements.cardAnnPmt) {
    elements.cardAnnPmt.textContent = FinanceMath.formatRupiah(annuity.monthlyInstallment) + ' /bln';
    elements.cardAnnInterest.textContent = FinanceMath.formatRupiah(annuity.totalInterest);
    elements.cardAnnTotalPay.textContent = FinanceMath.formatRupiah(annuity.totalPayment);
    const annDiff = annuity.totalInterest - effective.totalInterest;
    elements.cardAnnDiff.textContent = annDiff >= 0 
      ? `+${FinanceMath.formatRupiah(annDiff)}` 
      : `-${FinanceMath.formatRupiah(Math.abs(annDiff))}`;
  }

  // Card 3: Flat
  if (elements.cardFlatPmt) {
    elements.cardFlatPmt.textContent = FinanceMath.formatRupiah(flat.monthlyInstallment) + ' /bln';
    elements.cardFlatInterest.textContent = FinanceMath.formatRupiah(flat.totalInterest);
    elements.cardFlatTotalPay.textContent = FinanceMath.formatRupiah(flat.totalPayment);
    const flatDiff = flat.totalInterest - effective.totalInterest;
    elements.cardFlatDiff.textContent = `+${FinanceMath.formatRupiah(flatDiff)} (Boros)`;
  }

  // Savings Banner
  const savings = Math.round(flat.totalInterest - effective.totalInterest);
  const savingsPercent = ((savings / flat.totalInterest) * 100).toFixed(1);

  if (elements.bannerSavingsHeadline) {
    elements.bannerSavingsHeadline.textContent = `Hemat ${FinanceMath.formatRupiah(savings)} (${savingsPercent}%) dengan Bunga Efektif!`;
    elements.bannerSavingsBadge.textContent = `Total Selisih: ${FinanceMath.formatRupiah(savings)}`;
    elements.bannerSavingsDesc.innerHTML = `
      Jika nasabah meminjam <strong>${FinanceMath.formatRupiah(P)}</strong> selama <strong>${n} bulan</strong> pada suku bunga <strong>${r}% p.a.</strong>:<br>
      • Pada <strong>Bunga Efektif</strong>, total bunga yang dibayar hanya <strong>${FinanceMath.formatRupiah(effective.totalInterest)}</strong>.<br>
      • Pada <strong>Bunga Flat</strong>, total bunga melonjak menjadi <strong>${FinanceMath.formatRupiah(flat.totalInterest)}</strong>.<br>
      💡 Memilih skema Bunga Efektif secara cerdas menghemat pengeluaran bunga hingga <strong>${savingsPercent}%</strong>!
    `;
  }

  // Matrix Table
  if (elements.matrixComparisonTbody) {
    elements.matrixComparisonTbody.innerHTML = `
      <tr class="border-b border-slate-200 hover:bg-emerald-50/40 font-medium">
        <td class="px-4 py-3 font-bold text-emerald-900 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
          Bunga Efektif (Sliding)
        </td>
        <td class="px-4 py-3 text-right">${r}%</td>
        <td class="px-4 py-3 text-right">${FinanceMath.formatNumber(effective.firstInstallment)}</td>
        <td class="px-4 py-3 text-right text-emerald-800 font-semibold">${FinanceMath.formatNumber(effective.lastInstallment)}</td>
        <td class="px-4 py-3 text-right text-emerald-700 font-bold">${FinanceMath.formatNumber(effective.totalInterest)}</td>
        <td class="px-4 py-3 text-right font-bold text-slate-900">${FinanceMath.formatNumber(effective.totalPayment)}</td>
        <td class="px-4 py-3 text-right text-emerald-700 font-bold">Rp 0 (Referensi Paling Hemat)</td>
      </tr>
      <tr class="border-b border-slate-200 hover:bg-indigo-50/40">
        <td class="px-4 py-3 font-bold text-indigo-900 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
          Bunga Anuitas (Cicilan Rata)
        </td>
        <td class="px-4 py-3 text-right">${r}%</td>
        <td class="px-4 py-3 text-right">${FinanceMath.formatNumber(annuity.monthlyInstallment)}</td>
        <td class="px-4 py-3 text-right">${FinanceMath.formatNumber(annuity.monthlyInstallment)}</td>
        <td class="px-4 py-3 text-right text-indigo-700 font-bold">${FinanceMath.formatNumber(annuity.totalInterest)}</td>
        <td class="px-4 py-3 text-right font-bold text-slate-900">${FinanceMath.formatNumber(annuity.totalPayment)}</td>
        <td class="px-4 py-3 text-right text-indigo-800 font-semibold">+${FinanceMath.formatRupiah(annuity.totalInterest - effective.totalInterest)}</td>
      </tr>
      <tr class="border-b border-slate-200 hover:bg-amber-50/40">
        <td class="px-4 py-3 font-bold text-amber-900 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-600"></span>
          Bunga Flat (Tetap)
        </td>
        <td class="px-4 py-3 text-right">${r}%</td>
        <td class="px-4 py-3 text-right">${FinanceMath.formatNumber(flat.monthlyInstallment)}</td>
        <td class="px-4 py-3 text-right">${FinanceMath.formatNumber(flat.monthlyInstallment)}</td>
        <td class="px-4 py-3 text-right text-rose-600 font-bold">${FinanceMath.formatNumber(flat.totalInterest)}</td>
        <td class="px-4 py-3 text-right font-bold text-slate-900">${FinanceMath.formatNumber(flat.totalPayment)}</td>
        <td class="px-4 py-3 text-right text-rose-600 font-extrabold">+${FinanceMath.formatRupiah(flat.totalInterest - effective.totalInterest)} (Tertinggi)</td>
      </tr>
    `;
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

  const comp = d.comparison || {};
  const activeMethod = state.dailyMethod;
  const isAmortizing = state.dailyFacilityType === 'AMORTIZING';

  // Label tenor ekuivalen
  if (elements.labelTenorEquiv) {
    const blnEquiv = (d.days / 30).toFixed(1);
    elements.labelTenorEquiv.textContent = `${d.days} Hari (~${blnEquiv} Bulan)`;
  }

  // Facility buttons styling
  if (elements.dailyFacilityButtons) {
    elements.dailyFacilityButtons.forEach(btn => {
      const f = btn.getAttribute('data-facility');
      if (f === state.dailyFacilityType) {
        btn.className = 'daily-facility-btn active p-3 rounded-xl border text-left flex items-center gap-3 transition bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20';
      } else {
        btn.className = 'daily-facility-btn p-3 rounded-xl border text-left flex items-center gap-3 transition bg-white border-slate-200 text-slate-700 hover:border-slate-300';
      }
    });
  }

  if (elements.facilityDescText) {
    elements.facilityDescText.textContent = isAmortizing 
      ? `Kredit angsuran berjangka ${state.nMonths} bulan (baki debet berkurang tiap bulan)` 
      : 'Fasilitas Rekening Koran (PRK) / Cerukan (pokok konstan, bunga harian efektif)';
  }

  // Suku bunga per hari
  elements.resDailyRate.textContent = d.dailyRatePercent.toFixed(6) + '% /hari';
  if (elements.resDailyRateSub) {
    elements.resDailyRateSub.textContent = activeMethod === 'FLAT' 
      ? `Rate nominal flat (Riil: ~${((state.rateAnnual * (2 * state.nMonths) / (state.nMonths + 1)) / d.basisDays).toFixed(4)}% /hari)` 
      : `Rate acuan: ${state.rateAnnual}% p.a. / ${d.basisDays} hari`;
  }

  // Bunga hari ini
  elements.resDailyAmount.textContent = FinanceMath.formatRupiah(d.dailyInterestAmount) + ' /hari';
  if (elements.resDailyAmountSub) {
    elements.resDailyAmountSub.textContent = isAmortizing 
      ? `Beban bunga pada hari ke-${d.days} (${activeMethod})` 
      : `Beban 24 jam saldo Rp ${FinanceMath.formatNumber(d.principal)}`;
  }

  // Akumulasi bunga s.d. hari ini
  elements.resDailyAccrued.textContent = FinanceMath.formatRupiah(d.totalAccruedInterest);
  elements.resDailyAccruedSub.textContent = `Total bunga ${d.days} hari (${activeMethod})`;

  // Total pelunasan
  elements.resDailyPayoff.textContent = FinanceMath.formatRupiah(d.totalEarlyPayoff);
  if (elements.resDailyPayoffSub) {
    elements.resDailyPayoffSub.textContent = `Sisa Pokok (${FinanceMath.formatRupiah(d.remainingBalance)}) + Bunga + Penalti`;
  }

  // Update button label
  if (elements.btnQuickExportDailyText) {
    elements.btnQuickExportDailyText.textContent = `Unduh Excel Bunga Harian (${activeMethod})`;
  }

  // Update Daily Method Buttons Styling
  elements.dailyMethodButtons.forEach(btn => {
    const m = btn.getAttribute('data-daily-method');
    if (m === state.dailyMethod) {
      if (m === 'EFEKTIF') {
        btn.className = 'daily-method-btn active p-3 rounded-xl border text-left flex items-start gap-3 transition bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
      } else if (m === 'ANUITAS') {
        btn.className = 'daily-method-btn active p-3 rounded-xl border text-left flex items-start gap-3 transition bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20';
      } else {
        btn.className = 'daily-method-btn active p-3 rounded-xl border text-left flex items-start gap-3 transition bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20';
      }
    } else {
      btn.className = 'daily-method-btn p-3 rounded-xl border text-left flex items-start gap-3 transition bg-white border-slate-200 text-slate-700 hover:border-slate-300';
    }
  });

  // Render Head-to-Head Comparison on Day D
  if (elements.dailyCompDayNum) elements.dailyCompDayNum.textContent = d.days;

  if (comp.flat && comp.effective && comp.annuity && elements.dailyHeadToHeadTbody) {
    const savings = Math.round(comp.savingsVsFlat);
    if (elements.dailyCompSavingsTag) {
      elements.dailyCompSavingsTag.textContent = savings > 0 
        ? `⭐ Hemat ${FinanceMath.formatRupiah(savings)} dengan Efektif` 
        : 'Beban Bunga Sama di Awal Pinjaman';
    }

    elements.dailyHeadToHeadTbody.innerHTML = `
      <tr class="hover:bg-slate-800/60 ${activeMethod === 'EFEKTIF' ? 'bg-emerald-950/40 text-emerald-200 font-bold' : ''}">
        <td class="px-3 py-2.5 flex items-center gap-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          Bunga Efektif (Sliding)
        </td>
        <td class="px-3 py-2.5 text-right font-medium">${FinanceMath.formatRupiah(comp.effective.dailyInterestAmount)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-emerald-300">${FinanceMath.formatRupiah(comp.effective.totalAccruedInterest)}</td>
        <td class="px-3 py-2.5 text-right">${FinanceMath.formatRupiah(comp.effective.remainingBalance)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-white">${FinanceMath.formatRupiah(comp.effective.totalEarlyPayoff)}</td>
        <td class="px-3 py-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ⭐ Paling Hemat
          </span>
        </td>
      </tr>
      <tr class="hover:bg-slate-800/60 ${activeMethod === 'ANUITAS' ? 'bg-indigo-950/40 text-indigo-200 font-bold' : ''}">
        <td class="px-3 py-2.5 flex items-center gap-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          Bunga Anuitas (Cicilan Rata)
        </td>
        <td class="px-3 py-2.5 text-right font-medium">${FinanceMath.formatRupiah(comp.annuity.dailyInterestAmount)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-indigo-300">${FinanceMath.formatRupiah(comp.annuity.totalAccruedInterest)}</td>
        <td class="px-3 py-2.5 text-right">${FinanceMath.formatRupiah(comp.annuity.remainingBalance)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-white">${FinanceMath.formatRupiah(comp.annuity.totalEarlyPayoff)}</td>
        <td class="px-3 py-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ⚖️ Teratur (KPR)
          </span>
        </td>
      </tr>
      <tr class="hover:bg-slate-800/60 ${activeMethod === 'FLAT' ? 'bg-amber-950/40 text-amber-200 font-bold' : ''}">
        <td class="px-3 py-2.5 flex items-center gap-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          Bunga Flat (Tetap)
        </td>
        <td class="px-3 py-2.5 text-right font-medium">${FinanceMath.formatRupiah(comp.flat.dailyInterestAmount)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-rose-300">${FinanceMath.formatRupiah(comp.flat.totalAccruedInterest)}</td>
        <td class="px-3 py-2.5 text-right">${FinanceMath.formatRupiah(comp.flat.remainingBalance)}</td>
        <td class="px-3 py-2.5 text-right font-extrabold text-white">${FinanceMath.formatRupiah(comp.flat.totalEarlyPayoff)}</td>
        <td class="px-3 py-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ⚠️ Tertinggi
          </span>
        </td>
      </tr>
    `;

    if (elements.dailyHeadToHeadNote) {
      if (!isAmortizing) {
        elements.dailyHeadToHeadNote.innerHTML = `💡 <strong>Mode Rekening Koran (PRK):</strong> Saldo pokok pinjaman tetap utuh Rp ${FinanceMath.formatNumber(d.principal)} (tidak dicicil bulanan), sehingga beban bunga harian dihitung konstan atas penarikan pokok.`;
      } else if (d.days <= 30) {
        elements.dailyHeadToHeadNote.innerHTML = `ℹ️ <strong>Catatan Bulan ke-1 (Hari 1–30):</strong> Pada 30 hari pertama (sebelum cicilan bulan ke-1 dibayarkan), baki debet ketiga metode masih sama-sama 100% utuh (${FinanceMath.formatRupiah(d.principal)}). Geser durasi ke <strong>90, 180, atau 360 hari</strong> untuk melihat penurunan drastis bunga Efektif & Anuitas!`;
      } else {
        elements.dailyHeadToHeadNote.innerHTML = `💡 <strong>Analisis Penghematan (Hari ke-${d.days}):</strong> Karena pokok pinjaman dicicil tiap bulan, baki debet Efektif & Anuitas terus menyusut. Anda <strong>MENGHEMAT ${FinanceMath.formatRupiah(savings)}</strong> dengan Bunga Efektif dibanding Bunga Flat!`;
      }
    }
  }

  // Render Day-by-Day Schedule Table
  if (elements.tableDailyScheduleBody && d.dailySchedule) {
    elements.dailyTableCountLabel.textContent = `Menampilkan ${d.dailySchedule.length} hari proyeksi (${activeMethod})`;
    let scheduleHtml = '';
    d.dailySchedule.forEach(item => {
      scheduleHtml += `
        <tr class="border-b border-slate-200 hover:bg-slate-50 text-xs md:text-sm">
          <td class="px-4 py-2 text-center font-bold text-slate-900 bg-slate-50">${item.day}</td>
          <td class="px-4 py-2 text-slate-600">${item.date}</td>
          <td class="px-4 py-2 text-right font-medium text-slate-700">${FinanceMath.formatRupiah(item.balance)}</td>
          <td class="px-4 py-2 text-right font-mono text-[11px] text-slate-500">${item.dailyRatePercent.toFixed(6)}%</td>
          <td class="px-4 py-2 text-right text-rose-600 font-medium">${FinanceMath.formatRupiah(item.dailyInterest)}</td>
          <td class="px-4 py-2 text-right text-amber-800 font-bold">${FinanceMath.formatRupiah(item.accruedInterest)}</td>
          <td class="px-4 py-2 text-right font-extrabold text-emerald-950 bg-emerald-50/50">${FinanceMath.formatRupiah(item.payoff)}</td>
        </tr>
      `;
    });
    elements.tableDailyScheduleBody.innerHTML = scheduleHtml;
  }
}

// Update Charts
function updateCharts() {
  const { flat, effective, annuity } = state.results;
  FinanceCharts.renderComparisonChart('chart-comparison', flat, effective, annuity);
  FinanceCharts.renderAmortizationCurveChart('chart-curve', flat, effective, annuity);
}

// Export Trigger Helper
function triggerExcelExport(mode = 'ALL') {
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
    },
    exportMode: mode
  });
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
    elements.btnModeFlatToEff.className = 'px-4 py-2 rounded-md font-semibold text-xs sm:text-sm bg-blue-600 text-white shadow-sm';
    elements.btnModeEffToFlat.className = 'px-4 py-2 rounded-md font-medium text-xs sm:text-sm text-slate-600 hover:text-slate-900';
    elements.converterInputLabel.textContent = 'Suku Bunga Flat (% per tahun)';
    recalculateAll();
  });

  elements.btnModeEffToFlat.addEventListener('click', () => {
    state.converterMode = 'eff-to-flat';
    elements.btnModeEffToFlat.className = 'px-4 py-2 rounded-md font-semibold text-xs sm:text-sm bg-blue-600 text-white shadow-sm';
    elements.btnModeFlatToEff.className = 'px-4 py-2 rounded-md font-medium text-xs sm:text-sm text-slate-600 hover:text-slate-900';
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
    elements.sliderPrincipal.value = Math.min(val, 2000000000);
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

  // Facility Type Buttons (Amortizing vs Rekening Koran)
  if (elements.dailyFacilityButtons) {
    elements.dailyFacilityButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        state.dailyFacilityType = btn.getAttribute('data-facility');
        recalculateAll();
      });
    });
  }

  // Facility Type Buttons (Amortizing vs Rekening Koran)
  if (elements.dailyFacilityButtons) {
    elements.dailyFacilityButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        state.dailyFacilityType = btn.getAttribute('data-facility');
        recalculateAll();
      });
    });
  }

  // Daily Method Buttons
  elements.dailyMethodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.dailyMethod = btn.getAttribute('data-daily-method');
      recalculateAll();
    });
  });

  // Daily Chips
  elements.dailyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const d = parseInt(chip.getAttribute('data-days'), 10);
      state.dailyDays = d;
      elements.inputDailyDays.value = d;
      elements.sliderDailyDays.value = Math.min(d, 365);
      recalculateAll();
    });
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

  // Quick Export Daily Button
  if (elements.btnQuickExportDaily) {
    elements.btnQuickExportDaily.addEventListener('click', () => {
      const modeMap = {
        'EFEKTIF': 'DAILY_EFEKTIF',
        'FLAT': 'DAILY_FLAT',
        'ANUITAS': 'DAILY_ANUITAS'
      };
      triggerExcelExport(modeMap[state.dailyMethod] || 'DAILY_EFEKTIF');
    });
  }

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

  // Dropdown Export Toggle
  if (elements.btnExportDropdownToggle && elements.exportMenuDropdown) {
    elements.btnExportDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.exportMenuDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!elements.exportMenuDropdown.contains(e.target) && e.target !== elements.btnExportDropdownToggle) {
        elements.exportMenuDropdown.classList.add('hidden');
      }
    });

    elements.btnDoExports.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-export-mode') || 'ALL';
        elements.exportMenuDropdown.classList.add('hidden');
        triggerExcelExport(mode);
      });
    });
  }

  // Reset
  elements.btnReset.addEventListener('click', () => {
    state.principal = 100000000;
    state.rateAnnual = 6.0;
    state.nMonths = 12;
    state.converterMode = 'flat-to-eff';
    state.page = 1;
    state.dailyDays = 30;
    state.dailyMethod = 'EFEKTIF';

    elements.inputPrincipalText.value = FinanceMath.formatRupiah(state.principal);
    elements.sliderPrincipal.value = state.principal;
    elements.inputRate.value = state.rateAnnual;
    elements.sliderRate.value = state.rateAnnual;
    elements.inputTenorMonths.value = state.nMonths;
    elements.inputTenorYears.value = (state.nMonths / 12).toFixed(1);
    elements.sliderTenor.value = state.nMonths;
    elements.inputDailyDays.value = state.dailyDays;
    elements.sliderDailyDays.value = state.dailyDays;

    recalculateAll();
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
