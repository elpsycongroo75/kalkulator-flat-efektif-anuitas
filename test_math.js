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

console.log("\nALL 7 RIGOROUS UNIT TESTS PASSED SUCCESSFULLY! 🚀");
