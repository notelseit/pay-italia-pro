import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayrollData {
  employee_full_name: string;
  gross_total: number;
  net_salary: number;
  irpef_tax: number;
  inps_contribution: number;
}

interface CompanyData {
  name: string;
  vat_number: string;
  address: string;
}

export const generateUNIEMENS = (
  month: string,
  companyCode: string,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  const [year, monthNum] = month.split("-");
  
  // Header
  doc.setFontSize(18);
  doc.text("UNIEMENS - Denuncia Mensile", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Periodo: ${monthNum}/${year}`, 20, 35);
  doc.text(`Codice Azienda INPS: ${companyCode}`, 20, 42);
  doc.text(`Azienda: ${companyData.name}`, 20, 49);
  doc.text(`P.IVA: ${companyData.vat_number || "N/A"}`, 20, 56);
  
  // Riepilogo contributi
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const tableData = payrollRecords.map((record) => [
    record.employee_full_name,
    record.gross_total.toFixed(2),
    record.inps_contribution.toFixed(2),
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [["Dipendente", "Retribuzione Lorda", "Contributi INPS"]],
    body: tableData,
    foot: [["TOTALE", "", totalINPS.toFixed(2)]],
    theme: "grid",
  });
  
  doc.save(`UNIEMENS_${monthNum}_${year}.pdf`);
};

export const generateF24 = (
  month: string,
  paymentType: string,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  const [year, monthNum] = month.split("-");
  
  // Header
  doc.setFontSize(18);
  doc.text("MODELLO F24", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Periodo: ${monthNum}/${year}`, 20, 35);
  doc.text(`Tipo Versamento: ${paymentType}`, 20, 42);
  doc.text(`Contribuente: ${companyData.name}`, 20, 49);
  doc.text(`P.IVA: ${companyData.vat_number || "N/A"}`, 20, 56);
  
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  
  const tableData = [
    ["INPS", "Contributi previdenziali", totalINPS.toFixed(2)],
    ["IRPEF", "Ritenute fiscali", totalIRPEF.toFixed(2)],
  ];
  
  autoTable(doc, {
    startY: 70,
    head: [["Codice", "Descrizione", "Importo (€)"]],
    body: tableData,
    foot: [["", "TOTALE DA VERSARE", (totalINPS + totalIRPEF).toFixed(2)]],
    theme: "grid",
  });
  
  doc.save(`F24_${monthNum}_${year}.pdf`);
};

export const generateModello770 = (
  year: number,
  simplified: boolean,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("MODELLO 770", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(simplified ? "(Modello Semplificato)" : "(Modello Ordinario)", 105, 28, { align: "center" });
  
  doc.text(`Anno d'imposta: ${year}`, 20, 40);
  doc.text(`Azienda: ${companyData.name}`, 20, 47);
  doc.text(`P.IVA: ${companyData.vat_number || "N/A"}`, 20, 54);
  
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  const totalEmployees = payrollRecords.length;
  
  autoTable(doc, {
    startY: 70,
    head: [["Descrizione", "Valore"]],
    body: [
      ["Numero dipendenti", totalEmployees.toString()],
      ["Totale ritenute IRPEF operate", `€ ${totalIRPEF.toFixed(2)}`],
      ["Tipo modello", simplified ? "Semplificato" : "Ordinario"],
    ],
    theme: "grid",
  });
  
  doc.save(`Modello770_${year}.pdf`);
};

export const generateCertificazioneUnica = (
  year: number,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("CERTIFICAZIONE UNICA", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Anno d'imposta: ${year}`, 20, 35);
  doc.text(`Sostituto d'imposta: ${companyData.name}`, 20, 42);
  doc.text(`P.IVA: ${companyData.vat_number || "N/A"}`, 20, 49);
  
  const tableData = payrollRecords.map((record) => [
    record.employee_full_name,
    record.gross_total.toFixed(2),
    record.irpef_tax.toFixed(2),
    record.net_salary.toFixed(2),
  ]);
  
  autoTable(doc, {
    startY: 65,
    head: [["Dipendente", "Reddito Lordo", "Ritenute IRPEF", "Reddito Netto"]],
    body: tableData,
    theme: "grid",
  });
  
  doc.save(`CU_${year}.pdf`);
};

export const generateAutoliquidazioneINAIL = (
  year: number,
  companyCode: string,
  totalWages: number,
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("AUTOLIQUIDAZIONE INAIL", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Anno: ${year}`, 20, 35);
  doc.text(`Codice Ditta INAIL: ${companyCode}`, 20, 42);
  doc.text(`Azienda: ${companyData.name}`, 20, 49);
  doc.text(`P.IVA: ${companyData.vat_number || "N/A"}`, 20, 56);
  
  const premiumRate = 0.025; // 2.5% tasso medio
  const calculatedPremium = totalWages * premiumRate;
  
  autoTable(doc, {
    startY: 70,
    head: [["Descrizione", "Importo (€)"]],
    body: [
      ["Retribuzioni Imponibili Totali", totalWages.toFixed(2)],
      ["Tasso Premio (medio 2.5%)", `${(premiumRate * 100).toFixed(2)}%`],
      ["Premio Calcolato", calculatedPremium.toFixed(2)],
    ],
    theme: "grid",
  });
  
  doc.save(`Autoliquidazione_INAIL_${year}.pdf`);
};
