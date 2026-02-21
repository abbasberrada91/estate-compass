import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Globe,
  GlobeLock,
  Save,
  X,
  MapPin,
  Maximize2,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getBienById,
  getContactById,
  updateBien,
  getBienStatutLabel,
  type Bien,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function BienDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const isEditing = searchParams.get("edit") === "true";

  const bien = id ? getBienById(id) : undefined;

  const [formData, setFormData] = useState<Partial<Bien>>(() =>
    bien ? { ...bien } : {}
  );

  if (!bien) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <h1 className="text-xl font-semibold mb-2">Bien introuvable</h1>
        <p className="text-muted-foreground mb-4">
          Ce bien n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate("/biens")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux biens
        </Button>
      </div>
    );
  }

  const proprietaire = getContactById(bien.proprietaireId);

  const getStatutVariant = (statut: Bien["statut"]) => {
    const variants: Record<
      Bien["statut"],
      "default" | "success" | "warning" | "info" | "error"
    > = {
      disponible: "success",
      sous_option: "warning",
      sous_compromis: "info",
      vendu: "default",
      loue: "default",
      archive: "default",
    };
    return variants[statut];
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleEdit = () => {
    setFormData({ ...bien });
    setSearchParams({ edit: "true" });
  };

  const handleCancelEdit = () => {
    setFormData({ ...bien });
    setSearchParams({});
  };

  const handleSave = () => {
    if (!id) return;
    const success = updateBien(id, formData);
    if (success) {
      setSearchParams({});
      toast({
        title: "Bien mis à jour",
        description: "Les modifications ont été enregistrées.",
      });
    }
  };

  const handleTogglePublish = () => {
    if (!id) return;
    const newEnLigne = !bien.enLigne;
    const success = updateBien(id, { enLigne: newEnLigne });
    if (success) {
      toast({
        title: newEnLigne ? "Bien publié" : "Bien dépublié",
        description: newEnLigne
          ? "Le bien est maintenant en ligne."
          : "Le bien a été retiré de la publication.",
      });
      // Force re-render by refreshing form state
      setFormData({ ...bien, enLigne: newEnLigne });
    }
  };

  const field = (
    label: string,
    value: React.ReactNode,
    editField?: React.ReactNode
  ) => (
    <div className="grid grid-cols-2 gap-2 items-start py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{isEditing && editField ? editField : value}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/biens")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title">{bien.reference}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {bien.type} · {bien.ville}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge variant={getStatutVariant(bien.statut)}>
            {getBienStatutLabel(bien.statut)}
          </StatusBadge>

          {!isEditing && (
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={handleTogglePublish}
              >
                {bien.enLigne ? (
                  <>
                    <GlobeLock className="h-4 w-4" />
                    Dépublier
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
              <Button className="gap-1.5" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </>
          )}

          {isEditing && (
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button className="gap-1.5" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          {bien.photos[0] && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={bien.photos[0]}
                alt={bien.reference}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* Identification */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Identification
            </h3>
            <div>
              {field(
                "Référence",
                <span className="font-mono font-medium text-primary">
                  {bien.reference}
                </span>
              )}
              {field(
                "Type de bien",
                <span className="capitalize">{bien.type}</span>,
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as Bien["type"] })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="bureau">Bureau</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {field(
                "Opération",
                <span className="capitalize">{bien.operation}</span>,
                <Select
                  value={formData.operation}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      operation: v as Bien["operation"],
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {field(
                "Statut",
                <StatusBadge variant={getStatutVariant(bien.statut)}>
                  {getBienStatutLabel(bien.statut)}
                </StatusBadge>,
                <Select
                  value={formData.statut}
                  onValueChange={(v) =>
                    setFormData({ ...formData, statut: v as Bien["statut"] })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="sous_option">Sous option</SelectItem>
                    <SelectItem value="sous_compromis">
                      Sous compromis
                    </SelectItem>
                    <SelectItem value="vendu">Vendu</SelectItem>
                    <SelectItem value="loue">Loué</SelectItem>
                    <SelectItem value="archive">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localisation
            </h3>
            <div>
              {field(
                "Adresse",
                bien.adresse,
                <Input
                  value={formData.adresse ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, adresse: e.target.value })
                  }
                  className="h-8"
                />
              )}
              {field(
                "Code postal",
                bien.codePostal,
                <Input
                  value={formData.codePostal ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, codePostal: e.target.value })
                  }
                  className="h-8"
                />
              )}
              {field(
                "Ville",
                bien.ville,
                <Input
                  value={formData.ville ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ville: e.target.value })
                  }
                  className="h-8"
                />
              )}
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              Caractéristiques
            </h3>
            <div>
              {field(
                "Surface",
                `${bien.surface} m²`,
                <Input
                  type="number"
                  value={formData.surface ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surface: Number(e.target.value),
                    })
                  }
                  className="h-8"
                />
              )}
              {field(
                "Pièces",
                bien.pieces,
                <Input
                  type="number"
                  value={formData.pieces ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pieces: Number(e.target.value),
                    })
                  }
                  className="h-8"
                />
              )}
              {field(
                "Chambres",
                bien.chambres,
                <Input
                  type="number"
                  value={formData.chambres ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chambres: Number(e.target.value),
                    })
                  }
                  className="h-8"
                />
              )}
              {field(
                "Prix",
                formatPrice(bien.prix),
                <Input
                  type="number"
                  value={formData.prix ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, prix: Number(e.target.value) })
                  }
                  className="h-8"
                />
              )}
              {field(
                "DPE",
                bien.dpe,
                <Select
                  value={formData.dpe}
                  onValueChange={(v) =>
                    setFormData({ ...formData, dpe: v as Bien["dpe"] })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D", "E", "F", "G"] as Bien["dpe"][]).map(
                      (letter) => (
                        <SelectItem key={letter} value={letter}>
                          {letter}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
              {field(
                "GES",
                bien.ges,
                <Select
                  value={formData.ges}
                  onValueChange={(v) =>
                    setFormData({ ...formData, ges: v as Bien["ges"] })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D", "E", "F", "G"] as Bien["ges"][]).map(
                      (letter) => (
                        <SelectItem key={letter} value={letter}>
                          {letter}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-semibold">Description</Label>
            </div>
            {isEditing ? (
              <Textarea
                value={formData.description ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {bien.description || "Aucune description"}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4">Publication</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">En ligne</span>
                <span
                  className={
                    bien.enLigne ? "text-status-success font-medium" : "text-muted-foreground"
                  }
                >
                  {bien.enLigne ? "Oui" : "Non"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mis en avant</span>
                <span className="text-muted-foreground">Non</span>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant={bien.enLigne ? "outline" : "default"}
                className="w-full mt-4 gap-1.5"
                onClick={handleTogglePublish}
              >
                {bien.enLigne ? (
                  <>
                    <GlobeLock className="h-4 w-4" />
                    Dépublier
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Propriétaire */}
          {proprietaire && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-4">Propriétaire</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  {proprietaire.prenom} {proprietaire.nom}
                </div>
                <a
                  href={`mailto:${proprietaire.email}`}
                  className="text-primary hover:underline block"
                >
                  {proprietaire.email}
                </a>
                <div className="text-muted-foreground">
                  {proprietaire.telephone}
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>{bien.createdAt.toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span>{bien.updatedAt.toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
