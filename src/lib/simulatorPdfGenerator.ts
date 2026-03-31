/**
 * Generatore PDF per il Simulatore di Costo Azienda
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, type SimulatorResult, type SimulatorInput, type ComparisonResult } from "./simulatorCalculations";
import { REGIONAL_TAX_RATES } from "./italianTaxRates";

const CONTRACT_LABELS: Record<string, string> = {
  indeterminato: "Tempo Indeterminato",
  determinato: "Tempo Determinato",
  apprendistato: "Apprendistato",
};

export function generateSimulatorPdf(
  input: SimulatorInput,
  result: SimulatorResult,
  comparison?: ComparisonResult | null
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFillColor(30, 80, 162);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Simulazione Costo Azienda", 14, 16);
  doc.setFontSize(10);
  doc.text("PayHub by Notelseit", 14, 24);
  doc.text(`Generato il ${new Date().toLocaleDateString("it-IT")}`, 14, 30);

  y = 45;
  doc.setTextColor(0, 0, 0);

  // Sezione parametri
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Parametri Simulazione", 14, y);
  y += 6;

  const regionName = REGIONAL_TAX_RATES[input.region]?.name || input.region;

  autoTable(doc, {
    startY: y,
    head: [["Parametro", "Valore"]],
    body: [
      ["Tipo Input", input.inputType === "ral" ? "RAL Annuale" : "Lordo Mensile"],
      ["Importo", formatCurrency(input.amount)],
      ["Tipo Contratto", CONTRACT_LABELS[input.contractType] || input.contractType],
      ["Mensilità", `${result.monthlyCount}`],
      ["Regione", regionName],
      ["Comune", input.municipality || "-"],
      ["Figli a carico", `${input.dependentsCount}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 80, 162] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Breakdown mensile e annuale
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio Retributivo", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Voce", "Mensile", "Annuale"]],
    body: [
      ["Lordo", formatCurrency(result.grossSalary), formatCurrency(result.annualGross)],
      ["INPS Dipendente", `-${formatCurrency(result.inpsEmployee)}`, `-${formatCurrency(result.inpsEmployee * result.monthlyCount)}`],
      ["IRPEF Netta", `-${formatCurrency(result.irpefGross)}`, `-${formatCurrency(result.irpefGross * result.monthlyCount)}`],
      ["Add. Regionale", `-${formatCurrency(result.regionalTax)}`, `-${formatCurrency(result.regionalTax * result.monthlyCount)}`],
      ["Add. Comunale", `-${formatCurrency(result.municipalTax)}`, `-${formatCurrency(result.municipalTax * result.monthlyCount)}`],
      ["Netto Stimato", formatCurrency(result.netSalary), formatCurrency(result.annualNet)],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 80, 162] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Costo azienda
  doc.setFont("helvetica", "bold");
  doc.text("Costo Azienda", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Voce", "Mensile", "Annuale"]],
    body: [
      ["Lordo Dipendente", formatCurrency(result.grossSalary), formatCurrency(result.annualGross)],
      ["INPS Datore", formatCurrency(result.inpsEmployer), formatCurrency(result.inpsEmployer * result.monthlyCount)],
      ["TFR", formatCurrency(result.tfr), formatCurrency(result.tfr * result.monthlyCount)],
      ["INAIL Datore", formatCurrency(result.inailEmployer / result.monthlyCount), formatCurrency(result.inailEmployer)],
      ["Costo Totale", formatCurrency(result.totalCost), formatCurrency(result.annualTotalCost)],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 80, 162] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Cuneo fiscale
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Cuneo Fiscale: ${result.cuneoFiscalePercent.toFixed(1)}%`, 14, y);
  y += 8;

  // Confronto (se presente)
  if (comparison) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Confronto Contratti", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Voce", "Contratto A", "Contratto B", "Delta"]],
      body: [
        [
          "Netto Mensile",
          formatCurrency(comparison.primary.netSalary),
          formatCurrency(comparison.secondary.netSalary),
          formatCurrency(comparison.delta.monthlyNet),
        ],
        [
          "Netto Annuale",
          formatCurrency(comparison.primary.annualNet),
          formatCurrency(comparison.secondary.annualNet),
          formatCurrency(comparison.delta.annualNet),
        ],
        [
          "Costo Azienda Annuale",
          formatCurrency(comparison.primary.annualTotalCost),
          formatCurrency(comparison.secondary.annualTotalCost),
          formatCurrency(comparison.delta.annualTotalCost),
        ],
        [
          "Cuneo Fiscale",
          `${comparison.primary.cuneoFiscalePercent.toFixed(1)}%`,
          `${comparison.secondary.cuneoFiscalePercent.toFixed(1)}%`,
          `${comparison.delta.cuneoFiscale > 0 ? "+" : ""}${comparison.delta.cuneoFiscale.toFixed(1)}%`,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 80, 162] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer disclaimer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Documento generato a scopo informativo - non costituisce busta paga né documento fiscale ufficiale.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.save(`simulazione-costo-azienda-${new Date().toISOString().slice(0, 10)}.pdf`);
}
