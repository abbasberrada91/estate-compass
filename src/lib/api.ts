const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getSearchProfiles() {
  return apiFetch("/api/search_profiles");
}

export function createSearchProfile(payload: Record<string, unknown>) {
  return apiFetch("/api/search_profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSearchProfile(id: number, payload: Record<string, unknown>) {
  return apiFetch(`/api/search_profiles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getListings(params?: { platform?: string; search_profile_id?: number }) {
  const query = new URLSearchParams();
  if (params?.platform) query.set("platform", params.platform);
  if (params?.search_profile_id) query.set("search_profile_id", String(params.search_profile_id));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/api/listings${suffix}`);
}

export function getLeads(status?: string) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`/api/leads${suffix}`);
}

export function createLead(payload: Record<string, unknown>) {
  return apiFetch("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLead(id: number, payload: Record<string, unknown>) {
  return apiFetch(`/api/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateLeadStatus(id: number, status: string) {
  return apiFetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function convertLead(id: number) {
  return apiFetch(`/api/leads/${id}/convert`, {
    method: "POST",
  });
}

export function getContacts() {
  return apiFetch("/api/contacts");
}

export function createContact(payload: Record<string, unknown>) {
  return apiFetch("/api/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProperties() {
  return apiFetch("/api/properties");
}

export function createProperty(payload: Record<string, unknown>) {
  return apiFetch("/api/properties", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAffairs() {
  return apiFetch("/api/affairs");
}

export function createAffair(payload: Record<string, unknown>) {
  return apiFetch("/api/affairs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDocuments() {
  return apiFetch("/api/documents");
}

export function createDocument(payload: Record<string, unknown>) {
  return apiFetch("/api/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateDocument(payload: Record<string, unknown>) {
  return apiFetch("/api/documents/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTasks() {
  return apiFetch("/api/tasks");
}

export function createTask(payload: Record<string, unknown>) {
  return apiFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
