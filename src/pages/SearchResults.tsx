import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import {
  getRunLeads,
  getRunListings,
  getRunOutbox,
  getRunDebug,
  getRunSummary,
  getRuns,
  getSearch,
  getSearchLatestRuns,
  runSearch,
  rerunPlatform,
  importPlatformUrl,
  initSelogerSession,
  initPapSession,
  initLeboncoinSession,
  updatePlatformConfig,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlatformResult {
  platform?: string;
  results?: number;
  listings?: unknown[];
  error?: string;
  transaction_type?: string;
  status?: string;
  run_id?: number;
}

interface RunSummary {
  platform?: string;
  transaction_type?: string;
  status?: string;
  started_at?: string | null;
  finished_at?: string | null;
  listings_count?: number;
  phones_count?: number;
  leads_count?: number;
  outbox_count?: number;
  reason?: string | null;
}

interface RunDebug {
  run_id?: number;
  platform?: string;
  status?: string;
  error?: string | null;
  last_error?: string | null;
  input_url?: string | null;
  final_url?: string | null;
  human_url?: string | null;
  search_profile_url?: string | null;
  recommended_url?: string | null;
  cards_raw_count?: number | null;
  links_kept_count?: number | null;
  extracted_links?: string[] | null;
  listings_created?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
}

const TRANSACTION_LABELS: Record<string, string> = {
  rent: "Location",
  sale: "Vente",
};

const OWNER_MESSAGE_TEMPLATE = `Bonjour XXX, votre bien m'intéresse, est-il toujours disponible ?
Je souhaiterai le proposer a 2 clients (grands groupes) m'ayant mandate pour loger leurs cadres.
Ils me remunerent, le service est gratuit pour vous.
Puis-je leur proposer et organiser une visite ? Merci,
Cordialement
Abbas BERRADA
06 25 22 61 94`;

const normalizeTransaction = (value?: string) => (value === "sale" ? "sale" : "rent");
const PREVIEW_LIMIT = 10;

const shouldShowManualActions = (status?: string, lastError?: string | null) => {
  if (!status && !lastError) return false;
  const statusLower = (status || "").toLowerCase();
  if (["needs_human", "failed", "error"].includes(statusLower)) return true;
  if (lastError && /needs_human/i.test(lastError)) return true;
  if (lastError && /(url_missing|config_missing)/i.test(lastError)) return true;
  return false;
};

const normalizePlatformUrl = (platform: string | undefined, value?: string | null) => {
  if (!value) return "";
  if (platform === "leboncoin") {
    return value.replace(/%2C/gi, ",");
  }
  return value;
};

const pickRunUrl = (platform: string | undefined, debug?: RunDebug | null, fallback = "") => {
  if (!debug) return fallback;
  if (platform === "leboncoin") {
    return (
      normalizePlatformUrl(platform, debug.recommended_url) ||
      normalizePlatformUrl(platform, debug.input_url) ||
      normalizePlatformUrl(platform, debug.human_url) ||
      normalizePlatformUrl(platform, debug.final_url) ||
      normalizePlatformUrl(platform, debug.search_profile_url) ||
      fallback
    );
  }
  return (
    normalizePlatformUrl(platform, debug.final_url) ||
    normalizePlatformUrl(platform, debug.recommended_url) ||
    normalizePlatformUrl(platform, debug.input_url) ||
    normalizePlatformUrl(platform, debug.human_url) ||
    normalizePlatformUrl(platform, debug.search_profile_url) ||
    fallback
  );
};

function ManualActions({
  platform,
  searchId,
  runId,
  status,
  lastError,
  onRerun,
  rerunLoading,
}: {
  platform?: string;
  searchId?: number | null;
  runId?: number | null;
  status?: string;
  lastError?: string | null;
  onRerun?: () => Promise<void>;
  rerunLoading?: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const [activating, setActivating] = useState(false);
  const show = shouldShowManualActions(status, lastError);
  const fallbackUrl =
    platform === "pap"
      ? "https://www.pap.fr/annonce/locations"
      : platform === "leboncoin"
        ? "https://www.leboncoin.fr/recherche?category=10"
        : "https://www.seloger.com/";

  const openManualUrl = async (): Promise<boolean> => {
    if (!runId) return false;
    setOpening(true);
    try {
      const debug = (await getRunDebug(runId)) as RunDebug;
      const targetUrl = pickRunUrl(platform, debug, fallbackUrl);
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return true;
    } catch (_err) {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      return true;
    } finally {
      setOpening(false);
    }
  };

  const handleActivateAntiBot = async () => {
    if (!runId || !show || !onRerun) return;
    setActivating(true);
    if ((platform === "seloger" || platform === "pap" || platform === "leboncoin") && searchId) {
      try {
        const initRes = (platform === "seloger"
          ? await initSelogerSession(searchId, 300)
          : platform === "pap"
            ? await initPapSession(searchId, 240)
            : await initLeboncoinSession(searchId, 240)) as {
          ok?: boolean;
          blocked?: boolean;
          error_code?: string | null;
        };
        if (!initRes?.ok) {
          toast({
            title:
              platform === "seloger"
                ? "SeLoger bloqué"
                : platform === "pap"
                  ? "PAP bloqué"
                  : "Leboncoin bloqué",
            description:
              initRes?.error_code === "SELOGER_TEMP_BLOCKED"
                ? "Accès temporairement restreint. Réessaie plus tard ou change de réseau."
                : "Session manuelle non validée.",
          });
          return;
        }
        toast({
          title: "Session validée",
          description: `${platform} prêt, relance automatique en cours.`,
        });
        await onRerun();
      } finally {
        setActivating(false);
      }
      return;
    }
    const opened = await openManualUrl();
    if (!opened) {
      setActivating(false);
      return;
    }
    // Give the user a short window to solve captcha/check before relaunching.
    window.setTimeout(async () => {
      try {
        await onRerun();
      } finally {
        setActivating(false);
      }
    }, 20000);
  };

  return (
    show ? (
      <Button
        variant="default"
        size="sm"
        disabled={!runId || opening || activating || !onRerun}
        onClick={handleActivateAntiBot}
      >
        {activating || rerunLoading ? "Activation..." : "Activation manuelle anti-bot"}
      </Button>
    ) : (
      <span className="text-xs text-muted-foreground">-</span>
    )
  );
}

function AntiBotHelperText({ platform }: { platform?: string }) {
  if (!platform) return null;
  const label = platform === "seloger" ? "SeLoger" : platform === "leboncoin" ? "Leboncoin" : "PAP";
  return (
    <div className="text-xs text-muted-foreground">
      {label}: mode automatique par défaut. Intervention manuelle seulement en cas d&apos;anti-bot.
    </div>
  );
}

export default function SearchResults() {
  const { id } = useParams();
  const searchId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rent");
  const [runResult, setRunResult] = useState<{ platforms?: PlatformResult[]; total_results?: number } | null>(null);
  const [runItems, setRunItems] = useState<PlatformResult[]>([]);
  const [queuedSince, setQueuedSince] = useState<Record<number, number>>({});
  const [summaries, setSummaries] = useState<Record<number, RunSummary>>({});
  const [preview, setPreview] = useState<{ runId: number; type: "listings" | "leads" | "outbox" } | null>(null);
  const [previewItems, setPreviewItems] = useState<unknown[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFallback, setPreviewFallback] = useState(false);
  const [diagnosticRunId, setDiagnosticRunId] = useState<number | null>(null);
  const [diagnostic, setDiagnostic] = useState<RunDebug | null>(null);
  const [diagnosticListings, setDiagnosticListings] = useState<unknown[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticFallback, setDiagnosticFallback] = useState(false);
  const [runDebugs, setRunDebugs] = useState<Record<number, RunDebug>>({});
  const { toast } = useToast();
  const [rerunLoading, setRerunLoading] = useState<Record<string, boolean>>({});
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlModalPlatform, setUrlModalPlatform] = useState<"pap" | "leboncoin" | "seloger">("pap");
  const [urlModalValue, setUrlModalValue] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importModalPlatform, setImportModalPlatform] = useState<"pap" | "leboncoin" | "seloger">("leboncoin");
  const [importModalUrl, setImportModalUrl] = useState("");
  const [lbcFilters, setLbcFilters] = useState({
    category: "",
    owner_type: "private",
    price_min: "",
    price_max: "",
    rooms_exact: "",
    bedrooms_exact: "",
    real_estate_type: { one: true, two: true },
    locations: "",
  });

  const { data: search } = useQuery({
    queryKey: ["search", searchId],
    queryFn: () => getSearch(searchId),
    enabled: Number.isFinite(searchId),
  });

  const transactionTypes = useMemo(() => {
    if (!search?.query_json) return ["rent"];
    try {
      const parsed = JSON.parse(search.query_json);
      const types = parsed?.transaction?.types;
      if (Array.isArray(types) && types.length) {
        return types.filter((t: string) => t === "rent" || t === "sale");
      }
    } catch (_error) {
      // ignore
    }
    return ["rent"];
  }, [search?.query_json]);

  const platformConfigs = useMemo(() => {
    if (!search?.query_json) return { configs: {}, list: [] as string[] };
    try {
      const parsed = JSON.parse(search.query_json);
      const platforms = parsed?.platforms;
      if (platforms && typeof platforms === "object" && !Array.isArray(platforms)) {
        return { configs: platforms, list: Object.keys(platforms) };
      }
      if (Array.isArray(platforms)) {
        const configs: Record<string, unknown> = {};
        const list: string[] = [];
        platforms.forEach((entry) => {
          const name = entry?.name;
          if (name) {
            list.push(name);
            configs[name] = {};
          }
        });
        return { configs, list };
      }
    } catch (_error) {
      return { configs: {}, list: [] as string[] };
    }
    return { configs: {}, list: [] as string[] };
  }, [search?.query_json]);

  const platformConfig = (platform: "pap" | "leboncoin" | "seloger") => {
    const configs = platformConfigs.configs as Record<string, any>;
    return configs?.[platform] || {};
  };

  const papUrlMissing = useMemo(() => {
    if (!search?.query_json) return false;
    try {
      const parsed = JSON.parse(search.query_json);
      const platforms = Array.isArray(parsed?.platforms) ? parsed.platforms : [];
      const usesPap = platformConfigs.list.includes("pap") || platforms.some((item: { name?: string }) => item?.name === "pap");
      if (!usesPap) return false;
      const cfg = platformConfig("pap");
      const mode = cfg.mode || (cfg.override_url ? "override" : cfg.filters ? "filters" : null);
      if (mode === "override") {
        return typeof cfg.override_url !== "string" || !cfg.override_url.startsWith("https://www.pap.fr/annonce/");
      }
      if ((mode === "filters" || mode === "imported") && cfg.filters) {
        return false;
      }
      if (mode === "imported" && cfg.override_url) {
        return false;
      }
      const papUrl = parsed?.pap?.url || parsed?.urls?.pap || parsed?.url;
      return typeof papUrl !== "string" || !papUrl.startsWith("https://www.pap.fr/annonce/");
    } catch (_error) {
      return false;
    }
  }, [search?.query_json, platformConfigs.list]);

  const leboncoinUrlMissing = useMemo(() => {
    if (!search?.query_json) return false;
    try {
      const parsed = JSON.parse(search.query_json);
      const platforms = Array.isArray(parsed?.platforms) ? parsed.platforms : [];
      const usesLbc = platformConfigs.list.includes("leboncoin") || platforms.some((item: { name?: string }) => item?.name === "leboncoin");
      if (!usesLbc) return false;
      const cfg = platformConfig("leboncoin");
      const mode = cfg.mode || (cfg.override_url ? "override" : cfg.filters ? "filters" : null);
      if (mode === "override") {
        return typeof cfg.override_url !== "string" || !cfg.override_url.startsWith("https://www.leboncoin.fr/");
      }
      if ((mode === "filters" || mode === "imported") && cfg.filters) {
        return false;
      }
      if (mode === "imported" && cfg.override_url) {
        return false;
      }
      const lbcUrl = parsed?.urls?.leboncoin || parsed?.url;
      const hasFilters = Boolean(parsed?.filters?.leboncoin);
      if (hasFilters) return false;
      return typeof lbcUrl !== "string" || !lbcUrl.startsWith("https://www.leboncoin.fr/");
    } catch (_error) {
      return false;
    }
  }, [search?.query_json, platformConfigs.list]);

  useEffect(() => {
    if (!search?.query_json) return;
    try {
      const parsed = JSON.parse(search.query_json);
      const filters = parsed?.platforms?.leboncoin?.filters || parsed?.filters?.leboncoin || {};
      setLbcFilters({
        category: filters.category !== undefined ? String(filters.category) : "",
        owner_type: filters.owner_type || "private",
        price_min: filters.price_min !== undefined && filters.price_min !== null ? String(filters.price_min) : "",
        price_max: filters.price_max !== undefined && filters.price_max !== null ? String(filters.price_max) : "",
        rooms_exact: filters.rooms_exact !== undefined && filters.rooms_exact !== null ? String(filters.rooms_exact) : "",
        bedrooms_exact: filters.bedrooms_exact !== undefined && filters.bedrooms_exact !== null ? String(filters.bedrooms_exact) : "",
        real_estate_type: {
          one: Array.isArray(filters.real_estate_type) ? filters.real_estate_type.includes(1) : true,
          two: Array.isArray(filters.real_estate_type) ? filters.real_estate_type.includes(2) : true,
        },
        locations: Array.isArray(filters.locations) ? filters.locations.join("\n") : "",
      });
    } catch (_error) {
      return;
    }
  }, [search?.query_json]);

  const lbcComputedUrl = useMemo(() => {
    if (!lbcFilters.category || !lbcFilters.owner_type) return "";
    const params: Array<[string, string]> = [];
    const encodeValue = (value: string) => encodeURIComponent(value).replace(/%2C/g, ",");
    params.push(["category", lbcFilters.category]);
    const locations = lbcFilters.locations
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (locations.length) {
      params.push(["locations", locations.join(",")]);
    }
    if (lbcFilters.price_min || lbcFilters.price_max) {
      const lo = lbcFilters.price_min || "min";
      const hi = lbcFilters.price_max || "max";
      params.push(["price", `${lo}-${hi}`]);
    }
    if (lbcFilters.rooms_exact) {
      params.push(["rooms", `${lbcFilters.rooms_exact}-${lbcFilters.rooms_exact}`]);
    }
    if (lbcFilters.bedrooms_exact) {
      params.push(["bedrooms", `${lbcFilters.bedrooms_exact}-${lbcFilters.bedrooms_exact}`]);
    }
    const types = [];
    if (lbcFilters.real_estate_type.two) types.push("2");
    if (lbcFilters.real_estate_type.one) types.push("1");
    if (types.length) {
      params.push(["real_estate_type", types.join(",")]);
    }
    params.push(["owner_type", lbcFilters.owner_type]);
    const query = params
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeValue(value)}`)
      .join("&");
    return `https://www.leboncoin.fr/recherche?${query}`;
  }, [lbcFilters]);

  const buildLbcUrlFromFilters = (filters?: Record<string, unknown>) => {
    if (!filters || !filters.category || !filters.owner_type) return "";
    const params: Array<[string, string]> = [];
    const encodeValue = (value: string) => encodeURIComponent(value).replace(/%2C/g, ",");
    params.push(["category", String(filters.category)]);
    const locations = Array.isArray(filters.locations)
      ? filters.locations.map((item) => String(item))
      : typeof filters.locations === "string"
        ? filters.locations.split(",").map((item) => item.trim()).filter(Boolean)
        : [];
    if (locations.length) {
      params.push(["locations", locations.join(",")]);
    }
    const priceMin = filters.price_min ?? null;
    const priceMax = filters.price_max ?? null;
    if (priceMin !== null || priceMax !== null) {
      const lo = priceMin !== null && priceMin !== undefined ? String(priceMin) : "min";
      const hi = priceMax !== null && priceMax !== undefined ? String(priceMax) : "max";
      params.push(["price", `${lo}-${hi}`]);
    }
    if (filters.rooms_exact) {
      params.push(["rooms", `${filters.rooms_exact}-${filters.rooms_exact}`]);
    }
    if (filters.bedrooms_exact) {
      params.push(["bedrooms", `${filters.bedrooms_exact}-${filters.bedrooms_exact}`]);
    }
    if (Array.isArray(filters.real_estate_type) && filters.real_estate_type.length) {
      params.push(["real_estate_type", filters.real_estate_type.map((item) => String(item)).join(",")]);
    }
    if (Array.isArray(filters.floor_property) && filters.floor_property.length) {
      params.push(["floor_property", filters.floor_property.map((item) => String(item)).join(",")]);
    }
    params.push(["owner_type", String(filters.owner_type)]);
    const query = params
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeValue(value)}`)
      .join("&");
    return `https://www.leboncoin.fr/recherche?${query}`;
  };

  const buildSelogerUrlFromFilters = (filters?: Record<string, unknown>) => {
    if (!filters) return "";
    const locations = Array.isArray(filters.locations) ? filters.locations : [];
    const estateTypes = Array.isArray(filters.estateTypes) ? filters.estateTypes : [];
    if (!locations.length || !estateTypes.length) return "";
    const params: Array<[string, string]> = [];
    if (filters.classifiedBusiness) params.push(["classifiedBusiness", String(filters.classifiedBusiness)]);
    if (filters.distributionTypes) params.push(["distributionTypes", String(filters.distributionTypes)]);
    params.push(["estateTypes", estateTypes.map((item) => String(item)).join(",")]);
    params.push(["locations", locations.map((item) => String(item)).join(",")]);
    if (filters.numberOfBedroomsMin !== undefined && filters.numberOfBedroomsMin !== null) {
      params.push(["numberOfBedroomsMin", String(filters.numberOfBedroomsMin)]);
    }
    if (filters.numberOfRoomsMin !== undefined && filters.numberOfRoomsMin !== null) {
      params.push(["numberOfRoomsMin", String(filters.numberOfRoomsMin)]);
    }
    if (filters.priceMax !== undefined && filters.priceMax !== null) {
      params.push(["priceMax", String(filters.priceMax)]);
    }
    if (filters.priceMin !== undefined && filters.priceMin !== null) {
      params.push(["priceMin", String(filters.priceMin)]);
    }
    const encodeValue = (value: string) =>
      encodeURIComponent(value).replace(/%2C/g, ",");
    const query = params
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeValue(value)}`)
      .join("&");
    return query ? `https://www.seloger.com/classified-search?${query}` : "";
  };

  const getPlatformMode = (cfg: Record<string, unknown>) => {
    if (typeof cfg.mode === "string") return cfg.mode;
    if (cfg.override_url) return "override";
    if (cfg.filters) return "filters";
    return "unknown";
  };

  const getPlatformUrl = (platform: "leboncoin" | "pap" | "seloger") => {
    const cfg = platformConfig(platform) as Record<string, unknown>;
    const mode = getPlatformMode(cfg);
    if (mode === "override" && typeof cfg.override_url === "string") return cfg.override_url;
    if ((mode === "filters" || mode === "imported") && cfg.filters) {
      if (platform === "leboncoin") {
        return buildLbcUrlFromFilters(cfg.filters as Record<string, unknown>) || lbcComputedUrl;
      }
      if (platform === "seloger") {
        return buildSelogerUrlFromFilters(cfg.filters as Record<string, unknown>);
      }
    }
    if (mode === "imported" && typeof cfg.override_url === "string") return cfg.override_url;
    if (typeof cfg.last_import_url === "string") return cfg.last_import_url;
    return "";
  };

  const openUrlModal = (platform: "pap" | "leboncoin" | "seloger") => {
    setUrlModalPlatform(platform);
    setUrlModalValue("");
    setUrlModalOpen(true);
  };

  const openImportModal = (platform: "pap" | "leboncoin" | "seloger") => {
    setImportModalPlatform(platform);
    setImportModalUrl("");
    setImportModalOpen(true);
  };

  useEffect(() => {
    if (!transactionTypes.includes(activeTab)) {
      setActiveTab(transactionTypes[0] || "rent");
    }
  }, [transactionTypes, activeTab]);

  const mutation = useMutation({
    mutationFn: () => runSearch(searchId),
    onSuccess: (data) => {
      const payload = data as {
        status?: string;
        items?: PlatformResult[];
        run_items?: PlatformResult[];
        result?: { platforms?: PlatformResult[]; total_results?: number };
      };
      const items = payload.items?.length ? payload.items : payload.run_items;
      if (items && items.length) {
        setRunItems(items);
        setQueuedSince(
          items.reduce((acc, item) => {
            if (item.run_id) acc[item.run_id] = Date.now();
            return acc;
          }, {} as Record<number, number>)
        );
        toast({ title: "Run lancé", description: `${items.length} item(s) en file.` });
      }
      if (payload.result?.platforms) {
        setRunResult(payload.result);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Erreur run", description: error.message });
    },
  });

  useEffect(() => {
    if (!Number.isFinite(searchId)) return;
    let active = true;
    const loadLatestRuns = async () => {
      try {
        const payload = (await getSearchLatestRuns(searchId)) as { items?: PlatformResult[] };
        const items = Array.isArray(payload?.items) ? payload.items : [];
        if (!active || !items.length) return;
        setRunItems(items);
        setQueuedSince(
          items.reduce((acc, item) => {
            if (item.run_id && item.status === "queued") acc[item.run_id] = Date.now();
            return acc;
          }, {} as Record<number, number>)
        );
      } catch (_error) {
        // no-op: page can still launch runs manually
      }
    };
    loadLatestRuns();
    return () => {
      active = false;
    };
  }, [searchId]);

  useEffect(() => {
    if (!runItems.length) return;
    let pollCount = 0;
    let active = true;
    const finalStatuses = new Set(["success", "failed", "needs_human", "skipped"]);
    const poll = async () => {
      if (!active) return;
      pollCount += 1;
      try {
        const runs = (await getRuns()) as Array<{ id: number; status: string; error?: string | null }>;
        let allDone = true;
        setRunItems((prev) => {
          const next = prev.map((item) => {
            if (!item.run_id) return item;
            const match = runs.find((run) => run.id === item.run_id);
            if (!match) return item;
            return {
              ...item,
              status: match.status,
              error: match.error || item.error,
            };
          });
          allDone = next.every((item) => !item.run_id || finalStatuses.has(item.status || ""));
          return next;
        });
        if (allDone) {
          return;
        }
      } catch (_error) {
        return;
      }
      if (pollCount < 30) setTimeout(poll, 2000);
    };
    poll();
    return () => {
      active = false;
    };
  }, [runItems]);

  useEffect(() => {
    if (!runItems.length) return;
    let active = true;
    const finalStatuses = new Set(["done", "failed", "error", "needs_human"]);
    let pollCount = 0;
    const fetchSummaries = async () => {
      if (!active) return;
      const runIds = Array.from(new Set(runItems.map((item) => item.run_id).filter(Boolean))) as number[];
      if (!runIds.length) return;
      const results = await Promise.all(
        runIds.map(async (runId) => {
          try {
            const summary = (await getRunSummary(runId)) as RunSummary;
            return [runId, summary] as const;
          } catch (_error) {
            return null;
          }
        })
      );
      const debugResults = await Promise.all(
        runIds.map(async (runId) => {
          try {
            const debug = (await getRunDebug(runId)) as RunDebug;
            return [runId, debug] as const;
          } catch (_error) {
            return null;
          }
        })
      );
      setSummaries((prev) => {
        const next = { ...prev };
        results.forEach((entry) => {
          if (!entry) return;
          const [runId, summary] = entry;
          next[runId] = summary;
        });
        return next;
      });
      setRunDebugs((prev) => {
        const next = { ...prev };
        debugResults.forEach((entry) => {
          if (!entry) return;
          const [runId, debug] = entry;
          next[runId] = debug;
        });
        return next;
      });
      const allDone = runItems.every((item) => !item.run_id || finalStatuses.has((item.status || "").toLowerCase()));
      pollCount += 1;
      if (!allDone && pollCount < 300) {
        setTimeout(fetchSummaries, 2000);
      }
    };
    fetchSummaries();
    return () => {
      active = false;
    };
  }, [runItems]);

  useEffect(() => {
    if (!preview) return;
    let active = true;
    const loadPreview = async () => {
      if (!active) return;
      setPreviewLoading(true);
      try {
        let items: unknown[] = [];
        let fallback = false;
        if (preview.type === "listings") {
          const response = (await getRunListings(preview.runId, PREVIEW_LIMIT)) as
            | unknown[]
            | { fallback: boolean; items: unknown[] };
          if (Array.isArray(response)) {
            items = response;
          } else {
            items = response.items || [];
            fallback = Boolean(response.fallback);
          }
        } else if (preview.type === "leads") {
          items = (await getRunLeads(preview.runId, PREVIEW_LIMIT)) as unknown[];
        } else {
          items = (await getRunOutbox(preview.runId, PREVIEW_LIMIT)) as unknown[];
        }
        if (active) {
          setPreviewItems(items);
          setPreviewFallback(fallback);
        }
      } catch (_error) {
        if (active) {
          setPreviewItems([]);
          setPreviewFallback(false);
        }
      } finally {
        if (active) setPreviewLoading(false);
      }
    };
    loadPreview();
    return () => {
      active = false;
    };
  }, [preview]);

  useEffect(() => {
    if (!diagnosticRunId) return;
    let active = true;
    const loadDiagnostic = async () => {
      if (!active) return;
      setDiagnosticLoading(true);
      try {
        const debug = (await getRunDebug(diagnosticRunId)) as RunDebug;
        const response = (await getRunListings(diagnosticRunId, PREVIEW_LIMIT)) as
          | unknown[]
          | { fallback: boolean; items: unknown[] };
        const items = Array.isArray(response) ? response : response.items || [];
        const fallback = Array.isArray(response) ? false : Boolean(response.fallback);
        if (active) {
          setDiagnostic(debug);
          setDiagnosticListings(items);
          setDiagnosticFallback(fallback);
        }
      } catch (_error) {
        if (active) {
          setDiagnostic(null);
          setDiagnosticListings([]);
          setDiagnosticFallback(false);
        }
      } finally {
        if (active) setDiagnosticLoading(false);
      }
    };
    loadDiagnostic();
    return () => {
      active = false;
    };
  }, [diagnosticRunId]);

  const resultsByTransaction = useMemo(() => {
    const platforms = runItems.length ? runItems : runResult?.platforms || [];
    const grouped: Record<string, PlatformResult[]> = { rent: [], sale: [] };
    platforms.forEach((item) => {
      const key = normalizeTransaction(item.transaction_type);
      grouped[key].push(item);
    });
    return grouped;
  }, [runItems, runResult]);

  const platformRecap = useMemo(() => {
    const byPlatform: Record<string, { listings: number; phones: number; outbox: number; status: string }> = {};
    const items = runItems.length ? runItems : runResult?.platforms || [];
    items.forEach((item) => {
      const platform = item.platform || "unknown";
      const summary = summaries[item.run_id || 0];
      const current = byPlatform[platform] || { listings: 0, phones: 0, outbox: 0, status: item.status || "idle" };
      byPlatform[platform] = {
        listings: summary?.listings_count ?? current.listings,
        phones: summary?.phones_count ?? current.phones,
        outbox: summary?.outbox_count ?? current.outbox,
        status: summary?.status || item.status || current.status,
      };
    });
    return byPlatform;
  }, [runItems, runResult, summaries]);

  const showAdvancedManual = false;

  const renderPreviewItem = (item: unknown, index: number) => {
    if (!item || typeof item !== "object") {
      return <li key={index} className="text-sm text-muted-foreground">Item #{index + 1}</li>;
    }
    const record = item as Record<string, unknown>;
    const title = record.title || record.city || record.status || `Item ${index + 1}`;
    const url = record.url ? String(record.url) : null;
    return (
      <li key={index} className="text-sm">
        {url ? (
          <a className="underline" href={url} target="_blank" rel="noreferrer">
            {title}
          </a>
        ) : (
          <span>{String(title)}</span>
        )}
      </li>
    );
  };

  const openAllPreviewUrls = async () => {
    let sourceItems: unknown[] = previewItems;
    if (preview?.runId && preview?.type === "listings") {
      try {
        const response = (await getRunListings(preview.runId, 200)) as
          | unknown[]
          | { fallback: boolean; items: unknown[] };
        sourceItems = Array.isArray(response) ? response : response.items || [];
      } catch (_error) {
        sourceItems = previewItems;
      }
    }
    const urls = sourceItems
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const url = (item as Record<string, unknown>).url;
        return typeof url === "string" ? url : null;
      })
      .filter(Boolean) as string[];
    urls.forEach((url, index) => {
      setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), index * 250);
    });
    toast({
      title: "Annonces ouvertes",
      description: `${urls.length} onglet(s) ouvert(s).`,
    });
  };

  const renderTable = (items: PlatformResult[]) => (
    <div className="card p-4">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Plateforme</th>
            <th>Run ID</th>
            <th>Status</th>
            <th>URL</th>
            <th>Résultats</th>
            <th>Téléphones</th>
            <th>Leads</th>
            <th>Messages propriétaire</th>
            <th>Action humaine</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item, index) => (
              <tr key={`${item.platform}-${index}`}>
                <td>{item.platform || "-"}</td>
                <td>{item.run_id ?? "-"}</td>
                <td>
                  <StatusBadge variant={item.error ? "error" : "success"}>
                    {item.status || (item.error ? "error" : "ok")}
                  </StatusBadge>
                  {(summaries[item.run_id || 0]?.reason || item.error) && (
                    <div className="text-xs text-muted-foreground">
                      {summaries[item.run_id || 0]?.reason || item.error}
                    </div>
                  )}
                  {item.status === "queued" &&
                  item.run_id &&
                  queuedSince[item.run_id] &&
                  Date.now() - queuedSince[item.run_id] > 10000 ? (
                    <div className="text-xs text-muted-foreground">
                      En file (limite de concurrence), rafraîchissement auto…
                    </div>
                  ) : null}
                </td>
                <td>
                  {item.run_id ? (
                    (() => {
                      const debug = runDebugs[item.run_id || 0];
                      const url = pickRunUrl(item.platform, debug, "");
                      return url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                        >
                          Voir URL
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">(aucune)</span>
                      );
                    })()
                  ) : (
                    <span className="text-xs text-muted-foreground">(aucune)</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span>{summaries[item.run_id || 0]?.listings_count ?? 0}</span>
                    {runDebugs[item.run_id || 0]?.links_kept_count &&
                    (runDebugs[item.run_id || 0]?.listings_created ?? 0) === 0 ? (
                      <span className="text-xs rounded bg-amber-100 px-2 py-0.5 text-amber-700">
                        URLs extraites
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!item.run_id}
                      onClick={() => item.run_id && setPreview({ runId: item.run_id, type: "listings" })}
                    >
                      Voir
                    </Button>
                  </div>
                </td>
                <td>
                  <span>{summaries[item.run_id || 0]?.phones_count ?? 0}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span>{summaries[item.run_id || 0]?.leads_count ?? 0}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!item.run_id}
                      onClick={() => item.run_id && setPreview({ runId: item.run_id, type: "leads" })}
                    >
                      Voir
                    </Button>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span>{summaries[item.run_id || 0]?.outbox_count ?? 0}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!item.run_id}
                      onClick={() => item.run_id && setPreview({ runId: item.run_id, type: "outbox" })}
                    >
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!item.run_id}
                      onClick={() => item.run_id && setDiagnosticRunId(item.run_id)}
                    >
                      Diagnostic
                    </Button>
                  </div>
                </td>
                <td>
                  <ManualActions
                    platform={item.platform}
                    searchId={searchId}
                    runId={item.run_id}
                    status={item.status}
                    lastError={summaries[item.run_id || 0]?.reason || item.error || runDebugs[item.run_id || 0]?.last_error}
                    onRerun={async () => {
                      if (!item.platform || !searchId) return;
                      setRerunLoading((prev) => ({ ...prev, [item.platform!]: true }));
                      try {
                        const res = (await rerunPlatform(searchId, item.platform)) as { run_id?: number };
                        const newRunId = res?.run_id;
                        if (newRunId) {
                          setRunItems((prev) =>
                            prev.map((p) =>
                              p.platform === item.platform ? { ...p, run_id: newRunId, status: "queued" } : p
                            )
                          );
                          setQueuedSince((prev) => ({ ...prev, [newRunId]: Date.now() }));
                        }
                        toast({ title: "Relancé", description: `Plateforme ${item.platform}` });
                      } catch (err) {
                        toast({ title: "Erreur relance", description: (err as Error).message });
                      } finally {
                        setRerunLoading((prev) => ({ ...prev, [item.platform!]: false }));
                      }
                    }}
                    rerunLoading={Boolean(item.platform && rerunLoading[item.platform])}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-sm text-muted-foreground">Aucun résultat.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const activePlatforms = platformConfigs.list.length
    ? platformConfigs.list
    : ["leboncoin", "pap", "seloger"];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Résultats recherche</h1>
          <p className="text-sm text-muted-foreground">{search?.name || "-"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              window.open("http://127.0.0.1:5000/dashboard/orchestration", "_blank")
            }
          >
            Voir orchestration
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Lancement..." : "Lancer un run"}
          </Button>
        </div>
      </div>
      {showAdvancedManual && papUrlMissing ? (
        <div className="card p-3 flex items-center justify-between text-sm">
          <div className="text-amber-700">
            PAP: la configuration automatique ne suffit pas encore pour ce run.
          </div>
          <Button size="sm" variant="outline" onClick={() => openUrlModal("pap")}>
            Assistant PAP
          </Button>
        </div>
      ) : null}
      {showAdvancedManual && leboncoinUrlMissing ? (
        <div className="card p-3 flex items-center justify-between text-sm">
          <div className="text-amber-700">
            Leboncoin: configuration auto incomplète, une aide guidée est disponible.
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openImportModal("leboncoin")}>
              Assistant Leboncoin
            </Button>
          </div>
        </div>
      ) : null}

      {showAdvancedManual ? (
        <div className="card p-4 space-y-4">
          <div className="font-medium">Mode assisté anti-bot</div>
          <div className="grid gap-3 md:grid-cols-3">
            {activePlatforms.map((platform) => {
              const cfg = platformConfig(platform as "pap" | "leboncoin" | "seloger") as Record<string, unknown>;
              const mode = getPlatformMode(cfg);
              const url = getPlatformUrl(platform as "pap" | "leboncoin" | "seloger");
              const label =
                platform === "leboncoin" ? "Leboncoin" : platform === "seloger" ? "SeLoger" : "PAP";
              return (
                <div key={platform} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{mode}</div>
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    URL: {url || "(aucune)"}
                  </div>
                  <AntiBotHelperText platform={platform} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openUrlModal(platform as "pap" | "leboncoin" | "seloger")}>
                      Configurer URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openImportModal(platform as "pap" | "leboncoin" | "seloger")}>
                      Importer URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!url}
                      onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                    >
                      Ouvrir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="card p-4 space-y-3">
        <div className="font-medium">Synthèse par plateforme</div>
        {Object.keys(platformRecap).length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(platformRecap).map(([platform, recap]) => (
              <div key={platform} className="rounded-md border border-border p-3 space-y-1">
                <div className="font-medium">
                  {platform === "seloger" ? "SeLoger" : platform === "leboncoin" ? "Leboncoin" : platform.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">Status: {recap.status}</div>
                <div className="text-sm">Résultats: {recap.listings}</div>
                <div className="text-sm">Avec téléphone: {recap.phones}</div>
                <div className="text-sm">Messages propriétaire: {recap.outbox}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Aucun run exécuté pour cette recherche.</div>
        )}
      </div>

      {showAdvancedManual ? (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Filtres Leboncoin (assisté)</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openImportModal("leboncoin")}>
                Importer depuis URL Leboncoin
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <Input
              value={lbcFilters.category}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="9 ou 10"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Owner type</label>
            <Input
              value={lbcFilters.owner_type}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, owner_type: event.target.value }))}
              placeholder="private"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Price min</label>
            <Input
              value={lbcFilters.price_min}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, price_min: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Price max</label>
            <Input
              value={lbcFilters.price_max}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, price_max: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Rooms exact</label>
            <Input
              value={lbcFilters.rooms_exact}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, rooms_exact: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Bedrooms exact</label>
            <Input
              value={lbcFilters.bedrooms_exact}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, bedrooms_exact: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Real estate type</label>
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lbcFilters.real_estate_type.one}
                  onChange={(event) =>
                    setLbcFilters((prev) => ({
                      ...prev,
                      real_estate_type: { ...prev.real_estate_type, one: event.target.checked },
                    }))
                  }
                />
                1
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lbcFilters.real_estate_type.two}
                  onChange={(event) =>
                    setLbcFilters((prev) => ({
                      ...prev,
                      real_estate_type: { ...prev.real_estate_type, two: event.target.checked },
                    }))
                  }
                />
                2
              </label>
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Locations (1 token par ligne)</label>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-border bg-background p-2 text-sm"
              value={lbcFilters.locations}
              onChange={(event) => setLbcFilters((prev) => ({ ...prev, locations: event.target.value }))}
            />
          </div>
          </div>
          <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">URL calculée: {lbcComputedUrl || "(incomplete)"}</div>
          <Button
            size="sm"
            variant="outline"
            disabled={!lbcComputedUrl}
            onClick={() => lbcComputedUrl && window.open(lbcComputedUrl, "_blank", "noopener,noreferrer")}
          >
            Ouvrir
          </Button>
          </div>
          <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={async () => {
              try {
                const payload = {
                  category: lbcFilters.category ? Number(lbcFilters.category) : undefined,
                  owner_type: lbcFilters.owner_type || "private",
                  locations: lbcFilters.locations
                    ? lbcFilters.locations
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    : [],
                  price_min: lbcFilters.price_min ? Number(lbcFilters.price_min) : null,
                  price_max: lbcFilters.price_max ? Number(lbcFilters.price_max) : null,
                  rooms_exact: lbcFilters.rooms_exact ? Number(lbcFilters.rooms_exact) : null,
                  bedrooms_exact: lbcFilters.bedrooms_exact ? Number(lbcFilters.bedrooms_exact) : null,
                  real_estate_type: [
                    ...(lbcFilters.real_estate_type.two ? [2] : []),
                    ...(lbcFilters.real_estate_type.one ? [1] : []),
                  ],
                };
                await updatePlatformConfig(searchId, "leboncoin", {
                  mode: "filters",
                  override_url: null,
                  filters: payload,
                });
                queryClient.invalidateQueries({ queryKey: ["search", searchId] });
                toast({ title: "Filtres Leboncoin enregistrés" });
              } catch (err) {
                toast({ title: "Erreur", description: (err as Error).message });
              }
            }}
          >
            Enregistrer
          </Button>
          </div>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {transactionTypes.includes("rent") && (
            <TabsTrigger value="rent">{TRANSACTION_LABELS.rent}</TabsTrigger>
          )}
          {transactionTypes.includes("sale") && (
            <TabsTrigger value="sale">{TRANSACTION_LABELS.sale}</TabsTrigger>
          )}
        </TabsList>
        {transactionTypes.includes("rent") && (
          <TabsContent value="rent">{renderTable(resultsByTransaction.rent)}</TabsContent>
        )}
        {transactionTypes.includes("sale") && (
          <TabsContent value="sale">{renderTable(resultsByTransaction.sale)}</TabsContent>
        )}
      </Tabs>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu {preview?.type || ""}</DialogTitle>
            <DialogDescription>Run #{preview?.runId}</DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : previewItems.length ? (
            <div className="space-y-2">
              {previewFallback ? (
                <div className="text-xs text-muted-foreground">Liens extraits (fallback)</div>
              ) : null}
              <ul className="space-y-2">{previewItems.map(renderPreviewItem)}</ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun item.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {preview?.runId && preview?.type && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `/api/runs/${preview.runId}/${preview.type}?limit=200`,
                    "_blank"
                  )
                }
              >
                Voir tout
              </Button>
            )}
            {preview?.type === "listings" && previewItems.length > 0 && (
              <Button variant="outline" onClick={openAllPreviewUrls}>
                Ouvrir toutes les annonces
              </Button>
            )}
            {preview?.type === "listings" && (
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(OWNER_MESSAGE_TEMPLATE);
                  toast({ title: "Message copié" });
                }}
              >
                Copier message propriétaire
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={urlModalOpen} onOpenChange={setUrlModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assistant {urlModalPlatform}</DialogTitle>
            <DialogDescription>
              Utiliser uniquement si l&apos;automatique est bloqué par anti-bot. Collez une URL valide (https).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://..."
              value={urlModalValue}
              onChange={(event) => setUrlModalValue(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUrlModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await updatePlatformConfig(searchId, urlModalPlatform, {
                      mode: "override",
                      override_url: urlModalValue,
                    });
                    setUrlModalOpen(false);
                    toast({ title: "URL enregistrée" });
                    queryClient.invalidateQueries({ queryKey: ["search", searchId] });
                    queryClient.invalidateQueries({ queryKey: ["searches"] });
                  } catch (err) {
                    toast({ title: "Erreur", description: (err as Error).message });
                  }
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assistant import {importModalPlatform}</DialogTitle>
            <DialogDescription>
              Collez une URL de recherche une seule fois, l&apos;application en déduit ensuite les filtres automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://..."
              value={importModalUrl}
              onChange={(event) => setImportModalUrl(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await importPlatformUrl(searchId, importModalPlatform, importModalUrl);
                    setImportModalOpen(false);
                    setImportModalUrl("");
                    queryClient.invalidateQueries({ queryKey: ["search", searchId] });
                    toast({ title: "URL importée" });
                  } catch (err) {
                    toast({ title: "Erreur", description: (err as Error).message });
                  }
                }}
              >
                Importer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(diagnosticRunId)} onOpenChange={(open) => !open && setDiagnosticRunId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Diagnostic run</DialogTitle>
            <DialogDescription>Run #{diagnosticRunId}</DialogDescription>
          </DialogHeader>
          {diagnosticLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : diagnostic ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2">
                <div><strong>Plateforme:</strong> {diagnostic.platform || "-"}</div>
                <div><strong>Status:</strong> {diagnostic.status || "-"}</div>
                <div><strong>Input URL:</strong> {diagnostic.input_url || "-"}</div>
                <div><strong>Final URL:</strong> {diagnostic.final_url || "-"}</div>
                <div><strong>Cards:</strong> {diagnostic.cards_raw_count ?? 0}</div>
                <div><strong>Liens extraits:</strong> {diagnostic.links_kept_count ?? 0}</div>
                <div><strong>Listings créés:</strong> {diagnostic.listings_created ?? 0}</div>
                <div><strong>Erreur:</strong> {diagnostic.last_error || "-"}</div>
              </div>
              {diagnostic.listings_created === 0 &&
              diagnostic.extracted_links &&
              diagnostic.extracted_links.length ? (
                <div className="rounded border border-dashed p-3">
                  <div className="text-sm font-medium">Liens extraits (debug)</div>
                  <ul className="mt-2 space-y-1">
                    {diagnostic.extracted_links.slice(0, PREVIEW_LIMIT).map((link, idx) => (
                      <li key={idx} className="text-sm">
                        <a className="underline" href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {diagnosticListings.length === 0 &&
              typeof diagnostic.links_kept_count === "number" &&
              diagnostic.links_kept_count > 0 ? (
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-700">
                  Ingest failed : liens extraits mais aucune annonce ingérée.
                  {diagnostic.last_error ? ` (${diagnostic.last_error})` : ""}
                </div>
              ) : null}
              <div>
                <div className="font-medium">
                  {diagnosticFallback ? "Liens extraits" : "Listings"} (10 max)
                </div>
                {diagnosticListings.length ? (
                  <ul className="mt-2 space-y-1">
                    {diagnosticListings.map(renderPreviewItem)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun listing.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Diagnostic indisponible.</p>
          )}
          {diagnosticRunId && (
            <Button
              variant="outline"
              onClick={() => window.open(`/api/runs/${diagnosticRunId}/debug`, "_blank")}
            >
              Ouvrir JSON debug
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
