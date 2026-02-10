/**
 * Aliquote addizionali regionali e comunali italiane 2025
 * Dati statici per il simulatore di costo azienda
 */

export interface RegionalBracket {
  min: number;
  max: number;
  rate: number;
}

export interface RegionData {
  name: string;
  brackets: RegionalBracket[];
}

export interface MunicipalityData {
  name: string;
  region: string;
  rate: number;
}

/**
 * Addizionali regionali IRPEF 2025 per scaglioni di reddito
 * Fonte: normativa regionale vigente (valori medi/rappresentativi)
 */
export const REGIONAL_TAX_RATES: Record<string, RegionData> = {
  abruzzo: {
    name: "Abruzzo",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 50000, rate: 0.0170 },
      { min: 50000, max: Infinity, rate: 0.0173 },
    ],
  },
  basilicata: {
    name: "Basilicata",
    brackets: [{ min: 0, max: Infinity, rate: 0.0123 }],
  },
  calabria: {
    name: "Calabria",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0173 },
      { min: 28000, max: 55000, rate: 0.0203 },
      { min: 55000, max: Infinity, rate: 0.0233 },
    ],
  },
  campania: {
    name: "Campania",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0173 },
      { min: 28000, max: 55000, rate: 0.0203 },
      { min: 55000, max: Infinity, rate: 0.0233 },
    ],
  },
  emilia_romagna: {
    name: "Emilia-Romagna",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0173 },
      { min: 55000, max: 75000, rate: 0.0193 },
      { min: 75000, max: Infinity, rate: 0.0213 },
    ],
  },
  friuli_venezia_giulia: {
    name: "Friuli Venezia Giulia",
    brackets: [{ min: 0, max: Infinity, rate: 0.0070 }],
  },
  lazio: {
    name: "Lazio",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0193 },
      { min: 28000, max: 55000, rate: 0.0253 },
      { min: 55000, max: 75000, rate: 0.0293 },
      { min: 75000, max: Infinity, rate: 0.0333 },
    ],
  },
  liguria: {
    name: "Liguria",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0173 },
      { min: 55000, max: Infinity, rate: 0.0223 },
    ],
  },
  lombardia: {
    name: "Lombardia",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0158 },
      { min: 28000, max: 55000, rate: 0.0172 },
      { min: 55000, max: 75000, rate: 0.0173 },
      { min: 75000, max: Infinity, rate: 0.0173 },
    ],
  },
  marche: {
    name: "Marche",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0170 },
      { min: 55000, max: Infinity, rate: 0.0173 },
    ],
  },
  molise: {
    name: "Molise",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0193 },
      { min: 55000, max: Infinity, rate: 0.0213 },
    ],
  },
  piemonte: {
    name: "Piemonte",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0203 },
      { min: 28000, max: 55000, rate: 0.0225 },
      { min: 55000, max: 75000, rate: 0.0258 },
      { min: 75000, max: Infinity, rate: 0.0333 },
    ],
  },
  puglia: {
    name: "Puglia",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0168 },
      { min: 55000, max: 75000, rate: 0.0178 },
      { min: 75000, max: Infinity, rate: 0.0203 },
    ],
  },
  sardegna: {
    name: "Sardegna",
    brackets: [{ min: 0, max: Infinity, rate: 0.0123 }],
  },
  sicilia: {
    name: "Sicilia",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0170 },
      { min: 55000, max: Infinity, rate: 0.0173 },
    ],
  },
  toscana: {
    name: "Toscana",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0163 },
      { min: 55000, max: 75000, rate: 0.0168 },
      { min: 75000, max: Infinity, rate: 0.0173 },
    ],
  },
  trentino_alto_adige: {
    name: "Trentino-Alto Adige",
    brackets: [{ min: 0, max: Infinity, rate: 0.0123 }],
  },
  umbria: {
    name: "Umbria",
    brackets: [
      { min: 0, max: 15000, rate: 0.0123 },
      { min: 15000, max: 28000, rate: 0.0153 },
      { min: 28000, max: 55000, rate: 0.0173 },
      { min: 55000, max: Infinity, rate: 0.0183 },
    ],
  },
  valle_d_aosta: {
    name: "Valle d'Aosta",
    brackets: [{ min: 0, max: Infinity, rate: 0.0123 }],
  },
  veneto: {
    name: "Veneto",
    brackets: [{ min: 0, max: Infinity, rate: 0.0123 }],
  },
};

/**
 * Aliquote comunali medie per i principali capoluoghi (2025)
 */
