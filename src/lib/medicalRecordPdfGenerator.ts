import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface MedicalRecord {
  id: string;
  employee_id: string;
  status: string;
  opened_at: string;
  closed_at?: string;
  work_history?: string;
  personal_history?: string;
  family_history?: string;
  remote_pathology?: string;
  recent_pathology?: string;
  notes?: string;
  employees?: {
    full_name: string;
    tax_code: string;
    birth_date: string;
    employee_type: string;
  };
  medical_protocols?: {
    name: string;
    description: string;
  };
}

interface MedicalVisit {
  scheduled_date: string;
  completed_date?: string;
  visit_type: string;
  status: string;
  doctor_name?: string;
  objective_examination?: string;
  notes?: string;
}

interface FitnessJudgment {
  judgment_date: string;
  expiry_date?: string;
  judgment_type: string;
  prescriptions?: string;
  limitations?: string;
}

export const generateMedicalRecordPDF = (
  record: MedicalRecord,
  visits: MedicalVisit[],
  judgments: FitnessJudgment[]
) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CARTELLA SANITARIA", 105, yPosition, { align: "center" });
  yPosition += 15;

  // Employee Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DATI ANAGRAFICI", 20, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const employeeInfo = [
    ["Nome Completo:", record.employees?.full_name || "N/A"],
    ["Codice Fiscale:", record.employees?.tax_code || "N/A"],
    ["Data di Nascita:", record.employees?.birth_date ? format(new Date(record.employees.birth_date), "dd/MM/yyyy") : "N/A"],
    ["Mansione:", record.employees?.employee_type || "N/A"],
  ];

  employeeInfo.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Medical Record Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INFORMAZIONI CARTELLA", 20, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const recordInfo = [
    ["Stato:", record.status === "active" ? "Attiva" : "Chiusa"],
    ["Data Apertura:", format(new Date(record.opened_at), "dd/MM/yyyy")],
    ["Protocollo:", record.medical_protocols?.name || "N/A"],
  ];

  recordInfo.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, yPosition);
    yPosition += 6;
  });

  // Anamnesis Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ANAMNESI", 20, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (record.work_history) {
    doc.text("Anamnesi Lavorativa:", 20, yPosition);
    yPosition += 6;
    const workLines = doc.splitTextToSize(record.work_history, 170);
    doc.text(workLines, 20, yPosition);
    yPosition += workLines.length * 5 + 5;
  }

  if (record.personal_history) {
    doc.text("Anamnesi Personale:", 20, yPosition);
    yPosition += 6;
    const personalLines = doc.splitTextToSize(record.personal_history, 170);
    doc.text(personalLines, 20, yPosition);
    yPosition += personalLines.length * 5 + 5;
  }

  if (record.family_history) {
    doc.text("Anamnesi Familiare:", 20, yPosition);
    yPosition += 6;
    const familyLines = doc.splitTextToSize(record.family_history, 170);
    doc.text(familyLines, 20, yPosition);
    yPosition += familyLines.length * 5 + 5;
  }

  // Medical Visits
  if (visits.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("VISITE MEDICHE EFFETTUATE", 20, yPosition);
    yPosition += 10;

    const visitData = visits.map((visit) => [
      format(new Date(visit.scheduled_date), "dd/MM/yyyy"),
      visit.visit_type,
      visit.status === "completed" ? "Completata" : visit.status === "scheduled" ? "Programmata" : "Annullata",
      visit.doctor_name || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Tipo", "Stato", "Medico"]],
      body: visitData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Fitness Judgments
  if (judgments.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("GIUDIZI DI IDONEITÀ", 20, yPosition);
    yPosition += 10;

    const judgmentData = judgments.map((judgment) => [
      format(new Date(judgment.judgment_date), "dd/MM/yyyy"),
      judgment.judgment_type,
      judgment.expiry_date ? format(new Date(judgment.expiry_date), "dd/MM/yyyy") : "-",
      judgment.limitations || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Tipo", "Scadenza", "Limitazioni"]],
      body: judgmentData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Pagina ${i} di ${pageCount} - Generato il ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      105,
      290,
      { align: "center" }
    );
  }

  return doc;
};
