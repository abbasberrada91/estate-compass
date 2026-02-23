import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Filter, Eye, MessageSquare, Check, X, ExternalLink, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { convertLead, getLeads, updateLeadStatus } from "@/lib/api";
import type { LeadRecord } from "@/lib/types";

const LEAD_LABELS: Record<string, string> = {
  A_CONTACTER: "A contacter",
  CONTACTE: "Contacte",
  REPONSE_RECUE: "Reponse recue",
  OUI_PROPRIO: "Proprietaire OK",
  NON: "Non",
  ARCHIVE: "Archive",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
  A_CONTACTER: "warning",
  CONTACTE: "info",
  REPONSE_RECUE: "info",
  OUI_PROPRIO: "success",
  NON: "default",
  ARCHIVE: "default",
};

export default function ProspectionPije() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("nouveaux");
  const [platformTab, setPlatformTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const prevIdsRef = useRef<Set<number>>(new Set());

  const { data: leadsData = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads() as Promise<LeadRecord[]>,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const ids = new Set(leadsData.map((lead) => lead.id));
    if (prevIdsRef.current.size > 0) {
      const newCount = leadsData.filter((lead) => !prevIdsRef.current.has(lead.id)).length;
      if (newCount > 0) {
        toast({
          title: "Nouveau lead detecte",
          description: `${newCount} nouveau(x) lead(s) disponible(s).`,
        });
      }
    }
    prevIdsRef.current = ids;
  }, [leadsData, toast]);

  const nouveauxLeads = useMemo(
    () => leadsData.filter((lead) => lead.status === "A_CONTACTER"),
    [leadsData]
  );
  const contactesLeads = useMemo(
    () => leadsData.filter((lead) => lead.status === "CONTACTE"),
    [leadsData]
  );

  const currentLeads = activeTab === "nouveaux" ? nouveauxLeads : contactesLeads;

  const filteredLeads = currentLeads.filter((lead) => {
    const title = lead.title || "";
    const city = lead.city || "";
    const matchesSearch =
      String(lead.listing_id).includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    const platform = lead.platform || "";
    const matchesPlatform = platformTab === "tous" || platform === platformTab;
    return matchesSearch && matchesPlatform;
  });

  const groupedLeads = useMemo(() => {
    if (activeTab !== "nouveaux") return [];
    const groups = new Map<string, LeadRecord[]>();
    filteredLeads.forEach((lead) => {
      const platform = lead.platform || "autre";
      const list = groups.get(platform) || [];
      list.push(lead);
      groups.set(platform, list);
    });
    return Array.from(groups.entries());
  }, [activeTab, filteredLeads]);

  const formatPrice = (price?: number | null) => {
    if (!price) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPlatformBadge = (platform: string) => {
    const styles: Record<string, string> = {
      pap: "bg-orange-100 text-orange-700 border-orange-200",
      leboncoin: "bg-amber-100 text-amber-700 border-amber-200",
      seloger: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[platform] || "bg-gray-100 text-gray-700";
  };

  const handleMarkContacted = async (leadId: number) => {
    await updateLeadStatus(leadId, "CONTACTE");
  };

  const handleMarkNo = async (leadId: number) => {
    await updateLeadStatus(leadId, "NON");
  };

  const handleConvert = async (leadId: number) => {
    await convertLead(leadId);
    toast({ title: "Bien cree" });
  };

  const handleCopyMessage = async (lead: LeadRecord) => {
    const message = [
      "Bonjour,",
      `Je vous contacte au sujet de votre annonce${lead.title ? ` \"${lead.title}\"` : ""}.`,
      "Je suis interesse(e) et disponible pour une visite.",
      "Pouvez-vous me confirmer la disponibilite du bien ?",
    ].join(" ");
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: "Message copie" });
    } catch (_error) {
      toast({ title: "Copie impossible", description: "Veuillez copier manuellement." });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Prospection PIJE - Inbox</h1>
        <Button className="gap-1.5" onClick={() => navigate("/prospection/pije/new")}>
          <Plus className="h-4 w-4" />
          Nouvelle recherche
        </Button>
      </div>

      {/* Main tabs: Nouveaux / Contactes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="nouveaux" className="gap-2">
            Nouveaux
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-status-warning text-status-warning-foreground">
              {nouveauxLeads.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contactes" className="gap-2">
            Contactes
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-status-pending text-status-pending-foreground">
              {contactesLeads.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Platform tabs */}
      <div className="flex items-center gap-4">
        <Tabs value={platformTab} onValueChange={setPlatformTab}>
          <TabsList>
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="pap">PAP</TabsTrigger>
            <TabsTrigger value="leboncoin">Leboncoin</TabsTrigger>
            <TabsTrigger value="seloger">SeLoger</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        <Button variant="outline" className="gap-1.5">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">{filteredLeads.length} leads</div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[100px_160px_100px_1fr_120px_100px_100px_120px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>REF</div>
          <div>Recherche</div>
          <div>Plateforme</div>
          <div>Annonce</div>
          <div>Ville</div>
          <div>Prix</div>
          <div>Surface</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {/* Body */}
        <div>
          {activeTab === "nouveaux" ? (
            groupedLeads.map(([platform, leads]) => (
              <div key={platform}>
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
                  {platform}
                </div>
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="data-table-row grid grid-cols-[100px_160px_100px_1fr_120px_100px_100px_120px_auto] gap-4 px-4 py-3 items-center"
                  >
                    {/* REF */}
                    <div className="font-medium text-primary">L-{lead.id}</div>

                    {/* Recherche */}
                    <div className="text-sm text-muted-foreground">
                      Recherche #{lead.listing_id}
                    </div>

                    {/* Plateforme */}
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] uppercase font-medium rounded border",
                          getPlatformBadge(lead.platform || "")
                        )}
                      >
                        {lead.platform || "-"}
                      </span>
                    </div>

                    {/* Annonce */}
                    <div>
                      <div className="font-medium text-sm line-clamp-1">{lead.title || "Annonce"}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {(lead.rooms || "-")} pieces • {(lead.surface || "-")} m²
                      </div>
                    </div>

                    {/* Ville */}
                    <div className="text-sm">
                      {lead.city || "-"}
                      <div className="text-xs text-muted-foreground">{lead.postal_code || ""}</div>
                    </div>

                    {/* Prix */}
                    <div className="font-medium">{formatPrice(lead.price)}</div>

                    {/* Surface */}
                    <div className="text-sm">{lead.surface ? `${lead.surface} m²` : "-"}</div>

                    {/* Statut */}
                    <div>
                      <StatusBadge variant={STATUS_VARIANTS[lead.status] || "default"}>
                        {LEAD_LABELS[lead.status] || lead.status}
                      </StatusBadge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyMessage(lead)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-status-success"
                        onClick={() => handleMarkContacted(lead.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-status-error"
                        onClick={() => handleMarkNo(lead.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {lead.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(lead.url || "", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleConvert(lead.id)}
                        title="Transformer en bien"
                      >
                        <Home className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="data-table-row grid grid-cols-[100px_160px_100px_1fr_120px_100px_100px_120px_auto] gap-4 px-4 py-3 items-center"
              >
                {/* REF */}
                <div className="font-medium text-primary">L-{lead.id}</div>

                {/* Recherche */}
                <div className="text-sm text-muted-foreground">Recherche #{lead.listing_id}</div>

                {/* Plateforme */}
                <div className="flex flex-wrap gap-1">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] uppercase font-medium rounded border",
                      getPlatformBadge(lead.platform || "")
                    )}
                  >
                    {lead.platform || "-"}
                  </span>
                </div>

                {/* Annonce */}
                <div>
                  <div className="font-medium text-sm line-clamp-1">{lead.title || "Annonce"}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {(lead.rooms || "-")} pieces • {(lead.surface || "-")} m²
                  </div>
                </div>

                {/* Ville */}
                <div className="text-sm">
                  {lead.city || "-"}
                  <div className="text-xs text-muted-foreground">{lead.postal_code || ""}</div>
                </div>

                {/* Prix */}
                <div className="font-medium">{formatPrice(lead.price)}</div>

                {/* Surface */}
                <div className="text-sm">{lead.surface ? `${lead.surface} m²` : "-"}</div>

                {/* Statut */}
                <div>
                  <StatusBadge variant={STATUS_VARIANTS[lead.status] || "default"}>
                    {LEAD_LABELS[lead.status] || lead.status}
                  </StatusBadge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopyMessage(lead)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-status-success"
                    onClick={() => handleMarkContacted(lead.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-status-error"
                    onClick={() => handleMarkNo(lead.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {lead.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(lead.url || "", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleConvert(lead.id)}
                    title="Transformer en bien"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
