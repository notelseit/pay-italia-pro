import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { uploadDocumentToStorageAndFTP } from "./documentUpload";
import { Tables } from "@/integrations/supabase/types";

type PayrollRecord = Tables<"payroll_records"> & {
  employees?: {
    full_name: string;
    tax_code?: string;
    hire_date?: string;
    employee_type?: string;
    working_hours?: number;
    inps_position?: string;
    inail_position?: string;
    ccnl_contracts?: {
      name: string;
      inps_rate?: number;
      inail_rate?: number;
      thirteenth_salary?: boolean;
      fourteenth_salary?: boolean;
      meal_voucher_amount?: number;
    };
  };
};

export const generatePayrollPDF = async (payroll: PayrollRecord) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header - INAIL Logo and Company Info
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INAIL", 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Azienda: [Nome Azienda]", 14, yPos);
  doc.text("Cod. Azienda: [Codice]", pageWidth - 70, yPos);
  
  yPos += 6;
  doc.text(`Matricola INPS: ${payroll.employees?.inps_position || "N/A"}`, 14, yPos);
  doc.text(`Posizione INAIL: ${payroll.employees?.inail_position || "N/A"}`, pageWidth - 70, yPos);

  yPos += 10;
  
  // Month Header
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text(`MESE RETRIBUITO: ${getMonthName(payroll.month)} ${payroll.year}`, 16, yPos + 5);
  
  yPos += 12;

  // Employee Data Table
  const ccnlContract = payroll.employees?.ccnl_contracts;
  const employeeData = [
    ["Cognome e Nome", payroll.employees?.full_name || "N/A", "Data Assunzione", payroll.employees?.hire_date || "N/A"],
    ["Codice Fiscale", payroll.employees?.tax_code || "N/A", "CCNL", ccnlContract?.name || "N/A"],
    ["Qualifica", payroll.employees?.employee_type || "N/A", "Ore Sett.", payroll.employees?.working_hours?.toString() || "N/A"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: employeeData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 35 },
      3: { cellWidth: 50 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // COMPETENZE E TRATTENUTE Section
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("COMPETENZE E TRATTENUTE", 16, yPos + 5);
  
  yPos += 12;

  const competenzeData = [
    ["Codice", "Descrizione", "Quantità", "Competenze", "Trattenute"],
    ["100", "Retribuzione Base", "1.00", formatCurrency(payroll.base_salary), ""],
    ["200", "Straordinari", payroll.overtime_pay > 0 ? "1.00" : "", formatCurrency(payroll.overtime_pay), ""],
    ["300", "Bonus", payroll.bonuses > 0 ? "1.00" : "", formatCurrency(payroll.bonuses), ""],
  ];

  // Add meal vouchers if applicable
  if (ccnlContract?.meal_voucher_amount && ccnlContract.meal_voucher_amount > 0) {
    competenzeData.push(["310", "Buoni Pasto", "22.00", formatCurrency(ccnlContract.meal_voucher_amount * 22), ""]);
  }

  // Add deductions
  competenzeData.push(
    ["910", `INPS Dipendente (${ccnlContract?.inps_rate ? (ccnlContract.inps_rate).toFixed(2) : '9.19'}%)`, "", "", formatCurrency(payroll.inps_contribution)],
    ["920", "IRPEF", "", "", formatCurrency(payroll.irpef_tax)]
  );

  const filteredCompetenzeData = competenzeData.filter(row => row[3] !== "€0.00" && row[4] !== "€0.00" || row[0] === "Codice");

  autoTable(doc, {
    startY: yPos,
    head: [filteredCompetenzeData[0]],
    body: filteredCompetenzeData.slice(1),
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 3;

  // Contribution Summary
  const inpsRate = ccnlContract?.inps_rate || 0.0919;
  const inailRate = ccnlContract?.inail_rate || 0.015;
  const employerINPS = payroll.base_salary * 0.3008; // 30.08% employer contribution
  const totalINPS = payroll.inps_contribution + employerINPS;
  const inailContribution = payroll.base_salary * inailRate;
  const totalContributions = payroll.inps_contribution + inailContribution;

  const contributionData = [
    ["Impon. Previdenz.", formatCurrency(payroll.base_salary), "Ctr. Previdenziale", formatCurrency(payroll.inps_contribution), "Tot. Ctr. Previd.", formatCurrency(totalINPS)],
    ["Impon. INAIL", formatCurrency(payroll.base_salary), `Ctr. INAIL (${(inailRate * 100).toFixed(2)}%)`, formatCurrency(inailContribution), "Tot. Contributi", formatCurrency(totalContributions)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: contributionData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      2: { fontStyle: "bold", cellWidth: 30 },
      4: { fontStyle: "bold", cellWidth: 30 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // TASSAZIONE Section
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("TASSAZIONE", 16, yPos + 5);
  
  yPos += 12;

  const taxableIncome = payroll.base_salary + payroll.bonuses + payroll.overtime_pay;
  const regionalTax = taxableIncome * 0.014;
  const municipalTax = taxableIncome * 0.008;

  const tassazioneData = [
    ["Impon. Fiscale", "IRPEF Lorda", "Add. Comun.", "Addiz. Region.", "IRPEF Netta"],
    [
      formatCurrency(taxableIncome),
      formatCurrency(payroll.irpef_tax + regionalTax + municipalTax),
      formatCurrency(municipalTax),
      formatCurrency(regionalTax),
      formatCurrency(payroll.irpef_tax),
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [tassazioneData[0]],
    body: [tassazioneData[1]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, halign: "center" },
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // CCNL Info Section
  if (ccnlContract) {
    doc.setFillColor(230, 230, 230);
    doc.rect(14, yPos, pageWidth - 28, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("DATI CONTRATTO CCNL", 16, yPos + 5);
    
    yPos += 12;

    const ccnlInfoData = [
      ["Contratto", ccnlContract.name],
      ["Aliquota INPS", `${(inpsRate * 100).toFixed(2)}%`],
      ["Aliquota INAIL", `${(inailRate * 100).toFixed(2)}%`],
      ["Tredicesima", ccnlContract.thirteenth_salary ? "Sì" : "No"],
    ];

    if (ccnlContract.fourteenth_salary) {
      ccnlInfoData.push(["Quattordicesima", "Sì"]);
    }

    if (ccnlContract.meal_voucher_amount && ccnlContract.meal_voucher_amount > 0) {
      ccnlInfoData.push(["Buoni Pasto", `${formatCurrency(ccnlContract.meal_voucher_amount)} al giorno`]);
    }

    autoTable(doc, {
      startY: yPos,
      body: ccnlInfoData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // TFR Section
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("TFR (Trattamento di Fine Rapporto)", 16, yPos + 5);
  
  yPos += 12;

  const monthlyTFR = payroll.gross_total / 13.5;

  const tfrData = [
    ["Accantonamento Mese", "Rivalutazione", "TFR Maturato"],
    [formatCurrency(monthlyTFR), "€0.00", formatCurrency(monthlyTFR)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [tfrData[0]],
    body: [tfrData[1]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, halign: "center" },
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // DATI STATISTICI Section
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("DATI STATISTICI", 16, yPos + 5);
  
  yPos += 12;

  const workingDays = 22; // Standard working days
  const workingHours = (payroll.employees?.working_hours || 40) * 4.33; // Monthly hours

  const statisticsData = [
    ["Giorni INPS", "Ore Lavorate", "Giorni Lavorati", "Ore Retrib.", "Giorni Retrib."],
    [workingDays.toString(), workingHours.toFixed(0), workingDays.toString(), workingHours.toFixed(0), workingDays.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [statisticsData[0]],
    body: [statisticsData[1]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, halign: "center" },
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // RATEI Section
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPos, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("RATEI (Ferie, Permessi, ROL, Ex-Festività)", 16, yPos + 5);
  
  yPos += 12;

  const rateiData = [
    ["Tipologia", "Anni Prec.", "Maturati", "Goduti", "Residui"],
    ["Ferie", "0.00", "1.83", "0.00", "1.83"],
    ["Permessi", "0.00", "7.33", "0.00", "7.33"],
    ["ROL", "0.00", "6.67", "0.00", "6.67"],
    ["Ex-Festività", "0.00", "4.00", "0.00", "4.00"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [rateiData[0]],
    body: rateiData.slice(1),
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2, halign: "center" },
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Summary Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPos, pageWidth - 28, 30, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("RIEPILOGO", 16, yPos + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Totale Competenze: ${formatCurrency(payroll.gross_total)}`, 16, yPos + 12);
  doc.text(`Totale Trattenute: ${formatCurrency(payroll.gross_total - payroll.net_salary)}`, 16, yPos + 18);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`NETTO A PAGARE: ${formatCurrency(payroll.net_salary)}`, 16, yPos + 26);

  // Footer
  yPos += 38;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Firma lavoratore: _____________________", 14, yPos);
  doc.text(`pag. 1/1`, pageWidth - 24, yPos);

  // Save PDF
  const fileName = `Cedolino_${payroll.employees?.full_name || "Dipendente"}_${getMonthName(payroll.month)}_${payroll.year}.pdf`;
  doc.save(fileName);

  // Upload to storage and FTP
  if (payroll.company_id) {
    try {
      await uploadDocumentToStorageAndFTP({
        fileName,
        category: "cedolini",
        companyId: payroll.company_id,
        pdfDoc: doc,
      });
    } catch (error) {
      console.error("Error uploading to storage:", error);
    }
  }
};

const getMonthName = (month: number): string => {
  const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return months[month - 1];
};

const formatCurrency = (amount: number): string => {
  return `€${amount.toFixed(2)}`;
};
