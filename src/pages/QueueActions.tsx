import { useMemo } from "react";
import { ExternalLink, Copy, Check, RotateCcw, ShieldAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getHumanTasks, getLeads, rerunPlatform, resolveHumanTask, updateLeadStatus } from "@/lib/api";
import type { HumanTask, LeadRecord } from "@/lib/types";

const DEFAULT_MESSAGE =
  "Bonjour, je suis interesse par votre bien. Seriez-vous disponible pour en discuter ?";

const platformLabel = (platform?: string | null) => {
  if (platform === "seloger") return "SeLoger";
  if (platform === "leboncoin") return "Leboncoin";
  if (platform === "pap") return "PAP";
  return platform || "-";
};

const pickTaskUrl = (task: HumanTask) =>
  task.human_url || task.recommended_url || task.page_url || task.final_url || "";

export default function QueueActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: humanTasks = [], isLoading: humanTasksLoading } = useQuery({
    queryKey: ["human-tasks", "open"],
    queryFn: () => getHumanTasks("open", 200) as Promise<HumanTask[]>,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", "A_CONTACTER"],
    queryFn: () => getLeads("A_CONTACTER") as Promise<LeadRecord[]>,
  });

  const resolveTaskMutation = useMutation({
    mutationFn: ({ taskId, solveNotes }: { taskId: number; solveNotes?: string }) => resolveHumanTask(taskId, solveNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["human-tasks"] });
    },
  });

  const rerunAndResolveMutation = useMutation({
    mutationFn: async (task: HumanTask) => {
      if (!task.search_id || !task.platform) {
        throw new Error("Relance impossible: search_id ou plateforme manquante.");
      }
      await rerunPlatform(task.search_id, task.platform);
      await resolveHumanTask(task.id, "resolved_after_rerun");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["human-tasks"] });
      toast({ title: "Run relance", description: "La tache a ete marquee comme resolue." });
    },
    onError: (error: Error) => {
      toast({ title: "Echec relance", description: error.message });
    },
  });

  const items = useMemo(() => leads, [leads]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(DEFAULT_MESSAGE);
    toast({ title: "Message copie" });
  };

  const handleMarkContacted = async (leadId: number) => {
    await updateLeadStatus(leadId, "CONTACTE");
    toast({ title: "Lead mis a jour" });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Queue d'actions</h1>
        <div className="text-sm text-muted-foreground">
          {humanTasks.length} actions anti-bot en attente • {items.length} leads a traiter
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold">Actions humaines requises</h2>
        </div>
        <div>
          {humanTasksLoading && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Chargement des actions anti-bot...</div>
          )}
          {!humanTasksLoading && humanTasks.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Aucune action humaine en attente.</div>
          )}
          {!humanTasksLoading && humanTasks.map((task) => {
            const taskUrl = pickTaskUrl(task);
            const canRerun = Boolean(task.search_id && task.platform);
            return (
              <div key={task.id} className="px-4 py-4 border-b last:border-b-0 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {platformLabel(task.platform)} • Task #{task.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {task.reason_code || task.reason || "needs_human"} • run #{task.run_id || "-"} • recherche #{task.search_id || "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!taskUrl) {
                          toast({ title: "URL absente", description: "Aucune URL disponible pour cette tache." });
                          return;
                        }
                        window.open(taskUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ouvrir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => rerunAndResolveMutation.mutate(task)}
                      disabled={!canRerun || rerunAndResolveMutation.isPending}
                      className="gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Relancer
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        resolveTaskMutation.mutate({
                          taskId: task.id,
                          solveNotes: "resolved_manually",
                        })
                      }
                      disabled={resolveTaskMutation.isPending}
                    >
                      Resolu
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {task.recommended_next_action || "Ouvrir l'URL, valider le challenge puis relancer le run."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="data-table">
        <div className="data-table-header grid grid-cols-[1fr_140px_140px_160px] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Lead</div>
          <div>Plateforme</div>
          <div>Ville</div>
          <div>Actions</div>
        </div>

        <div>
          {items.map((lead) => (
            <div
              key={lead.id}
              className="data-table-row grid grid-cols-[1fr_140px_140px_160px] gap-4 px-4 py-3 items-center"
            >
              <div>
                <div className="font-medium">{lead.title || `Lead #${lead.id}`}</div>
                <div className="text-xs text-muted-foreground">
                  {(lead.price || 0).toLocaleString("fr-FR")} EUR • {lead.surface || "-"} m²
                </div>
              </div>
              <div className="text-sm">{lead.platform || "-"}</div>
              <div className="text-sm">{lead.city || "-"}</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => lead.url && window.open(lead.url, "_blank")}
                  className="gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  Copier
                </Button>
                <Button size="sm" onClick={() => handleMarkContacted(lead.id)} className="gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Contacte
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Aucune action en attente.</div>
          )}
        </div>
      </div>
    </div>
  );
}
