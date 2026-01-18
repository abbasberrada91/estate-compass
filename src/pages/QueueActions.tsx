import { useMemo } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getLeads, updateLeadStatus } from "@/lib/api";
import type { LeadRecord } from "@/lib/types";

const DEFAULT_MESSAGE =
  "Bonjour, je suis interesse par votre bien. Seriez-vous disponible pour en discuter ?";

export default function QueueActions() {
  const { toast } = useToast();
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads("A_CONTACTER") as Promise<LeadRecord[]>,
  });

  const items = useMemo(() => leads, [leads]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(DEFAULT_MESSAGE);
    toast({ title: "Message copie" });
  };

  const handleMarkContacted = async (leadId: number) => {
    await updateLeadStatus(leadId, "CONTACTE");
    toast({ title: "Lead mis a jour" });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Queue d'actions</h1>
        <div className="text-sm text-muted-foreground">{items.length} leads a traiter</div>
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
