import { useState } from "react";
import { Plus, Search, Filter, Eye, MessageSquare, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockLeads, type Lead } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function ProspectionPije() {
  const [activeTab, setActiveTab] = useState("nouveaux");
  const [platformTab, setPlatformTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const nouveauxLeads = mockLeads.filter(l => l.statut === "a_contacter");
  const aRelancerLeads = mockLeads.filter(l => l.statut === "a_relancer");

  const currentLeads = activeTab === "nouveaux" ? nouveauxLeads : aRelancerLeads;

  const filteredLeads = currentLeads.filter((lead) => {
    const matchesSearch = 
      lead.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformTab === "tous" || lead.plateformes.includes(platformTab as any);
    return matchesSearch && matchesPlatform;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatutLabel = (statut: Lead["statut"]) => {
    const labels: Record<Lead["statut"], string> = {
      a_contacter: "À contacter",
      contacte: "Contacté",
      a_relancer: "À relancer",
      oui_proprietaire: "Propriétaire OK",
      non: "Non",
      cloture: "Clôturé",
    };
    return labels[statut];
  };

  const getStatutVariant = (statut: Lead["statut"]) => {
    const variants: Record<Lead["statut"], "default" | "success" | "warning" | "info" | "error"> = {
      a_contacter: "warning",
      contacte: "info",
      a_relancer: "pending" as any,
      oui_proprietaire: "success",
      non: "default",
      cloture: "default",
    };
    return variants[statut];
  };

  const getPlatformBadge = (platform: string) => {
    const styles: Record<string, string> = {
      pap: "bg-orange-100 text-orange-700 border-orange-200",
      leboncoin: "bg-amber-100 text-amber-700 border-amber-200",
      seloger: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[platform] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Prospection PIJE - Inbox</h1>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvelle recherche
        </Button>
      </div>

      {/* Main tabs: Nouveaux / À relancer */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="nouveaux" className="gap-2">
            Nouveaux
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-status-warning text-status-warning-foreground">
              {nouveauxLeads.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="relancer" className="gap-2">
            À relancer
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-status-pending text-status-pending-foreground">
              {aRelancerLeads.length}
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
      <div className="text-sm text-muted-foreground">
        {filteredLeads.length} leads
      </div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[100px_200px_100px_1fr_100px_100px_100px_120px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>REF</div>
          <div>Recherche</div>
          <div>Plateforme(s)</div>
          <div>Annonce</div>
          <div>Ville</div>
          <div>Prix</div>
          <div>Surface</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {/* Body */}
        <div>
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="data-table-row grid grid-cols-[100px_200px_100px_1fr_100px_100px_100px_120px_auto] gap-4 px-4 py-3 items-center"
            >
              {/* REF */}
              <div className="font-medium text-primary">{lead.reference}</div>

              {/* Recherche */}
              <div className="text-sm text-muted-foreground">
                Recherche #{lead.searchProfileId}
              </div>

              {/* Plateformes */}
              <div className="flex flex-wrap gap-1">
                {lead.plateformes.map((platform) => (
                  <span
                    key={platform}
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] uppercase font-medium rounded border",
                      getPlatformBadge(platform)
                    )}
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {/* Annonce */}
              <div>
                <div className="font-medium text-sm line-clamp-1">{lead.titre}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {lead.pieces} pièces • {lead.surface} m²
                </div>
              </div>

              {/* Ville */}
              <div className="text-sm">
                {lead.ville}
                <div className="text-xs text-muted-foreground">{lead.codePostal}</div>
              </div>

              {/* Prix */}
              <div className="font-medium">{formatPrice(lead.prix)}</div>

              {/* Surface */}
              <div className="text-sm">{lead.surface} m²</div>

              {/* Statut */}
              <div>
                <StatusBadge variant={getStatutVariant(lead.statut)}>
                  {getStatutLabel(lead.statut)}
                </StatusBadge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Préparer message IA">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-status-success" title="OUI Propriétaire">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Non / Clôturer">
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir l'annonce">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucun lead trouvé
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <span>Page 1/1</span>
          <Select defaultValue="20">
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 résultats</SelectItem>
              <SelectItem value="20">20 résultats</SelectItem>
              <SelectItem value="50">50 résultats</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
