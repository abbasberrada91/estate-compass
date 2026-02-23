export type SearchKind = "PIGE" | "CONQ";
export type TransactionType = "rent" | "sale";

export interface SearchPlatform {
  name: string;
  annonceur?: string;
  url?: string;
}

export interface SearchFilters {
  localisation?: {
    villes?: Array<string | { label: string; selogerLocationId?: string }>;
    cps?: Array<string | { label: string; selogerLocationId?: string }>;
  };
  type_bien?: string;
  pieces_min?: number;
  chambres?: number;
  prix?: { min?: number; max?: number };
  etage?: string[];
  annee_construction?: { min?: number; max?: number };
  dpe?: string[];
  caracteristiques?: string[];
  interieur?: string[];
  utilisation?: string[];
  accessibilite?: string[];
}

export interface SearchQueryPayload {
  kind: SearchKind;
  platforms: SearchPlatform[];
  urls?: Record<string, string>;
  transaction?: {
    types: TransactionType[];
  };
  context?: {
    mode: string;
  };
  filters?: SearchFilters;
  locations?: {
    cities?: string[];
    postalCodes?: string[];
  };
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateRange(minValue?: number, maxValue?: number, label?: string): string | null {
  if (minValue === undefined && maxValue === undefined) return null;
  if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
    return `${label || "Valeur"} min doit etre <= max`;
  }
  return null;
}

export function buildSearchQuery(payload: {
  kind: SearchKind;
  platforms: SearchPlatform[];
  urls?: Record<string, string>;
  filters: SearchFilters;
  transaction?: {
    types: TransactionType[];
  };
  context?: {
    mode: string;
  };
  locations?: {
    cities?: string[];
    postalCodes?: string[];
  };
}): SearchQueryPayload {
  const filters: SearchFilters = {};

  if (payload.filters.localisation) {
    const localisation: SearchFilters["localisation"] = {};
    if (payload.filters.localisation.villes?.length) {
      localisation.villes = payload.filters.localisation.villes;
    }
    if (payload.filters.localisation.cps?.length) {
      localisation.cps = payload.filters.localisation.cps;
    }
    if (localisation.villes || localisation.cps) {
      filters.localisation = localisation;
    }
  }

  if (payload.filters.type_bien) {
    filters.type_bien = payload.filters.type_bien;
  }
  if (payload.filters.pieces_min !== undefined) {
    filters.pieces_min = payload.filters.pieces_min;
  }
  if (payload.filters.chambres !== undefined) {
    filters.chambres = payload.filters.chambres;
  }
  if (payload.filters.prix) {
    const prix: SearchFilters["prix"] = {};
    if (payload.filters.prix.min !== undefined) {
      prix.min = payload.filters.prix.min;
    }
    if (payload.filters.prix.max !== undefined) {
      prix.max = payload.filters.prix.max;
    }
    if (prix.min !== undefined || prix.max !== undefined) {
      filters.prix = prix;
    }
  }
  if (payload.filters.etage?.length) {
    filters.etage = payload.filters.etage;
  }
  if (payload.filters.annee_construction) {
    const range: SearchFilters["annee_construction"] = {};
    if (payload.filters.annee_construction.min !== undefined) {
      range.min = payload.filters.annee_construction.min;
    }
    if (payload.filters.annee_construction.max !== undefined) {
      range.max = payload.filters.annee_construction.max;
    }
    if (range.min !== undefined || range.max !== undefined) {
      filters.annee_construction = range;
    }
  }
  if (payload.filters.dpe?.length) {
    filters.dpe = payload.filters.dpe;
  }
  if (payload.filters.caracteristiques?.length) {
    filters.caracteristiques = payload.filters.caracteristiques;
  }
  if (payload.filters.interieur?.length) {
    filters.interieur = payload.filters.interieur;
  }
  if (payload.filters.utilisation?.length) {
    filters.utilisation = payload.filters.utilisation;
  }
  if (payload.filters.accessibilite?.length) {
    filters.accessibilite = payload.filters.accessibilite;
  }

  return {
    kind: payload.kind,
    platforms: payload.platforms,
    urls: payload.urls && Object.keys(payload.urls).length ? payload.urls : undefined,
    transaction:
      payload.transaction && payload.transaction.types.length
        ? { types: payload.transaction.types }
        : undefined,
    context: payload.context,
    filters: Object.keys(filters).length ? filters : undefined,
    locations:
      payload.locations &&
      (payload.locations.cities?.length || payload.locations.postalCodes?.length)
        ? {
            cities: payload.locations.cities?.length ? payload.locations.cities : undefined,
            postalCodes: payload.locations.postalCodes?.length
              ? payload.locations.postalCodes
              : undefined,
          }
        : undefined,
  };
}
