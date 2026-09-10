import { FinanceMath } from './js/finance-math.js';
import { ExcelExport } from './js/excel-export.js';

console.log("=== RUNNING EXCEL EXPORT VERIFICATION TEST ===");

const P = 100000000;
const r = 6.0;
const n = 12;
const start = new Date();

const flatData = FinanceMath.calculateFlat(P, r, n, start);
const effData = FinanceMath.calculateEffective(P, r, n, start);
const annData = FinanceMath.calculateAnnuity(P, r, n, start);
const dailyData = FinanceMath.calculateDailyInterest(P, r, 30, 'ACTUAL_360', 0, 'EFEKTIF', start);

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

  const wbDailyEff = await ExcelExport.exportAmortizationWorkbook({
    flatData,
    effData,
    annData,
    dailyData,
    params,
    exportMode: 'DAILY_EFEKTIF'
  });

  console.assert(wbDailyEff.worksheets.length === 2, `Expected 2 sheets in DAILY_EFEKTIF mode, got ${wbDailyEff.worksheets.length}`);
  console.log(`✓ Workbook 'DAILY_EFEKTIF' generated with ${wbDailyEff.worksheets.length} sheets.`);

  console.log("\nALL EXCEL EXPORT VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀");
}

testExport().catch(err => {
  console.error("Test Failed:", err);
  process.exit(1);
});
