import { useState } from "react";
import { Plus, Search, Filter, Eye, FileText } from "lucide-react";
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
import { mockDocuments, getDocumentStatutLabel, getBienById, getContactById, type Document } from "@/data/mockData";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatut = statutFilter === "all" || doc.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const getStatutVariant = (statut: Document["statut"]) => {
    const variants: Record<Document["statut"], "default" | "success" | "warning" | "info" | "pending"> = {
      brouillon: "default",
      signature_en_cours: "warning",
      signe: "success",
      complet: "info",
    };
    return variants[statut];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Documents Modelo Legal</h1>
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
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="signature_en_cours">Signature en cours</SelectItem>
            <SelectItem value="signe">Signé</SelectItem>
            <SelectItem value="complet">Complet</SelectItem>
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
        <span>{filteredDocuments.length} résultats</span>
        <div className="flex items-center gap-2">
          <span>Trier par</span>
          <Select defaultValue="date">
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="nom">Nom</SelectItem>
              <SelectItem value="statut">État</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[1fr_200px_200px_140px_140px_120px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Nom</div>
          <div>Bien(s)</div>
          <div>Contact(s)</div>
          <div>Créé le</div>
          <div>Modifié le</div>
          <div>État / Complétion</div>
          <div></div>
        </div>

        {/* Body */}
        <div>
          {filteredDocuments.map((doc) => {
            const bien = doc.bienId ? getBienById(doc.bienId) : null;
            const contact = doc.contactId ? getContactById(doc.contactId) : null;

            return (
              <div
                key={doc.id}
                className="data-table-row grid grid-cols-[1fr_200px_200px_140px_140px_120px_auto] gap-4 px-4 py-3 items-center"
              >
                {/* Nom */}
                <div className="flex items-center gap-3">
                  <div className="avatar-badge">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.type}</div>
                  </div>
                </div>

                {/* Bien */}
                <div>
                  {bien ? (
                    <StatusBadge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {bien.reference}
                    </StatusBadge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>

                {/* Contact */}
                <div>
                  {contact ? (
                    <span className="text-sm">
                      {contact.prenom} {contact.nom}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>

                {/* Créé le */}
                <div className="text-sm text-muted-foreground">
                  {doc.createdAt.toLocaleDateString("fr-FR")}
                  <br />
                  à {doc.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>

                {/* Modifié le */}
                <div className="text-sm text-muted-foreground">
                  {doc.updatedAt.toLocaleDateString("fr-FR")}
                  <br />
                  à {doc.updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>

                {/* État / Complétion */}
                <div>
                  {doc.progress > 0 && doc.progress < 100 ? (
                    <StatusBadge progress={doc.progress} />
                  ) : (
                    <StatusBadge variant={getStatutVariant(doc.statut)}>
                      {getDocumentStatutLabel(doc.statut)}
                    </StatusBadge>
                  )}
                </div>

                {/* Actions */}
                <div>
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
