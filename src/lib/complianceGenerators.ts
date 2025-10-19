import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { uploadDocumentToStorageAndFTP } from "./documentUpload";

interface PayrollData {
  employee_full_name: string;
  gross_total: number;
  net_salary: number;
  irpef_tax: number;
  inps_contribution: number;
}

interface CompanyData {
  id: string;
  name: string;
  vat_number: string;
  address: string;
}

// Generate UNIEMENS XML following official structure
export const generateUNIEMENSXML = (
  month: string,
  companyCode: string,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const [year, monthNum] = month.split("-");
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<ListaPosPA xmlns="http://www.inps.it/namespace/ListaPosPA">\n';
  
  // Frontespizio
  xml += '  <Frontespizio>\n';
  xml += `    <CodiceFiscale>${companyData.vat_number || ''}</CodiceFiscale>\n`;
  xml += `    <AnnoMeseRif>${year}${monthNum}</AnnoMeseRif>\n`;
  xml += `    <CodiceAziendaINPS>${companyCode}</CodiceAziendaINPS>\n`;
  xml += `    <Denominazione>${escapeXML(companyData.name)}</Denominazione>\n`;
  xml += `    <Indirizzo>${escapeXML(companyData.address || '')}</Indirizzo>\n`;
  xml += '  </Frontespizio>\n';
  
  // Denunce Individuali
  payrollRecords.forEach((record, index) => {
    xml += '  <DenunciaIndividuale>\n';
    xml += `    <ProgressivoDenuncia>${index + 1}</ProgressivoDenuncia>\n`;
    xml += `    <Cognome>${escapeXML(record.employee_full_name.split(' ')[0])}</Cognome>\n`;
    xml += `    <Nome>${escapeXML(record.employee_full_name.split(' ').slice(1).join(' '))}</Nome>\n`;
    
    // Periodo nel mese
    xml += '    <PeriodoNelMese>\n';
    xml += `      <ImponibilePrevidenziale>${record.gross_total.toFixed(2)}</ImponibilePrevidenziale>\n`;
    xml += `      <ContributiINPS>${record.inps_contribution.toFixed(2)}</ContributiINPS>\n`;
    xml += `      <ImponibileFiscale>${record.gross_total.toFixed(2)}</ImponibileFiscale>\n`;
    xml += `      <RitenuteIRPEF>${record.irpef_tax.toFixed(2)}</RitenuteIRPEF>\n`;
    xml += `      <NettoInBusta>${record.net_salary.toFixed(2)}</NettoInBusta>\n`;
    xml += '    </PeriodoNelMese>\n';
    
    xml += '  </DenunciaIndividuale>\n';
  });
  
  // Riepilogo contributivo
  const totalGross = payrollRecords.reduce((sum, r) => sum + r.gross_total, 0);
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  const employerINPS = totalINPS * 2.1;
  
  xml += '  <RiepilogoContributivo>\n';
  xml += `    <NumeroDipendenti>${payrollRecords.length}</NumeroDipendenti>\n`;
  xml += `    <TotaleImponibilePrevidenziale>${totalGross.toFixed(2)}</TotaleImponibilePrevidenziale>\n`;
  xml += `    <TotaleContributiDipendenti>${totalINPS.toFixed(2)}</TotaleContributiDipendenti>\n`;
  xml += `    <TotaleContributiDatoreLavoro>${employerINPS.toFixed(2)}</TotaleContributiDatoreLavoro>\n`;
  xml += `    <TotaleContributiINPS>${(totalINPS + employerINPS).toFixed(2)}</TotaleContributiINPS>\n`;
  xml += `    <TotaleRitenuteIRPEF>${totalIRPEF.toFixed(2)}</TotaleRitenuteIRPEF>\n`;
  xml += '  </RiepilogoContributivo>\n';
  
  xml += '</ListaPosPA>';
  
  // Download XML
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `UNIEMENS_${year}${monthNum}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function for XML escaping
const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const generateUNIEMENS = async (
  month: string,
  companyCode: string,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  // Generate both PDF and XML
  generateUNIEMENSXML(month, companyCode, payrollRecords, companyData);
  
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
    "",
    "NOTA: È stato generato anche il file XML corrispondente per l'invio telematico.",
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

  // Upload to storage and FTP
  const fileName = `UNIEMENS_ListaPosPA_${monthNum}_${year}.pdf`;
  try {
    await uploadDocumentToStorageAndFTP({
      fileName,
      category: "uniemens",
      companyId: companyData.id,
      pdfDoc: doc,
    });
  } catch (error) {
    console.error("Error uploading to storage:", error);
  }
};

export const generateF24 = async (
  month: string,
  paymentType: string,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  const [year, monthNum] = month.split("-");
  
  // Calcoli totali
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  const totalDebito = totalIRPEF + totalINPS;
  
  // Layout constants
  const margin = 10;
  const pageWidth = 210; // A4 width in mm
  const contentWidth = pageWidth - (margin * 2);
  
  // === INTESTAZIONE ===
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("MOD. F24 – 2013 EURO", margin, 10);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("MODELLO DI PAGAMENTO UNIFICATO", margin, 18);
  
  // Box F24 a destra
  doc.setFontSize(18);
  doc.rect(165, 8, 35, 12);
  doc.text("F24", 182, 16, { align: "center" });
  
  // === CONTRIBUENTE ===
  let yPos = 25;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, contentWidth, 6, "FD");
  doc.text("CONTRIBUENTE", margin + 2, yPos + 4);
  
  yPos += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CODICE FISCALE", margin, yPos);
  
  // Box per codice fiscale
  doc.rect(margin + 35, yPos - 3, 80, 6);
  doc.setFont("helvetica", "bold");
  doc.text(companyData.vat_number || "", margin + 37, yPos + 1);
  
  // Checkbox anno non coincidente
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.rect(margin + 120, yPos - 3, 3, 3);
  doc.text("barrare in caso di anno d'imposta non coincidente con anno solare", margin + 125, yPos);
  
  // === DATI ANAGRAFICI ===
  yPos += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DATI ANAGRAFICI", margin, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("cognome, denominazione o ragione sociale", margin, yPos);
  doc.rect(margin, yPos + 1, contentWidth * 0.65, 6);
  doc.setFont("helvetica", "bold");
  doc.text(companyData.name, margin + 2, yPos + 5);
  
  doc.setFont("helvetica", "normal");
  doc.text("nome", margin + contentWidth * 0.67, yPos);
  doc.rect(margin + contentWidth * 0.67, yPos + 1, contentWidth * 0.33, 6);
  
  // === DOMICILIO FISCALE ===
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.text("DOMICILIO FISCALE", margin, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("comune", margin, yPos);
  doc.rect(margin, yPos + 1, 70, 6);
  
  doc.text("prov.", margin + 72, yPos);
  doc.rect(margin + 72, yPos + 1, 10, 6);
  
  doc.text("via e numero civico", margin + 84, yPos);
  doc.rect(margin + 84, yPos + 1, contentWidth - 84, 6);
  if (companyData.address) {
    doc.text(companyData.address, margin + 86, yPos + 5);
  }
  
  // === SEZIONE ERARIO ===
  yPos += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, contentWidth, 6, "FD");
  doc.text("SEZIONE ERARIO", margin + 2, yPos + 4);
  
  yPos += 8;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("IMPOSTE DIRETTE – IVA – RITENUTE ALLA FONTE – ALTRI TRIBUTI ED INTERESSI", margin, yPos);
  
  // Intestazione tabella
  yPos += 3;
  const colWidths = [25, 35, 20, 30, 30];
  const startX = margin;
  
  doc.setFontSize(6);
  doc.rect(startX, yPos, colWidths[0], 8);
  doc.text("codice tributo", startX + 1, yPos + 3);
  
  doc.rect(startX + colWidths[0], yPos, colWidths[1], 8);
  doc.text("rateazione/regione/", startX + colWidths[0] + 1, yPos + 2);
  doc.text("prov./mese rif.", startX + colWidths[0] + 1, yPos + 5);
  
  doc.rect(startX + colWidths[0] + colWidths[1], yPos, colWidths[2], 8);
  doc.text("anno di", startX + colWidths[0] + colWidths[1] + 1, yPos + 2);
  doc.text("riferimento", startX + colWidths[0] + colWidths[1] + 1, yPos + 5);
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], 8);
  doc.text("importi a debito", startX + colWidths[0] + colWidths[1] + colWidths[2] + 1, yPos + 2);
  doc.text("versati", startX + colWidths[0] + colWidths[1] + colWidths[2] + 1, yPos + 5);
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, colWidths[4], 8);
  doc.text("importi a credito", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 1, yPos + 2);
  doc.text("compensati", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 1, yPos + 5);
  
  // Riga dati IRPEF
  yPos += 8;
  doc.setFontSize(8);
  doc.rect(startX, yPos, colWidths[0], 6);
  doc.text("1001", startX + 2, yPos + 4);
  
  doc.rect(startX + colWidths[0], yPos, colWidths[1], 6);
  doc.text(`${monthNum}`, startX + colWidths[0] + 2, yPos + 4);
  
  doc.rect(startX + colWidths[0] + colWidths[1], yPos, colWidths[2], 6);
  doc.text(year, startX + colWidths[0] + colWidths[1] + 2, yPos + 4);
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], 6);
  doc.text(totalIRPEF.toFixed(2), startX + colWidths[0] + colWidths[1] + colWidths[2] + 25, yPos + 4, { align: "right" });
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, colWidths[4], 6);
  
  // Righe vuote per altri tributi
  for (let i = 0; i < 3; i++) {
    yPos += 6;
    doc.rect(startX, yPos, colWidths[0], 6);
    doc.rect(startX + colWidths[0], yPos, colWidths[1], 6);
    doc.rect(startX + colWidths[0] + colWidths[1], yPos, colWidths[2], 6);
    doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], 6);
    doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, colWidths[4], 6);
  }
  
  // Riga TOTALE ERARIO
  yPos += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.rect(startX, yPos, colWidths[0] + colWidths[1] + colWidths[2], 6);
  doc.text("SALDO (A-B)", startX + 2, yPos + 4);
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], 6);
  doc.text("TOTALE", startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPos + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(totalIRPEF.toFixed(2), startX + colWidths[0] + colWidths[1] + colWidths[2] + 25, yPos + 4, { align: "right" });
  
  doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, colWidths[4], 6);
  doc.setFontSize(7);
  doc.text("A", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPos + 4);
  doc.text("B", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 20, yPos + 4);
  
  // === SEZIONE INPS ===
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, contentWidth, 6, "FD");
  doc.text("SEZIONE INPS", margin + 2, yPos + 4);
  
  yPos += 8;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  
  // Intestazione INPS
  const inpsColWidths = [15, 15, 35, 15, 15, 35, 30];
  const inpsStartX = margin;
  
  doc.rect(inpsStartX, yPos, inpsColWidths[0], 8);
  doc.text("codice", inpsStartX + 1, yPos + 2);
  doc.text("sede", inpsStartX + 1, yPos + 5);
  
  doc.rect(inpsStartX + inpsColWidths[0], yPos, inpsColWidths[1], 8);
  doc.text("causale", inpsStartX + inpsColWidths[0] + 1, yPos + 3);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1], yPos, inpsColWidths[2], 8);
  doc.text("matricola INPS/codice INPS/", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + 1, yPos + 2);
  doc.text("sede contributo", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + 1, yPos + 5);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2], yPos, inpsColWidths[3], 8);
  doc.text("filiale", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + 1, yPos + 2);
  doc.text("azienda", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + 1, yPos + 5);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3], yPos, inpsColWidths[4], 8);
  doc.text("periodo di riferimento:", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + 1, yPos + 2);
  doc.text("da mm/aaaa", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + 1, yPos + 5);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4], yPos, inpsColWidths[5], 8);
  doc.text("a mm/aaaa", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + 1, yPos + 2);
  doc.text("importi a debito", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + 1, yPos + 5);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + inpsColWidths[5], yPos, inpsColWidths[6], 8);
  doc.text("importi a credito", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + inpsColWidths[5] + 1, yPos + 2);
  doc.text("compensati", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + inpsColWidths[5] + 1, yPos + 5);
  
  // Riga dati INPS
  yPos += 8;
  doc.setFontSize(8);
  doc.rect(inpsStartX, yPos, inpsColWidths[0], 6);
  
  doc.rect(inpsStartX + inpsColWidths[0], yPos, inpsColWidths[1], 6);
  doc.text("M001", inpsStartX + inpsColWidths[0] + 1, yPos + 4);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1], yPos, inpsColWidths[2], 6);
  doc.text(companyData.vat_number?.substring(0, 16) || "", inpsStartX + inpsColWidths[0] + inpsColWidths[1] + 1, yPos + 4);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2], yPos, inpsColWidths[3], 6);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3], yPos, inpsColWidths[4], 6);
  doc.text(`${monthNum}/${year}`, inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + 1, yPos + 4);
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4], yPos, inpsColWidths[5], 6);
  doc.text(totalINPS.toFixed(2), inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + 30, yPos + 4, { align: "right" });
  
  doc.rect(inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4] + inpsColWidths[5], yPos, inpsColWidths[6], 6);
  
  // Righe vuote INPS
  for (let i = 0; i < 2; i++) {
    yPos += 6;
    for (let j = 0; j < inpsColWidths.length; j++) {
      const xPos = inpsStartX + inpsColWidths.slice(0, j).reduce((a, b) => a + b, 0);
      doc.rect(xPos, yPos, inpsColWidths[j], 6);
    }
  }
  
  // Riga TOTALE INPS
  yPos += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const inpsTotalStartX = inpsStartX + inpsColWidths[0] + inpsColWidths[1] + inpsColWidths[2] + inpsColWidths[3] + inpsColWidths[4];
  doc.rect(inpsStartX, yPos, inpsTotalStartX - inpsStartX, 6);
  doc.text("SALDO (C-D)", inpsStartX + 2, yPos + 4);
  
  doc.rect(inpsTotalStartX, yPos, inpsColWidths[5], 6);
  doc.text("TOTALE", inpsTotalStartX + 2, yPos + 4);
  doc.setFontSize(8);
  doc.text(totalINPS.toFixed(2), inpsTotalStartX + 30, yPos + 4, { align: "right" });
  
  doc.rect(inpsTotalStartX + inpsColWidths[5], yPos, inpsColWidths[6], 6);
  doc.setFontSize(7);
  doc.text("C", inpsTotalStartX + inpsColWidths[5] + 2, yPos + 4);
  doc.text("D", inpsTotalStartX + inpsColWidths[5] + 20, yPos + 4);
  
  // === SEZIONE REGIONI (vuota) ===
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, contentWidth, 6, "FD");
  doc.text("SEZIONE REGIONI", margin + 2, yPos + 4);
  
  yPos += 8;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  
  const regionColWidths = [20, 25, 30, 20, 30, 30];
  let regionX = margin;
  
  doc.rect(regionX, yPos, regionColWidths[0], 8);
  doc.text("codice", regionX + 1, yPos + 2);
  doc.text("regione", regionX + 1, yPos + 5);
  
  regionX += regionColWidths[0];
  doc.rect(regionX, yPos, regionColWidths[1], 8);
  doc.text("codice tributo", regionX + 1, yPos + 3);
  
  regionX += regionColWidths[1];
  doc.rect(regionX, yPos, regionColWidths[2], 8);
  doc.text("rateazione/", regionX + 1, yPos + 2);
  doc.text("mese rif.", regionX + 1, yPos + 5);
  
  regionX += regionColWidths[2];
  doc.rect(regionX, yPos, regionColWidths[3], 8);
  doc.text("anno di", regionX + 1, yPos + 2);
  doc.text("riferimento", regionX + 1, yPos + 5);
  
  regionX += regionColWidths[3];
  doc.rect(regionX, yPos, regionColWidths[4], 8);
  doc.text("importi a debito", regionX + 1, yPos + 2);
  doc.text("versati", regionX + 1, yPos + 5);
  
  regionX += regionColWidths[4];
  doc.rect(regionX, yPos, regionColWidths[5], 8);
  doc.text("importi a credito", regionX + 1, yPos + 2);
  doc.text("compensati", regionX + 1, yPos + 5);
  
  // Riga vuota
  yPos += 8;
  regionX = margin;
  for (let i = 0; i < regionColWidths.length; i++) {
    doc.rect(regionX, yPos, regionColWidths[i], 6);
    regionX += regionColWidths[i];
  }
  
  // Totale regioni
  yPos += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  regionX = margin;
  const regionTotalWidth = regionColWidths[0] + regionColWidths[1] + regionColWidths[2] + regionColWidths[3];
  doc.rect(regionX, yPos, regionTotalWidth, 6);
  doc.text("SALDO (E-F)", regionX + 2, yPos + 4);
  
  regionX += regionTotalWidth;
  doc.rect(regionX, yPos, regionColWidths[4], 6);
  doc.text("TOTALE", regionX + 2, yPos + 4);
  
  regionX += regionColWidths[4];
  doc.rect(regionX, yPos, regionColWidths[5], 6);
  doc.text("E", regionX + 2, yPos + 4);
  doc.text("F", regionX + 20, yPos + 4);
  
  // === SALDO FINALE ===
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SALDO FINALE", margin, yPos);
  
  yPos += 2;
  doc.setFontSize(8);
  doc.text("TOTALE M", margin + 100, yPos);
  doc.rect(margin + 125, yPos - 3, 30, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(totalDebito.toFixed(2), margin + 150, yPos + 2, { align: "right" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("SALDO FINALE N", margin + 160, yPos);
  doc.rect(margin + 160, yPos - 3, 3, 3);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.text("EURO +", margin + 125, yPos);
  
  // === FIRMA ===
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FIRMA", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.line(margin + 15, yPos, margin + 80, yPos);
  
  // === ESTREMI DEL VERSAMENTO ===
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, contentWidth, 6, "FD");
  doc.text("ESTREMI DEL VERSAMENTO", margin + 2, yPos + 4);
  
  yPos += 8;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("(DA COMPILARE A CURA DI BANCA/POSTE/AGENTE DELLA RISCOSSIONE)", margin, yPos);
  
  yPos += 5;
  doc.text("DATA", margin, yPos);
  doc.rect(margin + 15, yPos - 3, 30, 6);
  
  doc.text("CODICE BANCA/POSTE/AGENTE DELLA RISCOSSIONE", margin + 50, yPos);
  doc.rect(margin + 125, yPos - 3, 20, 6);
  
  yPos += 8;
  doc.text("Pagamento effettuato con assegno bancario/postale", margin, yPos);
  doc.rect(margin, yPos - 3, 3, 3);
  
  doc.text("AZIENDA", margin + 70, yPos);
  doc.rect(margin + 85, yPos - 3, 30, 6);
  
  doc.text("CAB/SPORTELLO", margin + 120, yPos);
  doc.rect(margin + 145, yPos - 3, 25, 6);
  
  doc.text("n.ro", margin + 172, yPos);
  doc.rect(margin + 180, yPos - 3, 15, 6);
  
  // Note in fondo
  yPos += 12;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(`Periodo di riferimento: ${monthNum}/${year} - ${paymentType}`, margin, yPos);
  yPos += 4;
  doc.text(`Data elaborazione: ${new Date().toLocaleDateString("it-IT")}`, margin, yPos);
  yPos += 4;
  doc.text("ATTENZIONE: Il modello F24 deve essere presentato esclusivamente in via telematica", margin, yPos);
  yPos += 3;
  doc.text("tramite i servizi telematici dell'Agenzia delle Entrate, home banking o intermediari abilitati.", margin, yPos);
  
  // Footer
  doc.setFontSize(7);
  doc.text(`${companyData.name} - F24 ${monthNum}/${year}`, 105, 290, { align: "center" });
  
  doc.save(`F24_${monthNum}_${year}.pdf`);

  // Upload to storage and FTP
  const fileName = `F24_${monthNum}_${year}.pdf`;
  try {
    await uploadDocumentToStorageAndFTP({
      fileName,
      category: "f24",
      companyId: companyData.id,
      pdfDoc: doc,
    });
  } catch (error) {
    console.error("Error uploading to storage:", error);
  }
};

export const generateModello770 = async (
  year: number,
  simplified: boolean,
  payrollRecords: PayrollData[],
  companyData: CompanyData
) => {
  const doc = new jsPDF();
  
  // === FRONTESPIZIO ===
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MODELLO 770/" + year, 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(simplified ? "DICHIARAZIONE SEMPLIFICATA" : "DICHIARAZIONE ORDINARIA", 105, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Dichiarazione del sostituto d'imposta", 105, 35, { align: "center" });
  
  // Dati del sostituto d'imposta
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DATI DEL SOSTITUTO D'IMPOSTA", 20, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Denominazione: ${companyData.name}`, 20, 58);
  doc.text(`Codice Fiscale / P.IVA: ${companyData.vat_number || "N/A"}`, 20, 65);
  doc.text(`Indirizzo: ${companyData.address || "N/A"}`, 20, 72);
  doc.text(`Anno d'imposta: ${year}`, 20, 79);
  
  // Calcoli
  const totalGross = payrollRecords.reduce((sum, r) => sum + r.gross_total, 0);
  const totalIRPEF = payrollRecords.reduce((sum, r) => sum + r.irpef_tax, 0);
  const totalINPS = payrollRecords.reduce((sum, r) => sum + r.inps_contribution, 0);
  const totalNet = payrollRecords.reduce((sum, r) => sum + r.net_salary, 0);
  const totalEmployees = payrollRecords.length;
  
  // === QUADRO ST - RITENUTE OPERATE ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUADRO ST - RITENUTE ALLA FONTE OPERATE", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Redditi di lavoro dipendente e assimilati", 20, 30);
  
  autoTable(doc, {
    startY: 38,
    head: [["Descrizione", "Importo (€)"]],
    body: [
      ["Numero percettori", totalEmployees.toString()],
      ["Ammontare complessivo delle somme erogate", totalGross.toFixed(2)],
      ["Ammontare imponibile", totalGross.toFixed(2)],
      ["Ritenute IRPEF operate nell'anno", totalIRPEF.toFixed(2)],
      ["Ritenute sospese", "0.00"],
      ["Ritenute versate", totalIRPEF.toFixed(2)],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // === QUADRO SX - RIEPILOGO CERTIFICAZIONI ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUADRO SX - RIEPILOGO CERTIFICAZIONI", 20, 20);
  
  const employeeData = payrollRecords.map((record) => [
    record.employee_full_name,
    record.gross_total.toFixed(2),
    record.inps_contribution.toFixed(2),
    record.irpef_tax.toFixed(2),
    record.net_salary.toFixed(2),
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [["Dipendente", "Lordo", "Contributi", "IRPEF", "Netto"]],
    body: employeeData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });
  
  // === QUADRO SY - DATI CONTRIBUTIVI ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUADRO SY - DATI CONTRIBUTIVI", 20, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [["Descrizione", "Importo (€)"]],
    body: [
      ["Totale contributi previdenziali dipendenti", totalINPS.toFixed(2)],
      ["Contributi INPS versati", totalINPS.toFixed(2)],
      ["Base imponibile contributiva", totalGross.toFixed(2)],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // === QUADRO SZ - PROSPETTO RIEPILOGATIVO ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUADRO SZ - PROSPETTO RIEPILOGATIVO", 20, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [["Voce", "Importo (€)"]],
    body: [
      ["Totale redditi erogati", totalGross.toFixed(2)],
      ["Totale ritenute IRPEF operate", totalIRPEF.toFixed(2)],
      ["Totale ritenute versate", totalIRPEF.toFixed(2)],
      ["Totale contributi previdenziali", totalINPS.toFixed(2)],
      ["Numero totale dipendenti", totalEmployees.toString()],
      ["Netti complessivamente erogati", totalNet.toFixed(2)],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
    foot: [["TOTALE DA DICHIARARE", totalIRPEF.toFixed(2)]],
  });
  
  // === NOTE FINALI ===
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NOTE E INFORMAZIONI", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let yPos = 35;
  
  const notes = [
    "Il Modello 770 è la dichiarazione dei sostituti d'imposta.",
    "",
    "Contenuto della dichiarazione:",
    "- Quadro ST: Ritenute operate su redditi da lavoro dipendente",
    "- Quadro SX: Riepilogo delle certificazioni rilasciate (CU)",
    "- Quadro SY: Dati contributivi e previdenziali",
    "- Quadro SZ: Prospetto riepilogativo generale",
    "",
    "Termini di presentazione:",
    simplified 
      ? "- Modello Semplificato: entro il 31 ottobre dell'anno successivo"
      : "- Modello Ordinario: entro il 31 ottobre dell'anno successivo",
    "",
    "Modalità di invio: Esclusivamente in via telematica",
    "",
    `Data elaborazione: ${new Date().toLocaleDateString("it-IT")}`,
    "",
    "ATTENZIONE: Questo documento è stato generato automaticamente",
    "e deve essere verificato prima dell'invio all'Agenzia delle Entrate.",
  ];
  
  notes.forEach((note) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
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
      `Modello 770/${year} - ${companyData.name} - Pag. ${i}/${pageCount}`,
      105,
      285,
      { align: "center" }
    );
  }
  
  doc.save(`Modello770_${year}_${simplified ? 'Semplificato' : 'Ordinario'}.pdf`);

  // Upload to storage and FTP
  const fileName = `Modello770_${year}_${simplified ? 'Semplificato' : 'Ordinario'}.pdf`;
  try {
    await uploadDocumentToStorageAndFTP({
      fileName,
      category: "modello_770",
      companyId: companyData.id,
      pdfDoc: doc,
    });
  } catch (error) {
    console.error("Error uploading to storage:", error);
  }
};

export const generateCertificazioneUnica = async (
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

  // Upload to storage and FTP
  const fileName = `CU_${year}.pdf`;
  try {
    await uploadDocumentToStorageAndFTP({
      fileName,
      category: "certificazione_unica",
      companyId: companyData.id,
      pdfDoc: doc,
    });
  } catch (error) {
    console.error("Error uploading to storage:", error);
  }
};

export const generateAutoliquidazioneINAIL = async (
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

  // Upload to storage and FTP
  const fileName = `Autoliquidazione_INAIL_${year}.pdf`;
  try {
    await uploadDocumentToStorageAndFTP({
      fileName,
      category: "autoliquidazione_inail",
      companyId: companyData.id,
      pdfDoc: doc,
    });
  } catch (error) {
    console.error("Error uploading to storage:", error);
  }
};
