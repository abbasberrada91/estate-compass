import { useMemo, useState } from "react";
import { Plus, Search, Filter, Phone, Mail, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getContacts } from "@/lib/api";
import type { Contact } from "@/lib/types";

const contactTypeLabels: Record<string, string> = {
  proprietaire: "Proprietaire",
  prospect_proprio: "Prospect proprio",
  acquereur: "Acquereur",
  locataire: "Locataire",
  agence: "Agence",
};

export default function Contacts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts() as Promise<Contact[]>,
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.city || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || contact.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, typeFilter]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <Button className="gap-1.5" onClick={() => navigate("/contacts/new")}>
          <Plus className="h-4 w-4" />
          Nouveau contact
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="proprietaire">Proprietaires</SelectItem>
            <SelectItem value="prospect_proprio">Prospects proprietaires</SelectItem>
            <SelectItem value="acquereur">Acquereurs</SelectItem>
            <SelectItem value="locataire">Locataires</SelectItem>
            <SelectItem value="agence">Agences</SelectItem>
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
      <div className="text-sm text-muted-foreground">{filteredContacts.length} contacts</div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredContacts.map((contact) => {
          const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Contact";
          const initials = `${contact.first_name?.[0] || ""}${contact.last_name?.[0] || ""}`.trim() || "C";
          return (
            <div key={contact.id} className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {contactTypeLabels[contact.type] || contact.type}
                  </div>
                </div>
                <Badge variant="secondary">{contact.city || "-"}</Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{contact.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{contact.address || "-"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
