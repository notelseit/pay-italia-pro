/**
 * Utility per calcolare i giorni festivi italiani per un dato anno.
 * Include tutte le festività nazionali + Pasquetta (calcolo dinamico).
 */

/** Calcolo della Pasqua con l'algoritmo di Gauss/Anonymous */
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export interface ItalianHoliday {
  date: Date;
  name: string;
}

/**
 * Restituisce la lista dei giorni festivi italiani per l'anno specificato.
 * @param year Anno di riferimento
 * @param patronDate Data del santo patrono locale (opzionale, formato "MM-DD")
 */
export function getItalianHolidays(year: number, patronDate?: string): ItalianHoliday[] {
  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const holidays: ItalianHoliday[] = [
    { date: new Date(year, 0, 1), name: "Capodanno" },
    { date: new Date(year, 0, 6), name: "Epifania" },
    { date: easterMonday, name: "Lunedì dell'Angelo" },
    { date: new Date(year, 3, 25), name: "Festa della Liberazione" },
    { date: new Date(year, 4, 1), name: "Festa del Lavoro" },
    { date: new Date(year, 5, 2), name: "Festa della Repubblica" },
    { date: new Date(year, 7, 15), name: "Ferragosto" },
    { date: new Date(year, 10, 1), name: "Tutti i Santi" },
    { date: new Date(year, 11, 8), name: "Immacolata Concezione" },
    { date: new Date(year, 11, 25), name: "Natale" },
    { date: new Date(year, 11, 26), name: "Santo Stefano" },
  ];

  if (patronDate) {
    const [mm, dd] = patronDate.split("-").map(Number);
    if (mm && dd) {
      holidays.push({
        date: new Date(year, mm - 1, dd),
        name: "Santo Patrono",
      });
    }
  }

  return holidays;
}

/**
 * Verifica se una data è un giorno festivo italiano.
 */
export function isItalianHoliday(date: Date, year: number, patronDate?: string): boolean {
  const holidays = getItalianHolidays(year, patronDate);
  return holidays.some(
    (h) =>
      h.date.getFullYear() === date.getFullYear() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getDate() === date.getDate()
  );
}

/**
 * Restituisce il nome del festivo per una data, o null se non è festivo.
 */
export function getHolidayName(date: Date, year: number, patronDate?: string): string | null {
  const holidays = getItalianHolidays(year, patronDate);
  const found = holidays.find(
    (h) =>
      h.date.getFullYear() === date.getFullYear() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getDate() === date.getDate()
  );
  return found?.name ?? null;
}
