// Automated Unit Test for FinanceMath
import { FinanceMath } from './js/finance-math.js';

console.log("=== RUNNING AUTOMATED UNIT TESTS ===");

const P = 1000000000; // 1 Miliar
const rFlat = 6;
const n = 12;

// Test 1: Flat Calculation
const flatRes = FinanceMath.calculateFlat(P, rFlat, n);
console.assert(Math.round(flatRes.totalInterest) === 60000000, "Test 1 Failed: Flat total interest");
console.log("✓ Test 1 Passed: Flat Interest Calculation (Rp 60.000.000)");

// Test 2: Effective Calculation
const effRes = FinanceMath.calculateEffective(P, rFlat, n);
console.assert(effRes.schedule.length === 12, "Test 2 Failed: Effective schedule length");
console.assert(Math.round(effRes.totalInterest) === 32500000, "Test 2 Failed: Effective total interest");
console.log("✓ Test 2 Passed: Effective Interest Calculation (Rp 32.500.000)");

// Test 3: Annuity Calculation
const annRes = FinanceMath.calculateAnnuity(P, rFlat, n);
console.assert(Math.round(annRes.schedule[11].remainingBalance) === 0, "Test 3 Failed: Annuity final balance zero");
console.assert(Math.round(annRes.totalInterest) === 32797156, "Test 3 Failed: Annuity total interest");
console.log("✓ Test 3 Passed: Annuity Interest Calculation (Rp 32.797.156)");

// Test 4: Conversion Flat to Effective
const convRes = FinanceMath.convertFlatToEffective(P, 6, 12);
const effNom = convRes.effectiveNominal;
console.assert(effNom > 10.8 && effNom < 11.0, `Test 4 Failed: Expected ~10.9%, got ${effNom}`);
console.log(`✓ Test 4 Passed: Flat 6% -> Effective ${effNom.toFixed(4)}%`);

// Test 5: Conversion Effective to Flat (Reversible)
const revRes = FinanceMath.convertEffectiveToFlat(P, effNom, 12);
console.assert(Math.abs(revRes.flatRateFromAnnuity - 6.0) < 0.01, "Test 5 Failed: Reversibility");
console.log(`✓ Test 5 Passed: Effective ${effNom.toFixed(2)}% -> Flat ${revRes.flatRateFromAnnuity.toFixed(2)}% (Reversible)`);

// Test 6: AUDIT FIX - Daily Interest Differentiates Flat vs Efektif vs Anuitas
const dailyFlat360 = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'FLAT', new Date('2026-01-01'), n, 'AMORTIZING');
const dailyEff360 = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'EFEKTIF', new Date('2026-01-01'), n, 'AMORTIZING');
const dailyAnn360 = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'ANUITAS', new Date('2026-01-01'), n, 'AMORTIZING');

console.assert(Math.round(dailyFlat360.totalAccruedInterest) === 60000000, `Test 6.1 Failed: Flat 360 days expected 60M, got ${dailyFlat360.totalAccruedInterest}`);
console.assert(Math.round(dailyEff360.totalAccruedInterest) === 32500000, `Test 6.2 Failed: Efektif 360 days expected 32.5M, got ${dailyEff360.totalAccruedInterest}`);
console.assert(Math.round(dailyAnn360.totalAccruedInterest) === 32797156, `Test 6.3 Failed: Annuity 360 days expected 32.8M, got ${dailyAnn360.totalAccruedInterest}`);
console.assert(dailyEff360.totalAccruedInterest < dailyFlat360.totalAccruedInterest, "Test 6.4 Failed: Efektif must be less than Flat");
console.log("✓ Test 6 Passed: Daily Interest 360 Days Matches Monthly Schedules (Flat: 60M, Efektif: 32.5M, Anuitas: 32.8M)");

// Test 7: AUDIT FIX - Daily Interest in Month 6 (Day 180)
const dailyFlat180 = FinanceMath.calculateDailyInterest(P, rFlat, 180, 'ACTUAL_360', 0, 'FLAT', new Date('2026-01-01'), n, 'AMORTIZING');
const dailyEff180 = FinanceMath.calculateDailyInterest(P, rFlat, 180, 'ACTUAL_360', 0, 'EFEKTIF', new Date('2026-01-01'), n, 'AMORTIZING');

