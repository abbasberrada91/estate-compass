import { useState } from "react";
import { Plus, Search, Filter, List, Grid, Eye, MapPin, Maximize2, Pencil, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockBiens, getContactById, getBienStatutLabel, type Bien } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Biens() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const filteredBiens = mockBiens.filter((bien) => {
    const matchesSearch = 
      bien.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bien.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bien.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOperation = operationFilter === "all" || bien.operation === operationFilter;
    const matchesStatut = statutFilter === "all" || bien.statut === statutFilter;
    return matchesSearch && matchesOperation && matchesStatut;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatutVariant = (statut: Bien["statut"]) => {
    const variants: Record<Bien["statut"], "default" | "success" | "warning" | "info" | "error"> = {
      disponible: "success",
      sous_option: "warning",
      sous_compromis: "info",
      vendu: "default",
      loue: "default",
      archive: "default",
    };
    return variants[statut];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Résultats de votre recherche</h1>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="sous_option">Sous option</SelectItem>
            <SelectItem value="sous_compromis">Sous compromis</SelectItem>
            <SelectItem value="vendu">Vendu</SelectItem>
          </SelectContent>
        </Select>

        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type d'offre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>

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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredBiens.length} biens</span>
        <div className="flex items-center gap-2">
          <span>Trier par</span>
          <Select defaultValue="date">
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="prix">Prix</SelectItem>
              <SelectItem value="surface">Surface</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List view */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[auto_80px_1fr_1fr_120px_100px_80px_80px_140px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Checkbox />
          </div>
          <div>Photo</div>
          <div>Identification</div>
          <div>Caractéristiques</div>
          <div>Montant</div>
          <div>Parkings</div>
          <div>En ligne</div>
          <div>Mis en avant</div>
          <div>Date de création</div>
          <div></div>
        </div>

        {/* Body */}
        <div>
          {filteredBiens.map((bien) => {
            const proprietaire = getContactById(bien.proprietaireId);
            
            return (
              <div
                key={bien.id}
                className="data-table-row grid grid-cols-[auto_80px_1fr_1fr_120px_100px_80px_80px_140px_auto] gap-4 px-4 py-3 items-center"
              >
                <div className="flex items-center gap-2">
                  <Checkbox />
                </div>

                {/* Photo */}
                <div className="relative">
                  <div className="w-20 h-14 bg-muted rounded overflow-hidden">
                    <img
                      src={bien.photos[0] || "/placeholder.svg"}
                      alt={bien.reference}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs">
                        ⊘
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-status-success text-status-success-foreground text-[10px] text-center py-0.5">
                      Sur le marché
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div>
                  <div className="font-semibold text-primary">{bien.reference}</div>
                  <div className="text-sm text-muted-foreground capitalize">{bien.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {bien.codePostal} {bien.ville}
                  </div>
                  {proprietaire && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 text-xs rounded bg-primary/10 text-primary">
                        {proprietaire.prenom?.[0]}{proprietaire.nom[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {proprietaire.prenom} {proprietaire.nom}
                      </span>
                    </div>
                  )}
                </div>

                {/* Caractéristiques */}
                <div className="text-sm space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{bien.surface} m²</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">◻</span>
                    <span>{bien.pieces} pièce(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">🛏</span>
                    <span>{bien.chambres} chambre(s)</span>
                  </div>
                </div>

                {/* Montant */}
                <div className="font-medium">
                  {formatPrice(bien.prix)}
                </div>

                {/* Parkings */}
                <div className="text-sm">1 place(s)</div>

                {/* En ligne */}
                <div>
                  <span className={cn(
                    "text-sm",
                    bien.enLigne ? "text-status-success" : "text-muted-foreground"
                  )}>
                    {bien.enLigne ? "Oui" : "Non"}
                  </span>
                </div>

                {/* Mis en avant */}
                <div>
                  <span className="text-sm text-muted-foreground">Non</span>
                </div>

                {/* Date de création */}
                <div className="text-sm text-muted-foreground">
                  {bien.createdAt.toLocaleDateString("fr-FR")}
                  <br />
                  à {bien.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground">
                    0
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Voir le bien">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Modifier le bien">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Publier le bien">
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

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
