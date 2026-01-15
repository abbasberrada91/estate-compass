import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, MapPin, Mail, Phone } from "lucide-react";
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
import { mockContacts, getContactTypeLabel, type Contact } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch = 
      contact.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getInitials = (contact: Contact) => {
    if (contact.civilite === "Société") {
      return contact.nom.substring(0, 2).toUpperCase();
    }
    return `${contact.prenom[0] || ""}${contact.nom[0] || ""}`.toUpperCase();
  };

  const getTypeVariant = (type: Contact["type"]) => {
    const variants: Record<Contact["type"], "default" | "success" | "warning" | "info" | "pending"> = {
      proprietaire: "success",
      prospect_proprio: "warning",
      acquereur: "info",
      locataire: "pending",
      agence: "default",
    };
    return variants[type];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Carnet d'adresses</h1>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="proprietaire">Propriétaire</SelectItem>
            <SelectItem value="acquereur">Acquéreur</SelectItem>
            <SelectItem value="locataire">Locataire</SelectItem>
            <SelectItem value="agence">Agence</SelectItem>
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

      {/* Content */}
      <div className="flex gap-6">
        {/* Contact list */}
        <div className="flex-1">
          <div className="data-table">
            {/* Table header */}
            <div className="data-table-header grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-3">
                <Checkbox />
              </div>
              <div>Contact</div>
              <div>Type</div>
            </div>

            {/* Table body */}
            <div>
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "data-table-row grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-3 items-center",
                    selectedContact?.id === contact.id && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox />
                    <div className="avatar-badge">
                      {getInitials(contact)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {contact.civilite === "Société" 
                        ? contact.nom 
                        : `${contact.prenom} ${contact.nom}`}
                    </div>
                  </div>
                  <div>
                    <StatusBadge variant={getTypeVariant(contact.type)}>
                      {getContactTypeLabel(contact.type)}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>Page 1/1</span>
              <span>{filteredContacts.length} résultats</span>
            </div>
          </div>
        </div>

        {/* Contact detail */}
        <div className="w-96 shrink-0">
          {selectedContact ? (
            <div className="bg-card rounded-lg border border-border p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <Mail className="h-3 w-3" />
                  </span>
                  Coordonnées
                </h3>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Personne</span>
                  <span>{selectedContact.civilite === "Société" ? "Morale" : "Physique"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-primary font-medium">
                    {getContactTypeLabel(selectedContact.type)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Civilité</span>
                  <span>{selectedContact.civilite}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Nom</span>
                  <span>{selectedContact.nom}</span>
                </div>
                {selectedContact.prenom && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Prénom</span>
                    <span>{selectedContact.prenom}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">E-mail</span>
                  <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline truncate">
                    {selectedContact.email}
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Tél. port</span>
                  <span>{selectedContact.telephone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Pays</span>
                  <span>France</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Adresse</span>
                  <div className="flex items-start gap-1">
                    <span>{selectedContact.adresse}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
                      <MapPin className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Commune</span>
                  <span>{selectedContact.ville} {selectedContact.codePostal}</span>
                </div>
              </div>

              {/* Tags */}
              {selectedContact.tags.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.tags.map((tag) => (
                      <StatusBadge key={tag} variant="outline">
                        {tag}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-6 text-center text-muted-foreground">
              Sélectionnez un contact pour plus de détails
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
