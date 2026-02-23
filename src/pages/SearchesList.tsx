import { useMemo, useState } from "react";
import { BarChart3, Play, Plus, Pencil, Power } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSearches, runSearch, toggleSearchActive } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SearchRecord } from "@/lib/types";
import type { SearchKind } from "@/lib/searchQuery";

const TRANSACTION_LABELS: Record<string, string> = {
  rent: "LOC",
  sale: "VENTE",
};

const isPapUrlMissing = (queryJson?: string | Record<string, unknown> | null) => {
  if (!queryJson) return false;
  try {
    const parsed = typeof queryJson === "string" ? JSON.parse(queryJson) : queryJson;
    const platforms = Array.isArray(parsed?.platforms) ? parsed.platforms : [];
    const usesPap = platforms.some((item: { name?: string }) => item?.name === "pap");
    if (!usesPap) return false;
    const papUrl = parsed?.pap?.url || parsed?.urls?.pap || parsed?.url;
    return typeof papUrl !== "string" || !papUrl.startsWith("https://www.pap.fr/annonce/");
  } catch (_error) {
    return false;
  }
};

interface SearchesListProps {
  kind?: SearchKind | null;
  title: string;
  createPath: string;
}

export default function SearchesList({ kind, title, createPath }: SearchesListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: searches = [] } = useQuery({
    queryKey: ["searches"],
    queryFn: () => getSearches() as Promise<SearchRecord[]>,
  });
  const [runningId, setRunningId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleSearchActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searches"] });
    },
  });

  const runMutation = useMutation({
    mutationFn: (id: number) => runSearch(id),
    onMutate: (id: number) => {
      setRunningId(id);
      queryClient.setQueryData<SearchRecord[]>(["searches"], (prev) =>
        prev?.map((item) =>
          item.id === id ? { ...item, status: "running" } : item
        ) || []
      );
    },
    onSuccess: (data, id) => {
      const result = (data as { result?: { total_results?: number; platforms?: Array<{ platform?: string; results?: number }> } })?.result;
      const total = result?.total_results;
      const platformSummary =
        result?.platforms
          ?.map((item) => `${item.platform ?? "plateforme"}: ${item.results ?? 0}`)
          .join(" • ") || "";
      toast({
        title: "Recherche lancee",
        description: total !== undefined ? `Total: ${total}${platformSummary ? ` (${platformSummary})` : ""}` : platformSummary || undefined,
      });
      queryClient.setQueryData<SearchRecord[]>(["searches"], (prev) =>
        prev?.map((item) =>
          item.id === id ? { ...item, status: "completed" } : item
        ) || []
      );
    },
    onError: (error: Error, id) => {
      toast({ title: "Erreur", description: error.message });
      queryClient.setQueryData<SearchRecord[]>(["searches"], (prev) =>
        prev?.map((item) =>
          item.id === id ? { ...item, status: "error" } : item
        ) || []
      );
    },
    onSettled: () => {
      setRunningId(null);
      queryClient.invalidateQueries({ queryKey: ["searches"] });
    },
  });

  const filtered = useMemo(() => {
    if (!kind) return searches;
    return searches.filter((item) => item.kind === kind);
  }, [kind, searches]);

  const getTransactionBadges = (queryJson?: string | Record<string, unknown> | null) => {
    if (!queryJson) return ["LOC"];
    try {
      const parsed = typeof queryJson === "string" ? JSON.parse(queryJson) : queryJson;
      const types = Array.isArray(parsed?.transaction?.types) ? parsed.transaction.types : [];
      if (!types.length) return ["LOC"];
      return types
        .map((type: string) => TRANSACTION_LABELS[type])
        .filter((label: string | undefined) => Boolean(label));
    } catch (_error) {
      return ["LOC"];
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <Button className="gap-1.5" onClick={() => navigate(createPath)}>
          <Plus className="h-4 w-4" />
          Nouvelle recherche
        </Button>
      </div>

      <div className="card p-4">
        <div className="text-sm font-medium mb-4">Recherches ({filtered.length})</div>
        <div className="text-xs text-muted-foreground mb-4">
          Toutes les recherches créées sont mémorisées et listées ici (actives et inactives).
        </div>
        <div className="space-y-3">
          {filtered.map((search) => (
            <div key={search.id} className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="font-medium">{search.name} <span className="text-xs text-muted-foreground">#{search.id}</span></div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{search.kind} • {search.active ? "Active" : "Inactive"}</span>
                  <span>Dernier run: {search.last_run_at ? new Date(search.last_run_at).toLocaleString() : "jamais"}</span>
                  {getTransactionBadges(search.query_json).map((label) => (
                    <span
                      key={`${search.id}-${label}`}
                      className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] uppercase tracking-wide"
                    >
                      {label}
                    </span>
                  ))}
                  <StatusBadge variant={search.status === "error" ? "error" : search.status === "running" ? "warning" : "success"}>
                    {search.status || "idle"}
                  </StatusBadge>
                  {isPapUrlMissing(search.query_json) ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wide">
                      PAP: URL manquante
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate(`/recherches/${search.id}/resultats`)}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate(`/recherches/${search.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {isPapUrlMissing(search.query_json) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/recherches/${search.id}`)}
                  >
                    Renseigner URL PAP
                  </Button>
                ) : null}
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={runMutation.isPending && runningId === search.id}
                  onClick={() => runMutation.mutate(search.id)}
                >
                  <Play className={runningId === search.id ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => mutation.mutate({ id: search.id, active: !search.active })}
                >
                  {search.active ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title={search.active ? "Désactiver" : "Activer"}
                  onClick={() => mutation.mutate({ id: search.id, active: !search.active })}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">Aucune recherche pour l'instant.</div>
          )}
        </div>
      </div>
    </div>
  );
}
