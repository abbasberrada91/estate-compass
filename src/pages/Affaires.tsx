import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockAffaires, getAffaireStatutLabel, getBienById, getContactById, type Affaire } from "@/data/mockData";

export default function Affaires() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");

  const filteredAffaires = mockAffaires.filter((affaire) => {
    const bien = getBienById(affaire.bienId);
    const matchesSearch = bien?.reference.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatut = statutFilter === "all" || affaire.statut === statutFilter;
    const matchesOperation = operationFilter === "all" || affaire.operation === operationFilter;
    return matchesSearch && matchesStatut && matchesOperation;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatutVariant = (statut: Affaire["statut"]) => {
    const variants: Record<Affaire["statut"], "default" | "success" | "warning" | "info" | "error"> = {
      en_cours: "info",
      sous_compromis: "warning",
      sous_acte: "pending" as any,
      finalisee: "success",
      annulee: "error",
    };
    return variants[statut];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Registre des affaires</h1>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="sous_compromis">Sous compromis</SelectItem>
            <SelectItem value="sous_acte">Sous acte</SelectItem>
            <SelectItem value="finalisee">Finalisée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type de transaction" />
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
        <span>{filteredAffaires.length} affaires</span>
        <div className="flex items-center gap-2">
          <span>Trier par</span>
          <Select defaultValue="date">
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="montant">Montant</SelectItem>
              <SelectItem value="statut">État</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[100px_1fr_1fr_1fr_120px_120px_140px_120px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Opération</div>
          <div>Nature et situation du bien</div>
          <div>Vendeur(s)/Bailleur(s)</div>
          <div>Acquéreur(s)/Locataire(s)</div>
          <div>Montant</div>
          <div>Honoraires</div>
          <div>Conditions Susp.</div>
          <div>État</div>
          <div></div>
        </div>

        {/* Body */}
        <div>
          {filteredAffaires.map((affaire) => {
            const bien = getBienById(affaire.bienId);
            const vendeur = getContactById(affaire.vendeurId);
            const acquereur = getContactById(affaire.acquereurId);

            return (
              <div
                key={affaire.id}
                className="data-table-row grid grid-cols-[100px_1fr_1fr_1fr_120px_120px_140px_120px_auto] gap-4 px-4 py-3 items-center"
              >
                {/* Opération */}
                <div className="flex items-center gap-2">
                  <div className="avatar-badge">
                    {affaire.operation === "vente" ? "V" : "L"}
                  </div>
                  <span className="capitalize text-sm">{affaire.operation}</span>
                </div>

                {/* Bien */}
                <div>
                  {bien && (
                    <>
                      <StatusBadge variant="outline" className="bg-accent/10 text-accent border-accent/20 mb-1">
                        {bien.reference}
                      </StatusBadge>
                      <div className="text-sm text-muted-foreground">
                        {bien.type} {bien.pieces} pièces, {bien.codePostal} {bien.ville}
                      </div>
                    </>
                  )}
                </div>

                {/* Vendeur */}
                <div>
                  {vendeur && (
                    <StatusBadge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {vendeur.prenom} {vendeur.nom}
                    </StatusBadge>
                  )}
                </div>

                {/* Acquéreur */}
                <div className="text-sm">
                  {acquereur && (
                    <span>{acquereur.prenom} {acquereur.nom}</span>
                  )}
                </div>

                {/* Montant */}
                <div className="font-medium">
                  {formatPrice(affaire.montant)}
                </div>

                {/* Honoraires */}
                <div className="text-sm">
                  {formatPrice(affaire.honoraires)}
                </div>

                {/* Conditions suspensives */}
                <div className="text-sm text-muted-foreground">
                  {affaire.conditionsSuspensives || "—"}
                </div>

                {/* État */}
                <div>
                  <StatusBadge variant={getStatutVariant(affaire.statut)}>
                    {getAffaireStatutLabel(affaire.statut)}
                  </StatusBadge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
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