export const MUNICIPAL_TAX_RATES: Record<string, MunicipalityData[]> = {
  abruzzo: [
    { name: "L'Aquila", region: "abruzzo", rate: 0.008 },
    { name: "Pescara", region: "abruzzo", rate: 0.008 },
    { name: "Chieti", region: "abruzzo", rate: 0.008 },
    { name: "Teramo", region: "abruzzo", rate: 0.007 },
  ],
  basilicata: [
    { name: "Potenza", region: "basilicata", rate: 0.008 },
    { name: "Matera", region: "basilicata", rate: 0.008 },
  ],
  calabria: [
    { name: "Catanzaro", region: "calabria", rate: 0.008 },
    { name: "Cosenza", region: "calabria", rate: 0.008 },
    { name: "Reggio Calabria", region: "calabria", rate: 0.008 },
  ],
  campania: [
    { name: "Napoli", region: "campania", rate: 0.009 },
    { name: "Salerno", region: "campania", rate: 0.008 },
    { name: "Caserta", region: "campania", rate: 0.008 },
  ],
  emilia_romagna: [
    { name: "Bologna", region: "emilia_romagna", rate: 0.008 },
    { name: "Modena", region: "emilia_romagna", rate: 0.007 },
    { name: "Parma", region: "emilia_romagna", rate: 0.007 },
    { name: "Reggio Emilia", region: "emilia_romagna", rate: 0.007 },
    { name: "Rimini", region: "emilia_romagna", rate: 0.008 },
  ],
  friuli_venezia_giulia: [
    { name: "Trieste", region: "friuli_venezia_giulia", rate: 0.008 },
    { name: "Udine", region: "friuli_venezia_giulia", rate: 0.006 },
  ],
  lazio: [
    { name: "Roma", region: "lazio", rate: 0.009 },
    { name: "Latina", region: "lazio", rate: 0.008 },
    { name: "Frosinone", region: "lazio", rate: 0.008 },
  ],
  liguria: [
    { name: "Genova", region: "liguria", rate: 0.008 },
    { name: "La Spezia", region: "liguria", rate: 0.008 },
    { name: "Savona", region: "liguria", rate: 0.007 },
  ],
  lombardia: [
    { name: "Milano", region: "lombardia", rate: 0.008 },
    { name: "Brescia", region: "lombardia", rate: 0.008 },
    { name: "Bergamo", region: "lombardia", rate: 0.006 },
    { name: "Monza", region: "lombardia", rate: 0.008 },
    { name: "Como", region: "lombardia", rate: 0.008 },
  ],
  marche: [
    { name: "Ancona", region: "marche", rate: 0.008 },
    { name: "Pesaro", region: "marche", rate: 0.008 },
  ],
  molise: [
    { name: "Campobasso", region: "molise", rate: 0.008 },
    { name: "Isernia", region: "molise", rate: 0.007 },
  ],
  piemonte: [
    { name: "Torino", region: "piemonte", rate: 0.008 },
    { name: "Novara", region: "piemonte", rate: 0.008 },
    { name: "Alessandria", region: "piemonte", rate: 0.008 },
  ],
  puglia: [
    { name: "Bari", region: "puglia", rate: 0.008 },
    { name: "Lecce", region: "puglia", rate: 0.008 },
    { name: "Taranto", region: "puglia", rate: 0.008 },
  ],
  sardegna: [
    { name: "Cagliari", region: "sardegna", rate: 0.006 },
    { name: "Sassari", region: "sardegna", rate: 0.005 },
  ],
  sicilia: [
    { name: "Palermo", region: "sicilia", rate: 0.008 },
    { name: "Catania", region: "sicilia", rate: 0.008 },
    { name: "Messina", region: "sicilia", rate: 0.008 },
  ],
  toscana: [
    { name: "Firenze", region: "toscana", rate: 0.009 },
    { name: "Pisa", region: "toscana", rate: 0.008 },
    { name: "Livorno", region: "toscana", rate: 0.008 },
    { name: "Siena", region: "toscana", rate: 0.007 },
  ],
  trentino_alto_adige: [
    { name: "Trento", region: "trentino_alto_adige", rate: 0.005 },
    { name: "Bolzano", region: "trentino_alto_adige", rate: 0.002 },
  ],
  umbria: [
    { name: "Perugia", region: "umbria", rate: 0.008 },
    { name: "Terni", region: "umbria", rate: 0.008 },
  ],
  valle_d_aosta: [
    { name: "Aosta", region: "valle_d_aosta", rate: 0.003 },
  ],
  veneto: [
    { name: "Venezia", region: "veneto", rate: 0.008 },
    { name: "Verona", region: "veneto", rate: 0.008 },
    { name: "Padova", region: "veneto", rate: 0.008 },
    { name: "Vicenza", region: "veneto", rate: 0.008 },
    { name: "Treviso", region: "veneto", rate: 0.006 },
  ],
};

/**
 * Lista regioni ordinata per UI
 */
export const REGIONS_LIST = Object.entries(REGIONAL_TAX_RATES)
  .map(([key, data]) => ({ key, name: data.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Calcola l'addizionale regionale effettiva per un dato reddito
 * Usa il sistema a scaglioni (imposta calcolata per fasce, non aliquota marginale unica)
 */
export function getRegionalRate(regionKey: string, annualIncome: number): number {
  const region = REGIONAL_TAX_RATES[regionKey];
  if (!region) return 0.0123; // fallback aliquota minima

  // Per semplicità, usiamo l'aliquota dello scaglione in cui cade il reddito
  for (const bracket of region.brackets) {
    if (annualIncome > bracket.min && annualIncome <= bracket.max) {
      return bracket.rate;
    }
  }
  // Se supera tutti gli scaglioni, usa l'ultimo
  return region.brackets[region.brackets.length - 1].rate;
}

/**
 * Restituisce l'aliquota comunale per il comune selezionato
 */
export function getMunicipalRate(regionKey: string, municipalityName: string): number {
  const municipalities = MUNICIPAL_TAX_RATES[regionKey];
  if (!municipalities) return 0.008; // fallback

  const found = municipalities.find((m) => m.name === municipalityName);
  return found ? found.rate : 0.008;
}

/**
 * Restituisce i comuni disponibili per una regione
 */
export function getMunicipalitiesByRegion(regionKey: string): MunicipalityData[] {
  return MUNICIPAL_TAX_RATES[regionKey] || [];
}
