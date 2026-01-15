// Mock data for the real estate application

export interface Contact {
  id: string;
  type: "proprietaire" | "prospect_proprio" | "acquereur" | "locataire" | "agence";
  civilite: "M." | "Mme" | "Société";
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Bien {
  id: string;
  reference: string;
  type: "appartement" | "maison" | "terrain" | "commerce" | "bureau";
  operation: "vente" | "location";
  adresse: string;
  ville: string;
  codePostal: string;
  surface: number;
  pieces: number;
  chambres: number;
  prix: number;
  loyer?: number;
  dpe: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  ges: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  statut: "disponible" | "sous_option" | "sous_compromis" | "vendu" | "loue" | "archive";
  enLigne: boolean;
  photos: string[];
  description: string;
  proprietaireId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mandat {
  id: string;
  registryNumber: string | null;
  type: "vente" | "location";
  exclusivite: boolean;
  bienId: string;
  proprietaireId: string;
  dateDebut: Date;
  dateFin: Date;
  statut: "brouillon" | "en_attente_signature" | "signe" | "expire" | "resilie";
  honoraires: number;
  honorairesType: "vendeur" | "acquereur" | "partage";
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  type: string;
  statut: "brouillon" | "signature_en_cours" | "signe" | "complet";
  progress: number;
  contactId?: string;
  bienId?: string;
  mandatId?: string;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Affaire {
  id: string;
  operation: "vente" | "location";
  bienId: string;
  vendeurId: string;
  acquereurId: string;
  montant: number;
  honoraires: number;
  statut: "en_cours" | "sous_compromis" | "sous_acte" | "finalisee" | "annulee";
  conditionsSuspensives: string;
  dateSignature?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  reference: string;
  searchProfileId: string;
  plateformes: ("pap" | "leboncoin" | "seloger")[];
  ville: string;
  codePostal: string;
  prix: number;
  surface: number;
  pieces: number;
  titre: string;
  description: string;
  url: string;
  statut: "a_contacter" | "contacte" | "a_relancer" | "oui_proprietaire" | "non" | "cloture";
  contactId?: string;
  bienId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generate mock data
export const mockContacts: Contact[] = [
  {
    id: "c1",
    type: "proprietaire",
    civilite: "Mme",
    nom: "Roberts",
    prenom: "Jihane",
    email: "jihane.roberts@email.com",
    telephone: "06 12 34 56 78",
    adresse: "66 rue de la tour",
    ville: "Paris",
    codePostal: "75016",
    notes: "Propriétaire d'un T3 dans le 16ème",
    tags: ["VIP", "Vendeur"],
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    id: "c2",
    type: "acquereur",
    civilite: "M.",
    nom: "Touillon",
    prenom: "Marie Claude",
    email: "mc.touillon@email.com",
    telephone: "06 98 76 54 32",
    adresse: "12 avenue des Champs",
    ville: "Paris",
    codePostal: "75008",
    notes: "Recherche appartement familial",
    tags: ["Acquéreur", "Budget élevé"],
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "c3",
    type: "locataire",
    civilite: "M.",
    nom: "Baer",
    prenom: "Caby",
    email: "caby.baer@email.com",
    telephone: "06 11 22 33 44",
    adresse: "45 rue du Commerce",
    ville: "Paris",
    codePostal: "75015",
    notes: "",
    tags: ["Locataire"],
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "c4",
    type: "agence",
    civilite: "Société",
    nom: "SARL B6",
    prenom: "",
    email: "contact@b6immo.fr",
    telephone: "01 42 55 66 77",
    adresse: "8 place de la République",
    ville: "Lyon",
    codePostal: "69001",
    notes: "Partenaire intercabinet",
    tags: ["Agence", "Intercabinet"],
    createdAt: new Date("2024-08-10"),
    updatedAt: new Date("2024-12-20"),
  },
];

export const mockBiens: Bien[] = [
  {
    id: "b1",
    reference: "VA3176",
    type: "appartement",
    operation: "vente",
    adresse: "15 rue de Neuilly",
    ville: "Neuilly-sur-Seine",
    codePostal: "92200",
    surface: 70,
    pieces: 3,
    chambres: 2,
    prix: 760000,
    dpe: "C",
    ges: "D",
    statut: "disponible",
    enLigne: true,
    photos: ["/placeholder.svg"],
    description: "Bel appartement T3 avec vue dégagée",
    proprietaireId: "c1",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "b2",
    reference: "VA3174",
    type: "appartement",
    operation: "vente",
    adresse: "28 avenue de la Liberté",
    ville: "Rueil-Malmaison",
    codePostal: "92500",
    surface: 73,
    pieces: 3,
    chambres: 2,
    prix: 565000,
    dpe: "B",
    ges: "B",
    statut: "disponible",
    enLigne: true,
    photos: ["/placeholder.svg"],
    description: "Appartement récent avec terrasse",
    proprietaireId: "c1",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "b3",
    reference: "VA3172",
    type: "appartement",
    operation: "vente",
    adresse: "5 boulevard Gambetta",
    ville: "Neuilly-sur-Seine",
    codePostal: "92200",
    surface: 80,
    pieces: 3,
    chambres: 2,
    prix: 920000,
    dpe: "D",
    ges: "C",
    statut: "sous_compromis",
    enLigne: false,
    photos: ["/placeholder.svg"],
    description: "Grand T3 lumineux, proche métro",
    proprietaireId: "c1",
    createdAt: new Date("2025-01-13"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    id: "b4",
    reference: "VA3100",
    type: "appartement",
    operation: "vente",
    adresse: "81 avenue d'Italie",
    ville: "Paris",
    codePostal: "75013",
    surface: 47,
    pieces: 2,
    chambres: 1,
    prix: 570000,
    dpe: "C",
    ges: "C",
    statut: "sous_compromis",
    enLigne: false,
    photos: ["/placeholder.svg"],
    description: "T2 idéal investissement",
    proprietaireId: "c3",
    createdAt: new Date("2024-10-24"),
    updatedAt: new Date("2024-10-24"),
  },
];

export const mockDocuments: Document[] = [
  {
    id: "d1",
    name: "Mandat exclusif de vente",
    category: "HABITATION > VENTE > MANDATS",
    type: "Mandat exclusif de vente",
    statut: "signe",
    progress: 100,
    bienId: "b1",
    contactId: "c1",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "d2",
    name: "Mandat simple de vente",
    category: "HABITATION > VENTE > MANDATS",
    type: "Mandat simple de vente",
    statut: "signature_en_cours",
    progress: 91,
    bienId: "b2",
    contactId: "c1",
    createdAt: new Date("2025-01-06"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    id: "d3",
    name: "Avenant au mandat de vente",
    category: "HABITATION > VENTE > MANDATS",
    type: "Avenant",
    statut: "brouillon",
    progress: 0,
    mandatId: "m1",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    id: "d4",
    name: "État des lieux",
    category: "HABITATION > LOCATION > DIVERS",
    type: "État des lieux",
    statut: "complet",
    progress: 100,
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-18"),
  },
  {
    id: "d5",
    name: "Facture Location",
    category: "HABITATION > LOCATION > DIVERS",
    type: "Facture",
    statut: "signe",
    progress: 100,
    createdAt: new Date("2024-11-27"),
    updatedAt: new Date("2024-11-28"),
  },
];

export const mockAffaires: Affaire[] = [
  {
    id: "a1",
    operation: "vente",
    bienId: "b4",
    vendeurId: "c1",
    acquereurId: "c2",
    montant: 570000,
    honoraires: 20000,
    statut: "sous_compromis",
    conditionsSuspensives: "Obtention prêt",
    createdAt: new Date("2024-10-24"),
    updatedAt: new Date("2025-01-14"),
  },
];

export const mockLeads: Lead[] = [
  {
    id: "l1",
    reference: "LEAD-001",
    searchProfileId: "sp1",
    plateformes: ["pap", "leboncoin"],
    ville: "Paris",
    codePostal: "75016",
    prix: 650000,
    surface: 65,
    pieces: 3,
    titre: "Appartement 3 pièces lumineux",
    description: "Bel appartement familial proche écoles",
    url: "https://pap.fr/annonce/123",
    statut: "a_contacter",
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    id: "l2",
    reference: "LEAD-002",
    searchProfileId: "sp1",
    plateformes: ["seloger"],
    ville: "Neuilly-sur-Seine",
    codePostal: "92200",
    prix: 720000,
    surface: 72,
    pieces: 3,
    titre: "T3 standing avec balcon",
    description: "Appartement refait à neuf, proche transports",
    url: "https://seloger.com/annonce/456",
    statut: "a_relancer",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-13"),
  },
];

// Helper functions
export function getContactById(id: string): Contact | undefined {
  return mockContacts.find(c => c.id === id);
}

export function getBienById(id: string): Bien | undefined {
  return mockBiens.find(b => b.id === id);
}

export function getContactTypeLabel(type: Contact["type"]): string {
  const labels: Record<Contact["type"], string> = {
    proprietaire: "Propriétaire",
    prospect_proprio: "Prospect Proprio",
    acquereur: "Acquéreur",
    locataire: "Locataire",
    agence: "Agence",
  };
  return labels[type];
}

export function getBienStatutLabel(statut: Bien["statut"]): string {
  const labels: Record<Bien["statut"], string> = {
    disponible: "Sur le marché",
    sous_option: "Sous option",
    sous_compromis: "Sous compromis",
    vendu: "Vendu",
    loue: "Loué",
    archive: "Archivé",
  };
  return labels[statut];
}

export function getDocumentStatutLabel(statut: Document["statut"]): string {
  const labels: Record<Document["statut"], string> = {
    brouillon: "Brouillon",
    signature_en_cours: "Signature en cours",
    signe: "Signé",
    complet: "Complet",
  };
  return labels[statut];
}

export function getAffaireStatutLabel(statut: Affaire["statut"]): string {
  const labels: Record<Affaire["statut"], string> = {
    en_cours: "En cours",
    sous_compromis: "Sous compromis",
    sous_acte: "Sous acte",
    finalisee: "Finalisée",
    annulee: "Annulée",
  };
  return labels[statut];
}
