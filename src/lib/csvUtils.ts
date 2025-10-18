import { PresenceRecord } from "@/hooks/usePresence";

export const exportPresenceToCSV = (records: PresenceRecord[], month: number, year: number) => {
  const headers = [
    "Dipendente",
    "Giorni Lavorativi",
    "Giorni Ferie",
    "Giorni Malattia",
    "Altre Assenze",
    "Ore Straordinarie",
    "Stato",
  ];

  const rows = records.map((record) => [
    record.employees?.full_name || "",
    record.working_days,
    record.vacation_days,
    record.sick_days,
    record.other_absences,
    record.overtime_hours,
    record.is_validated ? "Validato" : "In Attesa",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `presenze_${month}_${year}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error("File CSV vuoto o non valido"));
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          
          return row;
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Errore nella lettura del file"));
    reader.readAsText(file);
  });
};
