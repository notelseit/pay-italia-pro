/**
 * Simulatore di Costo Azienda
 * Wrapper su payrollCalculations.ts con logica estesa per simulazione
 */

import {
  calculatePayroll,
  calculateIRPEF,
  calculateWorkDeductions,
  calculateFamilyDeductions,
  INPS_RATES,
  INAIL_RATE,
  TFR_RATE,
  formatCurrency,
  type CCNLContractData,
  type PayrollResult,
} from "./payrollCalculations";
import { getRegionalRate, getMunicipalRate } from "./italianTaxRates";

export interface SimulatorInput {
  inputType: "ral" | "mensile";
  amount: number;
  ccnlContract?: CCNLContractData | null;
  contractType: "indeterminato" | "determinato" | "apprendistato";
  region: string;
  municipality: string;
  dependentsCount: number;
}

export interface SimulatorResult extends PayrollResult {
  /** Lordo annuale */
  annualGross: number;
  /** Netto annuale */
  annualNet: number;
  /** Costo totale azienda annuale */
  annualTotalCost: number;
  /** INAIL a carico del datore (annuale) */
  inailEmployer: number;
  /** Cuneo fiscale in percentuale */
  cuneoFiscalePercent: number;
  /** Numero mensilità */
  monthlyCount: number;
  /** RAL di input (o calcolata) */
  ral: number;
  /** Breakdown percentuali sullo stipendio lordo */
  breakdownPercentages: {
    irpef: number;
    inps: number;
    regional: number;
    municipal: number;
    net: number;
  };
}

export interface ComparisonResult {
  primary: SimulatorResult;
  secondary: SimulatorResult;
  delta: {
    monthlyNet: number;
    annualNet: number;
    annualTotalCost: number;
    cuneoFiscale: number;
  };
}

/**
 * Esegue la simulazione completa del costo azienda
 */
