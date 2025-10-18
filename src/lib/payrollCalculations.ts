/**
 * Calcoli per la gestione cedolini conformi alle normative italiane 2025
 */

// Scaglioni IRPEF 2025
export const IRPEF_BRACKETS = [
  { min: 0, max: 28000, rate: 0.23 },
  { min: 28000, max: 50000, rate: 0.35 },
  { min: 50000, max: Infinity, rate: 0.43 }
];

// Contributi INPS dipendenti (percentuali 2025)
export const INPS_RATES = {
  employee: 0.0919, // 9.19% a carico del dipendente
  employer: 0.3008  // 30.08% a carico del datore di lavoro
};

// Aliquota TFR
export const TFR_RATE = 0.0691; // 6.91%

// Contributo INAIL (varia per settore, usiamo media)
export const INAIL_RATE = 0.015; // 1.5% medio

/**
 * Calcola l'IRPEF lorda annuale
 */
export function calculateIRPEF(annualIncome: number): number {
  let tax = 0;
  
  for (const bracket of IRPEF_BRACKETS) {
    if (annualIncome > bracket.min) {
      const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }
  
  return tax;
}

/**
 * Calcola le detrazioni fiscali per lavoro dipendente (2025)
 */
export function calculateWorkDeductions(annualIncome: number): number {
  if (annualIncome <= 15000) {
    return 1955;
  } else if (annualIncome <= 28000) {
    return 1910 + (1955 - 1910) * (28000 - annualIncome) / (28000 - 15000);
  } else if (annualIncome <= 50000) {
    return 1910 * (50000 - annualIncome) / (50000 - 28000);
  }
  return 0;
}

/**
 * Calcola le detrazioni per familiari a carico
 */
export function calculateFamilyDeductions(dependents: number): number {
  // Detrazione per figlio a carico (2025)
  const deductionPerChild = 950; // Base per figlio
  return dependents * deductionPerChild;
}

/**
 * Calcola le addizionali regionali e comunali (media)
 */
export function calculateRegionalTax(annualIncome: number): number {
  // Addizionale regionale media 1.23%
  return annualIncome * 0.0123;
}

export function calculateMunicipalTax(annualIncome: number): number {
  // Addizionale comunale media 0.8%
  return annualIncome * 0.008;
}

/**
 * Calcola il TFR mensile
 */
export function calculateMonthlyTFR(grossSalary: number): number {
  return (grossSalary * TFR_RATE) / 12;
}

/**
 * Calcola i contributi INPS mensili
 */
export function calculateINPSContributions(grossSalary: number) {
  return {
    employee: grossSalary * INPS_RATES.employee,
    employer: grossSalary * INPS_RATES.employer
  };
}

/**
 * Interfaccia per i parametri del cedolino
 */
export interface PayrollParams {
  baseSalary: number;
  bonuses?: number;
  overtimePay?: number;
  dependentsCount?: number;
  taxDeductions?: number;
  workingHours?: number;
}

/**
 * Risultato del calcolo del cedolino
 */
export interface PayrollResult {
  grossSalary: number;
  inpsEmployee: number;
  irpefGross: number;
  workDeductions: number;
  familyDeductions: number;
  regionalTax: number;
  municipalTax: number;
  totalDeductions: number;
  netSalary: number;
  inpsEmployer: number;
  tfr: number;
  totalCost: number;
}

/**
 * Calcola il cedolino completo
 */
export function calculatePayroll(params: PayrollParams): PayrollResult {
  const {
    baseSalary,
    bonuses = 0,
    overtimePay = 0,
    dependentsCount = 0,
    taxDeductions = 0
  } = params;

  // Calcolo lordo mensile
  const grossSalary = baseSalary + bonuses + overtimePay;
  
  // Calcolo annuale per IRPEF
  const annualGross = grossSalary * 13; // 13 mensilità
  
  // Contributi INPS
  const inpsContributions = calculateINPSContributions(grossSalary);
  const inpsEmployee = inpsContributions.employee;
  const inpsEmployer = inpsContributions.employer;
  
  // Imponibile fiscale (lordo - INPS dipendente)
  const taxableIncome = grossSalary - inpsEmployee;
  const annualTaxableIncome = taxableIncome * 13;
  
  // IRPEF lorda annuale e mensile
  const annualIRPEF = calculateIRPEF(annualTaxableIncome);
  const monthlyIRPEF = annualIRPEF / 13;
  
  // Detrazioni
  const annualWorkDeductions = calculateWorkDeductions(annualGross);
  const monthlyWorkDeductions = annualWorkDeductions / 13;
  
  const annualFamilyDeductions = calculateFamilyDeductions(dependentsCount);
  const monthlyFamilyDeductions = annualFamilyDeductions / 13;
  
  const totalMonthlyDeductions = monthlyWorkDeductions + monthlyFamilyDeductions + taxDeductions;
  
  // IRPEF netta dopo detrazioni
  const netIRPEF = Math.max(0, monthlyIRPEF - totalMonthlyDeductions);
  
  // Addizionali
  const annualRegionalTax = calculateRegionalTax(annualTaxableIncome);
  const monthlyRegionalTax = annualRegionalTax / 13;
  
  const annualMunicipalTax = calculateMunicipalTax(annualTaxableIncome);
  const monthlyMunicipalTax = annualMunicipalTax / 13;
  
  // Totale trattenute
  const totalDeductions = inpsEmployee + netIRPEF + monthlyRegionalTax + monthlyMunicipalTax;
  
  // Netto in busta
  const netSalary = grossSalary - totalDeductions;
  
  // TFR
  const tfr = calculateMonthlyTFR(grossSalary);
  
  // Costo totale azienda
  const totalCost = grossSalary + inpsEmployer + tfr;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    inpsEmployee: Math.round(inpsEmployee * 100) / 100,
    irpefGross: Math.round(netIRPEF * 100) / 100,
    workDeductions: Math.round(totalMonthlyDeductions * 100) / 100,
    familyDeductions: Math.round(monthlyFamilyDeductions * 100) / 100,
    regionalTax: Math.round(monthlyRegionalTax * 100) / 100,
    municipalTax: Math.round(monthlyMunicipalTax * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    inpsEmployer: Math.round(inpsEmployer * 100) / 100,
    tfr: Math.round(tfr * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100
  };
}

/**
 * Formatta un importo in valuta EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
