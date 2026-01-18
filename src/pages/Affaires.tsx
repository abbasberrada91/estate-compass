import { useMemo, useState } from "react";
import { Plus, Search, Filter, Eye, Edit2 } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { getAffairs, getContacts, getProperties } from "@/lib/api";
import type { Affair, Contact, Property } from "@/lib/types";

const affaireStatusLabels: Record<string, string> = {
  en_cours: "En cours",
  sous_compromis: "Sous compromis",
  sous_acte: "Sous acte",
  finalisee: "Finalisee",
  annulee: "Annulee",
};

const affaireStatusVariants: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
  en_cours: "info",
  sous_compromis: "warning",
  sous_acte: "info",
  finalisee: "success",
  annulee: "error",
};

export default function Affaires() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");

  const { data: affairs = [] } = useQuery({
    queryKey: ["affairs"],
    queryFn: () => getAffairs() as Promise<Affair[]>,
  });
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getProperties() as Promise<Property[]>,
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts() as Promise<Contact[]>,
  });

  const propertyById = useMemo(() => {
    const map = new Map<number, Property>();
    properties.forEach((item) => map.set(item.id, item));
    return map;
  }, [properties]);

  const contactById = useMemo(() => {
    const map = new Map<number, Contact>();
    contacts.forEach((item) => map.set(item.id, item));
    return map;
  }, [contacts]);

  const filteredAffaires = useMemo(() => {
    return affairs.filter((affaire) => {
      const property = affaire.property_id ? propertyById.get(affaire.property_id) : undefined;
      const ref = property?.reference || "";
      const matchesSearch = ref.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatut = statutFilter === "all" || affaire.status === statutFilter;
      const matchesOperation = operationFilter === "all" || affaire.operation === operationFilter;
      return matchesSearch && matchesStatut && matchesOperation;
    });
  }, [affairs, propertyById, searchQuery, statutFilter, operationFilter]);

  const formatPrice = (price?: number | null) => {
    if (!price) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Registre des affaires</h1>
        <Button className="gap-1.5" onClick={() => navigate("/affaires/new")}>
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Etat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="sous_compromis">Sous compromis</SelectItem>
            <SelectItem value="sous_acte">Sous acte</SelectItem>
            <SelectItem value="finalisee">Finalisee</SelectItem>
            <SelectItem value="annulee">Annulee</SelectItem>
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
              <SelectItem value="statut">Etat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[100px_1fr_1fr_1fr_120px_120px_140px_120px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Operation</div>
          <div>Bien</div>
          <div>Vendeur(s)/Bailleur(s)</div>
          <div>Acquereur(s)/Locataire(s)</div>
          <div>Montant</div>
          <div>Honoraires</div>
          <div>Conditions Susp.</div>
          <div>Etat</div>
          <div></div>
        </div>

        {/* Body */}
        <div>
          {filteredAffaires.map((affaire) => {
            const property = affaire.property_id ? propertyById.get(affaire.property_id) : undefined;
            const seller = affaire.seller_contact_id ? contactById.get(affaire.seller_contact_id) : undefined;
            const buyer = affaire.buyer_contact_id ? contactById.get(affaire.buyer_contact_id) : undefined;

            return (
              <div
                key={affaire.id}
                className="data-table-row grid grid-cols-[100px_1fr_1fr_1fr_120px_120px_140px_120px_auto] gap-4 px-4 py-3 items-center"
              >
                {/* Operation */}
                <div className="flex items-center gap-2">
                  <div className="avatar-badge">{affaire.operation === "vente" ? "V" : "L"}</div>
                  <span className="capitalize text-sm">{affaire.operation || "-"}</span>
                </div>

                {/* Bien */}
                <div>
                  {property && (
                    <>
                      <StatusBadge variant="outline" className="bg-accent/10 text-accent border-accent/20 mb-1">
                        {property.reference || `Bien #${property.id}`}
                      </StatusBadge>
                      <div className="text-sm text-muted-foreground">
                        {property.type || "-"} {property.rooms || "-"} pieces, {property.postal_code || ""} {property.city || ""}
                      </div>
                    </>
                  )}
                </div>

                {/* Vendeur */}
                <div>
                  {seller && (
                    <StatusBadge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {seller.first_name} {seller.last_name}
                    </StatusBadge>
                  )}
                </div>

                {/* Acquereur */}
                <div className="text-sm">
                  {buyer && <span>{buyer.first_name} {buyer.last_name}</span>}
                </div>

                {/* Montant */}
                <div className="font-medium">{formatPrice(affaire.amount)}</div>

                {/* Honoraires */}
                <div className="text-sm">{formatPrice(affaire.fees)}</div>

                {/* Conditions */}
                <div className="text-sm text-muted-foreground">
                  {affaire.conditions || "-"}
                </div>

                {/* Etat */}
                <div>
                  <StatusBadge variant={affaireStatusVariants[affaire.status || ""] || "default"}>
                    {affaireStatusLabels[affaire.status || ""] || affaire.status || "-"}
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
      </div>
    </div>
  );
}