export function runSimulation(input: SimulatorInput): SimulatorResult {
  const {
    inputType,
    amount,
    ccnlContract,
    contractType,
    region,
    municipality,
    dependentsCount,
  } = input;

  // Determina mensilità
  const hasThirteenth = ccnlContract?.thirteenth_salary ?? true;
  const hasFourteenth = ccnlContract?.fourteenth_salary ?? false;
  const monthlyCount = 12 + (hasThirteenth ? 1 : 0) + (hasFourteenth ? 1 : 0);

  // Converti RAL → lordo mensile o viceversa
  let monthlyGross: number;
  let ral: number;
  if (inputType === "ral") {
    ral = amount;
    monthlyGross = amount / monthlyCount;
  } else {
    monthlyGross = amount;
    ral = amount * monthlyCount;
  }

  // Aliquote INPS personalizzate CCNL
  const inpsEmployeeRate = ccnlContract?.inps_rate
    ? ccnlContract.inps_rate / 100
    : INPS_RATES.employee;
  const inailRate = ccnlContract?.inail_rate
    ? ccnlContract.inail_rate / 100
    : INAIL_RATE;

  // Riduzione INPS per apprendistato
  const effectiveInpsEmployeeRate =
    contractType === "apprendistato" ? inpsEmployeeRate * 0.5 : inpsEmployeeRate;

  // Contributi INPS mensili
  const inpsEmployee = monthlyGross * effectiveInpsEmployeeRate;
  const inpsEmployer = monthlyGross * INPS_RATES.employer;

  // Imponibile fiscale
  const taxableMonthly = monthlyGross - inpsEmployee;
  const annualTaxableIncome = taxableMonthly * monthlyCount;

  // IRPEF
  const annualIRPEF = calculateIRPEF(annualTaxableIncome);
  const monthlyIRPEF = annualIRPEF / monthlyCount;

  // Detrazioni
  const annualWorkDed = calculateWorkDeductions(ral);
  const monthlyWorkDed = annualWorkDed / monthlyCount;
  const annualFamilyDed = calculateFamilyDeductions(dependentsCount);
  const monthlyFamilyDed = annualFamilyDed / monthlyCount;
  const totalMonthlyDed = monthlyWorkDed + monthlyFamilyDed;

  // IRPEF netta
  const netIRPEF = Math.max(0, monthlyIRPEF - totalMonthlyDed);

  // Addizionali regionali e comunali con aliquote specifiche
  const regionalRate = getRegionalRate(region, annualTaxableIncome);
  const municipalRate = getMunicipalRate(region, municipality);
  const monthlyRegionalTax = (annualTaxableIncome * regionalRate) / monthlyCount;
  const monthlyMunicipalTax = (annualTaxableIncome * municipalRate) / monthlyCount;

  // Totale trattenute e netto
  const totalDeductions = inpsEmployee + netIRPEF + monthlyRegionalTax + monthlyMunicipalTax;
  const netSalary = monthlyGross - totalDeductions;

  // TFR
  const tfr = (monthlyGross * TFR_RATE) / 12 * monthlyCount / monthlyCount; // mensile
  const monthlyTfr = (monthlyGross * TFR_RATE);

  // INAIL datore
  const inailEmployerMonthly = monthlyGross * inailRate;
  const inailEmployerAnnual = inailEmployerMonthly * monthlyCount;

  // Costo totale azienda mensile
  const totalCost = monthlyGross + inpsEmployer + monthlyTfr + inailEmployerMonthly;

  // Annuali
  const annualGross = monthlyGross * monthlyCount;
  const annualNet = netSalary * monthlyCount;
  const annualTotalCost = totalCost * monthlyCount;

  // Cuneo fiscale: (costo azienda - netto) / costo azienda * 100
  const cuneoFiscalePercent = annualTotalCost > 0
    ? ((annualTotalCost - annualNet) / annualTotalCost) * 100
    : 0;

  // Breakdown percentuali sul lordo mensile
  const breakdownPercentages = monthlyGross > 0
    ? {
        irpef: (netIRPEF / monthlyGross) * 100,
        inps: (inpsEmployee / monthlyGross) * 100,
        regional: (monthlyRegionalTax / monthlyGross) * 100,
        municipal: (monthlyMunicipalTax / monthlyGross) * 100,
        net: (netSalary / monthlyGross) * 100,
      }
    : { irpef: 0, inps: 0, regional: 0, municipal: 0, net: 0 };

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    grossSalary: round(monthlyGross),
    inpsEmployee: round(inpsEmployee),
    irpefGross: round(netIRPEF),
    workDeductions: round(totalMonthlyDed),
    familyDeductions: round(monthlyFamilyDed),
    regionalTax: round(monthlyRegionalTax),
    municipalTax: round(monthlyMunicipalTax),
    totalDeductions: round(totalDeductions),
    netSalary: round(netSalary),
    inpsEmployer: round(inpsEmployer),
    tfr: round(monthlyTfr),
    totalCost: round(totalCost),
    annualGross: round(annualGross),
    annualNet: round(annualNet),
    annualTotalCost: round(annualTotalCost),
    inailEmployer: round(inailEmployerAnnual),
    cuneoFiscalePercent: round(cuneoFiscalePercent),
    monthlyCount,
    ral: round(ral),
    breakdownPercentages: {
      irpef: round(breakdownPercentages.irpef),
      inps: round(breakdownPercentages.inps),
      regional: round(breakdownPercentages.regional),
      municipal: round(breakdownPercentages.municipal),
      net: round(breakdownPercentages.net),
    },
  };
}

/**
 * Confronta due simulazioni e calcola i delta
 */
export function compareSimulations(
  primary: SimulatorInput,
  secondary: SimulatorInput
): ComparisonResult {
  const primaryResult = runSimulation(primary);
  const secondaryResult = runSimulation(secondary);

  return {
    primary: primaryResult,
    secondary: secondaryResult,
    delta: {
      monthlyNet: Math.round((secondaryResult.netSalary - primaryResult.netSalary) * 100) / 100,
      annualNet: Math.round((secondaryResult.annualNet - primaryResult.annualNet) * 100) / 100,
      annualTotalCost: Math.round((secondaryResult.annualTotalCost - primaryResult.annualTotalCost) * 100) / 100,
      cuneoFiscale: Math.round((secondaryResult.cuneoFiscalePercent - primaryResult.cuneoFiscalePercent) * 100) / 100,
    },
  };
}

export { formatCurrency };
