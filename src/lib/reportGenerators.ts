import { formatCurrency } from "./payrollCalculations";

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  base_salary: number;
  bonuses: number;
  overtime_pay: number;
  gross_total: number;
  inps_contribution: number;
  irpef_tax: number;
  net_salary: number;
  status: string;
  employees?: { full_name: string };
}

interface PresenceRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  working_days: number;
  vacation_days: number;
  sick_days: number;
  other_absences: number;
  overtime_hours: number;
  employees?: { full_name: string };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  tax_code: string;
  base_salary: number;
  hire_date: string;
}

/**
 * Genera report mensile del costo del lavoro
 */
export function generateMonthlyCostReport(
  payrollRecords: PayrollRecord[],
  month: number,
  year: number
) {
  const totalGross = payrollRecords.reduce((sum, r) => sum + Number(r.gross_total), 0);
  const totalNet = payrollRecords.reduce((sum, r) => sum + Number(r.net_salary), 0);
  const totalINPS = payrollRecords.reduce((sum, r) => sum + Number(r.inps_contribution), 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + Number(r.irpef_tax), 0);
  const totalBonuses = payrollRecords.reduce((sum, r) => sum + Number(r.bonuses), 0);
  const totalOvertime = payrollRecords.reduce((sum, r) => sum + Number(r.overtime_pay), 0);

  // Costo totale azienda (lordo + contributi datore lavoro stimati al 30%)
  const employerContributions = totalGross * 0.30;
  const totalCost = totalGross + employerContributions;

  return {
    period: `${getMonthName(month)} ${year}`,
    employeeCount: payrollRecords.length,
    totalGross,
    totalNet,
    totalINPS,
    totalIRPEF,
    totalBonuses,
    totalOvertime,
    employerContributions,
    totalCost,
    details: payrollRecords.map(r => ({
      employee: r.employees?.full_name || 'N/A',
      gross: Number(r.gross_total),
      net: Number(r.net_salary),
      inps: Number(r.inps_contribution),
      irpef: Number(r.irpef_tax),
    }))
  };
}

/**
 * Genera report assenze mensile
 */
export function generateAbsenceReport(
  presenceRecords: PresenceRecord[],
  month: number,
  year: number
) {
  const totalWorkingDays = presenceRecords.reduce((sum, r) => sum + Number(r.working_days), 0);
  const totalVacationDays = presenceRecords.reduce((sum, r) => sum + Number(r.vacation_days), 0);
  const totalSickDays = presenceRecords.reduce((sum, r) => sum + Number(r.sick_days), 0);
  const totalOtherAbsences = presenceRecords.reduce((sum, r) => sum + Number(r.other_absences), 0);
  const totalOvertimeHours = presenceRecords.reduce((sum, r) => sum + Number(r.overtime_hours), 0);

  const totalAbsences = totalVacationDays + totalSickDays + totalOtherAbsences;

  return {
    period: `${getMonthName(month)} ${year}`,
    employeeCount: presenceRecords.length,
    totalWorkingDays,
    totalVacationDays,
    totalSickDays,
    totalOtherAbsences,
    totalAbsences,
    totalOvertimeHours,
    absenceRate: totalWorkingDays > 0 ? (totalAbsences / (totalWorkingDays + totalAbsences) * 100).toFixed(2) : '0',
    details: presenceRecords.map(r => ({
      employee: r.employees?.full_name || 'N/A',
      workingDays: Number(r.working_days),
      vacationDays: Number(r.vacation_days),
      sickDays: Number(r.sick_days),
      otherAbsences: Number(r.other_absences),
      overtimeHours: Number(r.overtime_hours),
    }))
  };
}

/**
 * Genera report contributi trimestrale
 */
export function generateQuarterlyContributionsReport(
  payrollRecords: PayrollRecord[],
  quarter: number,
  year: number
) {
  const quarterMonths = getQuarterMonths(quarter);
  const quarterRecords = payrollRecords.filter(r => 
    r.year === year && quarterMonths.includes(r.month)
  );

  const totalINPS = quarterRecords.reduce((sum, r) => sum + Number(r.inps_contribution), 0);
  const totalIRPEF = quarterRecords.reduce((sum, r) => sum + Number(r.irpef_tax), 0);
  const totalGross = quarterRecords.reduce((sum, r) => sum + Number(r.gross_total), 0);

  // Contributi datore lavoro stimati
  const employerINPS = totalGross * 0.30;
  const totalContributions = totalINPS + employerINPS;

  const monthlyBreakdown = quarterMonths.map(month => {
    const monthRecords = quarterRecords.filter(r => r.month === month);
    const monthINPS = monthRecords.reduce((sum, r) => sum + Number(r.inps_contribution), 0);
    const monthIRPEF = monthRecords.reduce((sum, r) => sum + Number(r.irpef_tax), 0);
    
    return {
      month: getMonthName(month),
      inps: monthINPS,
      irpef: monthIRPEF,
      employeesCount: monthRecords.length
    };
  });

  return {
    period: `Q${quarter} ${year}`,
    quarterMonths: quarterMonths.map(m => getMonthName(m)).join(', '),
    totalINPS,
    totalIRPEF,
    employerINPS,
    totalContributions,
    monthlyBreakdown
  };
}

/**
 * Genera scadenze fiscali
 */
export function generateTaxDeadlines(month: number, year: number) {
  const deadlines = [];
  const currentDate = new Date(year, month - 1, 1);
  
  // Versamento INPS - 16 del mese
  deadlines.push({
    task: "Versamento INPS",
    date: `16 ${getMonthName(month)} ${year}`,
    priority: "Alta",
    type: "Contributi",
    description: "Versamento contributi INPS dipendenti e azienda"
  });

  // Versamento IRPEF - 16 del mese
  deadlines.push({
    task: "Versamento IRPEF (Modello F24)",
    date: `16 ${getMonthName(month)} ${year}`,
    priority: "Alta",
    type: "Imposte",
    description: "Versamento ritenute IRPEF dipendenti"
  });

  // UniEmens - ultimo giorno del mese
  const lastDay = new Date(year, month, 0).getDate();
  deadlines.push({
    task: "Comunicazioni UniEmens",
    date: `${lastDay} ${getMonthName(month)} ${year}`,
    priority: "Media",
    type: "Comunicazioni",
    description: "Invio comunicazioni mensili INPS"
  });

  // CU (Certificazione Unica) - 16 marzo
  if (month === 3) {
    deadlines.push({
      task: "Certificazione Unica (CU)",
      date: `16 Marzo ${year}`,
      priority: "Alta",
      type: "Certificazioni",
      description: "Invio CU a dipendenti e Agenzia delle Entrate"
    });
  }

  // 770 - 31 ottobre
  if (month === 10) {
    deadlines.push({
      task: "Modello 770",
      date: `31 Ottobre ${year}`,
      priority: "Alta",
      type: "Dichiarazioni",
      description: "Dichiarazione sostituti d'imposta"
    });
  }

  return deadlines.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Esporta report in formato CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Gestisci valori con virgole o caratteri speciali
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utility: ottiene il nome del mese
 */
function getMonthName(month: number): string {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month - 1] || '';
}

/**
 * Utility: ottiene i mesi di un trimestre
 */
function getQuarterMonths(quarter: number): number[] {
  switch (quarter) {
    case 1: return [1, 2, 3];
    case 2: return [4, 5, 6];
    case 3: return [7, 8, 9];
    case 4: return [10, 11, 12];
    default: return [];
  }
}

/**
 * Calcola il trimestre corrente
 */
export function getCurrentQuarter(month: number): number {
  return Math.ceil(month / 3);
}