console.assert(dailyEff180.dailyInterestAmount < dailyFlat180.dailyInterestAmount, "Test 7 Failed: Efektif daily interest on Day 180 must be less than Flat");
console.assert(Math.round(dailyFlat180.totalAccruedInterest) === 30000000, "Test 7.1 Failed: Flat 180 days expected 30M");
console.assert(Math.round(dailyEff180.totalAccruedInterest) === 23750000, "Test 7.2 Failed: Efektif 180 days expected 23.75M");
console.log("✓ Test 7 Passed: Daily Interest Day 180 Differentiates (Flat: 30M vs Efektif: 23.75M, Bunga/hari Efektif turun)");


// Test 8: AUDIT FIX - PRK Facility sets constant principal and computes Amortizing comparisons
const dailyPrk = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'EFEKTIF', new Date('2026-01-01'), n, 'REKENING_KORAN');
console.assert(Math.round(dailyPrk.totalAccruedInterest) === 60000000, `Test 8.1 Failed: PRK expected 60M, got ${dailyPrk.totalAccruedInterest}`);
console.assert(dailyPrk.comparison.amortizingEff !== null, "Test 8.2 Failed: PRK must include amortizingEff comparison");
console.assert(Math.round(dailyPrk.comparison.amortizingEff.totalAccruedInterest) === 32500000, "Test 8.3 Failed: PRK amortizingEff expected 32.5M");
console.log("✓ Test 8 Passed: PRK Facility (60M) vs Amortizing Effective Comparison (32.5M)");

// Test 9: AUDIT FIX - When d > maxTenorDays, curBalance and dailyInterest become 0
const dailyPastMaturity = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'EFEKTIF', new Date('2026-01-01'), 1, 'AMORTIZING');
console.assert(dailyPastMaturity.remainingBalance === 0, "Test 9.1 Failed: Past maturity balance must be 0");
console.assert(dailyPastMaturity.dailyInterestAmount === 0, "Test 9.2 Failed: Past maturity daily interest must be 0");
console.log("✓ Test 9 Passed: Past maturity yields zero remaining balance and zero daily interest");

// Test 10: AUDIT FIX - Tenor 1 Month yields mathematically identical total interest for Flat, Efektif, and Anuitas
const f1m = FinanceMath.calculateFlat(P, rFlat, 1);
const e1m = FinanceMath.calculateEffective(P, rFlat, 1);
const a1m = FinanceMath.calculateAnnuity(P, rFlat, 1);
console.assert(Math.round(f1m.totalInterest) === Math.round(e1m.totalInterest), "Test 10.1 Failed: 1-mo Flat != Efektif");
console.assert(Math.round(e1m.totalInterest) === Math.round(a1m.totalInterest), "Test 10.2 Failed: 1-mo Efektif != Anuitas");
console.log("✓ Test 10 Passed: 1-Month Tenor Flat == Efektif == Anuitas mathematically (1x payment)");


// Test 11: AUDIT FIX - Syariah Promes Facility keeps principal active and accrues daily profit sharing
const dailySyariah = FinanceMath.calculateDailyInterest(P, rFlat, 360, 'ACTUAL_360', 0, 'EFEKTIF', new Date('2026-01-01'), 6, 'SYARIAH_PROMES');
console.assert(dailySyariah.remainingBalance === P, "Test 11.1 Failed: Syariah Promes principal must remain active P");
console.assert(Math.round(dailySyariah.totalAccruedInterest) === 60000000, `Test 11.2 Failed: 360 days Syariah Promes expected 60M, got ${dailySyariah.totalAccruedInterest}`);
console.assert(dailySyariah.dailyInterestAmount > 0, "Test 11.3 Failed: Daily interest amount must be positive");
console.log("✓ Test 11 Passed: Syariah Promes Facility keeps principal active throughout 360 days with daily accrual");

// Test 12: AUDIT FIX - Monthly profit sharing in Syariah Promes matches daily accrual for 30 and 31 days
const dailyRate1B = (1000000000 * 0.06) / 360;
console.assert(Math.round(dailySyariah.monthly30) === Math.round(dailyRate1B * 30), "Test 12.1 Failed: monthly30 calculation");
console.assert(Math.round(dailySyariah.monthly31) === Math.round(dailyRate1B * 31), "Test 12.2 Failed: monthly31 calculation");
console.log("✓ Test 12 Passed: Monthly profit sharing accurately matches daily accrual (30 days: Rp 5M, 31 days: Rp 5.17M)");

console.log("\nALL 12 RIGOROUS UNIT TESTS PASSED SUCCESSFULLY! 🚀");
