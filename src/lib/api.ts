const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const method = options.method || "GET";
  if (import.meta.env?.MODE !== "production") {
    const headerKeys = options.headers ? Object.keys(options.headers as Record<string, string>) : [];
    console.debug("[api]", method, url, "headers:", headerKeys);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
      ...options,
    });
  } catch (_error) {
    throw new Error("Impossible de contacter l'API (backend indisponible ou CORS).");
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Request failed: ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        message =
          (parsed.error as string) ||
          (parsed.message as string) ||
          message;
      }
    } catch (_error) {
      // keep fallback text
    }
    message = `${response.status} ${response.statusText || "Erreur"}: ${message}`;
    const err = new Error(message);
    (err as Error & { status?: number }).status = response.status;
    throw err;
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

export function getSearches() {
  return apiFetch("/api/searches");
}

export function createSearch(payload: Record<string, unknown>) {
  return apiFetch("/api/searches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSearch(id: number) {
  return apiFetch(`/api/searches/${id}`);
}

export function updateSearch(id: number, payload: Record<string, unknown>) {
  return apiFetch(`/api/searches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateSearchUrl(id: number, platform: "pap" | "leboncoin" | "seloger", url: string) {
  return apiFetch(`/api/searches/${id}/urls`, {
    method: "PATCH",
    body: JSON.stringify({ platform, url }),
  });
}

export function importPlatformUrl(id: number, platform: "pap" | "leboncoin" | "seloger", url: string) {
  return apiFetch(`/api/searches/${id}/platforms/${platform}/import_url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function initSelogerSession(id: number, timeoutSec = 180) {
  return apiFetch(`/api/searches/${id}/platforms/seloger/init_session`, {
    method: "POST",
    body: JSON.stringify({ timeout_sec: timeoutSec }),
  });
}

export function initPapSession(id: number, timeoutSec = 180) {
  return apiFetch(`/api/searches/${id}/platforms/pap/init_session`, {
    method: "POST",
    body: JSON.stringify({ timeout_sec: timeoutSec }),
  });
}

export function initLeboncoinSession(id: number, timeoutSec = 180) {
  return apiFetch(`/api/searches/${id}/platforms/leboncoin/init_session`, {
    method: "POST",
    body: JSON.stringify({ timeout_sec: timeoutSec }),
  });
}

export function updatePlatformConfig(
  id: number,
  platform: "pap" | "leboncoin" | "seloger",
  payload: { mode: "override" | "imported" | "filters"; override_url?: string | null; filters?: Record<string, unknown> | null }
) {
  return apiFetch(`/api/searches/${id}/platforms/${platform}/config`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function importLeboncoinUrl(id: number, url: string) {
  return apiFetch(`/api/searches/${id}/leboncoin/import_url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function updateLeboncoinFilters(id: number, filters: Record<string, unknown>) {
  return apiFetch(`/api/searches/${id}/leboncoin/filters`, {
    method: "PATCH",
    body: JSON.stringify(filters),
  });
}

export function toggleSearchActive(id: number, active: boolean) {
  return apiFetch(`/api/searches/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export function runSearch(id: number, payload?: { platforms?: string[] }) {
  return apiFetch(`/api/searches/${id}/run`, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export function getSearchLatestRuns(id: number) {
  return apiFetch(`/api/searches/${id}/latest_runs`);
}

export function getRuns() {
  return apiFetch("/api/runs");
}

export function getRunSummary(runId: number) {
  return apiFetch(`/api/runs/${runId}/summary`);
}

export function getRunDebug(runId: number) {
  return apiFetch(`/api/runs/${runId}/debug`);
}

export function rerunPlatform(searchId: number, platform: string) {
  return apiFetch(`/api/v2/searches/${searchId}/runs/${platform}`, {
    method: "POST",
  });
}

export function getRunListings(runId: number, limit = 20) {
  return apiFetch(`/api/runs/${runId}/listings?limit=${limit}`);
}

export function getRunLeads(runId: number, limit = 20) {
  return apiFetch(`/api/runs/${runId}/leads?limit=${limit}`);
}

export function getRunOutbox(runId: number, limit = 20) {
  return apiFetch(`/api/runs/${runId}/outbox?limit=${limit}`);
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
