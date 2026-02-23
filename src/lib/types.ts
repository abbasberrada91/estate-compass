export interface SearchProfile {
  id: number;
  name: string;
  platform: string;
  query_json: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface SearchRecord {
  id: number;
  kind: string;
  name: string;
  query_json: string | Record<string, unknown>;
  active: number;
  status?: string | null;
  last_run_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: number;
  platform: string;
  platform_id?: string | null;
  url: string;
  title?: string | null;
  price?: number | null;
  surface?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  search_profile_id?: number | null;
  raw_json?: string | null;
  detected_at: string;
  created_at: string;
}

export interface LeadRecord {
  id: number;
  listing_id: number;
  status: string;
  external_id?: string | null;
  contact_id?: number | null;
  property_id?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  platform?: string | null;
  url?: string | null;
  title?: string | null;
  price?: number | null;
  surface?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  city?: string | null;
  postal_code?: string | null;
}

export interface Contact {
  id: number;
  type: string;
  civility?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  reference?: string | null;
  type?: string | null;
  operation?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  surface?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  price?: number | null;
  rent?: number | null;
  dpe?: string | null;
  ges?: string | null;
  status?: string | null;
  online?: number | null;
  description?: string | null;
  owner_contact_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Affair {
  id: number;
  operation?: string | null;
  property_id?: number | null;
  seller_contact_id?: number | null;
  buyer_contact_id?: number | null;
  amount?: number | null;
  fees?: number | null;
  status?: string | null;
  conditions?: string | null;
  signature_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: number;
  name: string;
  category?: string | null;
  type?: string | null;
  status: string;
  progress: number;
  contact_id?: number | null;
  property_id?: number | null;
  affair_id?: number | null;
  file_path?: string | null;
  source_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: string;
  lead_id?: number | null;
  contact_id?: number | null;
  property_id?: number | null;
  created_at: string;
  updated_at: string;
}
