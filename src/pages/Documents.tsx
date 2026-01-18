import { useMemo, useState } from "react";
import { Plus, Search, Filter, Eye, FileText } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { generateDocument, getContacts, getDocuments, getProperties } from "@/lib/api";
import type { Contact, DocumentRecord, Property } from "@/lib/types";

const documentStatusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  signature_en_cours: "Signature en cours",
  signe: "Signe",
  complet: "Complet",
};

const documentStatusVariants: Record<string, "default" | "success" | "warning" | "info" | "pending"> = {
  brouillon: "default",
  signature_en_cours: "warning",
  signe: "success",
  complet: "info",
};

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => getDocuments() as Promise<DocumentRecord[]>,
  });
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getProperties() as Promise<Property[]>,
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts() as Promise<Contact[]>,
  });

  const generateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => generateDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document genere" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatut = statutFilter === "all" || doc.status === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Documents Modelo Legal</h1>
        <Button
          className="gap-1.5"
          onClick={() => {
            if (!selectedPropertyId) {
              toast({ title: "Selectionnez un bien" });
              return;
            }
            generateMutation.mutate({
              template: "fiche_bien",
              name: "Fiche bien",
              property_id: Number(selectedPropertyId),
            });
          }}
        >
          <Plus className="h-4 w-4" />
          Generer fiche
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Bien" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={String(property.id)}>
                {property.reference || `Bien #${property.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Etat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="signature_en_cours">Signature en cours</SelectItem>
            <SelectItem value="signe">Signe</SelectItem>
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
        <span>{filteredDocuments.length} resultats</span>
        <div className="flex items-center gap-2">
          <span>Trier par</span>
          <Select defaultValue="date">
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="nom">Nom</SelectItem>
              <SelectItem value="statut">Etat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table">
        {/* Header */}
        <div className="data-table-header grid grid-cols-[1fr_200px_200px_160px_160px_140px_auto] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Nom</div>
          <div>Bien(s)</div>
          <div>Contact(s)</div>
          <div>Cree le</div>
          <div>Modifie le</div>
          <div>Etat / Completion</div>
          <div></div>
        </div>

        {/* Body */}
        <div>
          {filteredDocuments.map((doc) => {
            const property = doc.property_id ? propertyById.get(doc.property_id) : null;
            const contact = doc.contact_id ? contactById.get(doc.contact_id) : null;

            return (
              <div
                key={doc.id}
                className="data-table-row grid grid-cols-[1fr_200px_200px_160px_160px_140px_auto] gap-4 px-4 py-3 items-center"
              >
                {/* Nom */}
                <div className="flex items-center gap-3">
                  <div className="avatar-badge">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.type || "-"}</div>
                  </div>
                </div>

                {/* Bien */}
                <div>
                  {property ? (
                    <StatusBadge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {property.reference || `Bien #${property.id}`}
                    </StatusBadge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>

                {/* Contact */}
                <div>
                  {contact ? (
                    <span className="text-sm">
                      {contact.first_name} {contact.last_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>

                {/* Cree le */}
                <div className="text-sm text-muted-foreground">{formatDateTime(doc.created_at)}</div>

                {/* Modifie le */}
                <div className="text-sm text-muted-foreground">{formatDateTime(doc.updated_at)}</div>

                {/* Etat / Completion */}
                <div>
                  {doc.progress > 0 && doc.progress < 100 ? (
                    <StatusBadge progress={doc.progress} />
                  ) : (
                    <StatusBadge variant={documentStatusVariants[doc.status] || "default"}>
                      {documentStatusLabels[doc.status] || doc.status}
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
              <SelectItem value="10">10 resultats</SelectItem>
              <SelectItem value="20">20 resultats</SelectItem>
              <SelectItem value="50">50 resultats</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
