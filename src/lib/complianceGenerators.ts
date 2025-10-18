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
  
  // === FRONTESPIZIO ===
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("UNIEMENS - ListaPosPA", 105, 20, { align: "center" });
  doc.text("Denuncia Mensile Dipendenti Pubblici", 105, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Periodo di riferimento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PERIODO DI RIFERIMENTO", 20, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Anno/Mese: ${monthNum}/${year}`, 20, 52);
  
  // Soggetto Dichiarante
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SOGGETTO DICHIARANTE", 20, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Denominazione: ${companyData.name}`, 20, 72);
  doc.text(`Codice Fiscale: ${companyData.vat_number || "N/A"}`, 20, 79);
  doc.text(`Codice Azienda INPS: ${companyCode}`, 20, 86);
  doc.text(`Indirizzo: ${companyData.address || "N/A"}`, 20, 93);
  
  // === DENUNCE INDIVIDUALI ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DENUNCE INDIVIDUALI (D0_DenunciaIndividuale)", 20, 20);
  
  let yPos = 35;
  payrollRecords.forEach((record, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${record.employee_full_name}`, 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Dati retributivi del periodo corrente (E0_PeriodoNelMese)
    autoTable(doc, {
      startY: yPos,
      head: [["Voce", "Importo (€)"]],
      body: [
        ["Retribuzione Lorda", record.gross_total.toFixed(2)],
        ["Contributi INPS dipendente", record.inps_contribution.toFixed(2)],
        ["IRPEF trattenuta", record.irpef_tax.toFixed(2)],
        ["Netto corrisposto", record.net_salary.toFixed(2)],
      ],
      theme: "grid",
      margin: { left: 25 },
      tableWidth: 160,
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  });
  
  // === RIEPILOGO CONTRIBUTIVO ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RIEPILOGO CONTRIBUTIVO", 20, 20);
  
  const totalGross = payrollRecords.reduce((sum, r) => sum + r.gross_total, 0);
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  const totalNet = payrollRecords.reduce((sum, r) => sum + r.net_salary, 0);
  const employerINPS = totalINPS * 2.1; // Quota datore di lavoro stimata
  
  autoTable(doc, {
    startY: 35,
    head: [["Descrizione", "Importo (€)"]],
    body: [
      ["Numero dipendenti denunciati", payrollRecords.length.toString()],
      ["Totale retribuzioni lorde", totalGross.toFixed(2)],
      ["Contributi INPS dipendenti", totalINPS.toFixed(2)],
      ["Contributi INPS datore di lavoro", employerINPS.toFixed(2)],
      ["Totale contributi INPS", (totalINPS + employerINPS).toFixed(2)],
      ["Totale IRPEF trattenuta", totalIRPEF.toFixed(2)],
      ["Totale netti corrisposti", totalNet.toFixed(2)],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // === ISTRUZIONI E NOTE ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NOTE E ISTRUZIONI", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  yPos = 35;
  
  const notes = [
    "Il presente documento costituisce il flusso UNIEMENS - ListaPosPA",
    "riferito alle retribuzioni erogate nel periodo indicato.",
    "",
    "Struttura del flusso secondo Circolare INPS n. 105 del 07/08/2012:",
    "- Frontespizio: identifica soggetto dichiarante e periodo",
    "- D0_DenunciaIndividuale: dati anagrafici e retributivi per ciascun dipendente",
    "- E0_PeriodoNelMese: dati del periodo corrente",
    "- Riepilogo contributivo: totali INPS e IRPEF",
    "",
    "Termine di presentazione: entro l'ultimo giorno del mese successivo",
    "a quello di riferimento.",
    "",
    `Data elaborazione: ${new Date().toLocaleDateString("it-IT")}`,
  ];
  
  notes.forEach((note) => {
    doc.text(note, 20, yPos);
    yPos += 6;
  });
  
  // Footer su tutte le pagine
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      `UNIEMENS ${monthNum}/${year} - ${companyData.name} - Pag. ${i}/${pageCount}`,
      105,
      285,
      { align: "center" }
    );
  }
  
  doc.save(`UNIEMENS_ListaPosPA_${monthNum}_${year}.pdf`);
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
