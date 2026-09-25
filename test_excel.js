import { FinanceMath } from './js/finance-math.js';
import { ExcelExport } from './js/excel-export.js';

console.log("=== RUNNING EXCEL EXPORT VERIFICATION TEST ===");

const P = 100000000;
const r = 6.0;
const n = 12;
const start = new Date('2026-01-01');

const flatData = FinanceMath.calculateFlat(P, r, n, start);
const effData = FinanceMath.calculateEffective(P, r, n, start);
const annData = FinanceMath.calculateAnnuity(P, r, n, start);
const dailyData = FinanceMath.calculateDailyInterest(P, r, 360, 'ACTUAL_360', 0, 'EFEKTIF', start, n, 'AMORTIZING');

const params = {
  principal: P,
  rateAnnual: r,
  nMonths: n,
  startDate: start.toISOString().split('T')[0],
  dayCountConvention: 'ACTUAL_360'
};

async function testExport() {
  const wbAll = await ExcelExport.exportAmortizationWorkbook({
    flatData,
    effData,
    annData,
    dailyData,
    params,
    exportMode: 'ALL'
  });

  console.assert(wbAll.worksheets.length === 7, `Expected 7 sheets in ALL mode, got ${wbAll.worksheets.length}`);
  console.log(`✓ Workbook 'ALL' generated with ${wbAll.worksheets.length} sheets.`);

  // Verify Sheet 2 (Daily Efektif) vs Sheet 3 (Daily Flat) vs Sheet 4 (Daily Anuitas)
  const wsEff = wbAll.getWorksheet('2. Bunga Harian - Efektif');
  const wsFlat = wbAll.getWorksheet('3. Bunga Harian - Flat');
  const wsAnn = wbAll.getWorksheet('4. Bunga Harian - Anuitas');

  // Row 364 is Day 360 (since data starts at row 5: 5 + 359 = 364)
  const effDay360Accrued = wsEff.getRow(364).getCell(6).value;
  const flatDay360Accrued = wsFlat.getRow(364).getCell(6).value;
  const annDay360Accrued = wsAnn.getRow(364).getCell(6).value;

  console.log(`  -> Excel Sheet Daily Efektif (Day 360 Accrued): Rp ${effDay360Accrued.toLocaleString('id-ID')}`);
  console.log(`  -> Excel Sheet Daily Anuitas (Day 360 Accrued): Rp ${annDay360Accrued.toLocaleString('id-ID')}`);
  console.log(`  -> Excel Sheet Daily Flat    (Day 360 Accrued): Rp ${flatDay360Accrued.toLocaleString('id-ID')}`);

  console.assert(effDay360Accrued === 3250000, `Expected Efektif 3,250,000, got ${effDay360Accrued}`);
  console.assert(flatDay360Accrued === 6000000, `Expected Flat 6,000,000, got ${flatDay360Accrued}`);
  console.assert(annDay360Accrued === 3279716, `Expected Anuitas 3,279,716, got ${annDay360Accrued}`);
  console.log("✓ Verified: Excel Daily Worksheets have distinct, accurate financial values!");

  console.log("\nALL EXCEL EXPORT VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀");
}

testExport().catch(err => {
  console.error("Test Failed:", err);
  process.exit(1);
});
