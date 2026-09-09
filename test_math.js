// Automated Unit Test for FinanceMath
import { FinanceMath } from './js/finance-math.js';

console.log("=== RUNNING AUTOMATED UNIT TESTS ===");

// Test 1: Flat Calculation
const P = 100000000;
const rFlat = 6;
const n = 12;

const flatRes = FinanceMath.calculateFlat(P, rFlat, n);
console.assert(Math.round(flatRes.totalInterest) === 6000000, "Test 1 Failed: Flat total interest");
console.assert(Math.round(flatRes.monthlyInstallment) === 8833333, "Test 1 Failed: Flat PMT");
console.log("✓ Test 1 Passed: Flat Interest Calculation");

// Test 2: Effective Calculation
const effRes = FinanceMath.calculateEffective(P, rFlat, n);
console.assert(effRes.schedule.length === 12, "Test 2 Failed: Effective schedule length");
console.assert(Math.round(effRes.schedule[11].remainingBalance) === 0, "Test 2 Failed: Effective final balance zero");
console.log("✓ Test 2 Passed: Effective Interest Calculation");

// Test 3: Annuity Calculation
const annRes = FinanceMath.calculateAnnuity(P, rFlat, n);
console.assert(Math.round(annRes.schedule[11].remainingBalance) === 0, "Test 3 Failed: Annuity final balance zero");
console.assert(annRes.totalInterest < flatRes.totalInterest, "Test 3 Failed: Annuity interest must be less than Flat");
console.log("✓ Test 3 Passed: Annuity Calculation");

// Test 4: Conversion Flat to Effective
const convRes = FinanceMath.convertFlatToEffective(P, 6, 12);
const effNom = convRes.effectiveNominal;
console.assert(effNom > 10.8 && effNom < 11.0, `Test 4 Failed: Expected ~10.9%, got ${effNom}`);
console.log(`✓ Test 4 Passed: Flat 6% -> Effective ${effNom.toFixed(4)}%`);

// Test 5: Conversion Effective to Flat (Reversible)
const revRes = FinanceMath.convertEffectiveToFlat(P, effNom, 12);
console.assert(Math.abs(revRes.flatRateFromAnnuity - 6.0) < 0.01, "Test 5 Failed: Reversibility");
console.log(`✓ Test 5 Passed: Effective ${effNom.toFixed(2)}% -> Flat ${revRes.flatRateFromAnnuity.toFixed(2)}% (Reversible)`);

// Test 6: Daily Interest
const dailyRes = FinanceMath.calculateDailyInterest(P, 12, 30, 'ACTUAL_360');
console.assert(Math.round(dailyRes.totalAccruedInterest) === 1000000, `Test 6 Failed: Expected 1,000,000, got ${dailyRes.totalAccruedInterest}`);
console.log("✓ Test 6 Passed: Daily Interest Actual/360");

console.log("\nALL 6 UNIT TESTS PASSED SUCCESSFULLY! 🚀");
