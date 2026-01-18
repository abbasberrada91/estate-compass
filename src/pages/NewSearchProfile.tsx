import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createSearchProfile } from "@/lib/api";

const platforms = [
  { id: "seloger", label: "SeLoger" },
  { id: "pap", label: "PAP" },
  { id: "leboncoin", label: "Leboncoin" },
];

export default function NewSearchProfile() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [typeBien, setTypeBien] = useState("");
  const [minPieces, setMinPieces] = useState("");
  const [maxPrix, setMaxPrix] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({
    seloger: true,
    pap: false,
    leboncoin: false,
  });
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createSearchProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-profiles"] });
      toast({ title: "Recherche creee" });
      navigate("/prospection/recherches");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    const selectedPlatforms = platforms
      .map((platform) => (selected[platform.id] ? platform.id : null))
      .filter(Boolean);
    if (!name || selectedPlatforms.length === 0) {
      toast({ title: "Renseignez un nom et une plateforme" });
      return;
    }

    mutation.mutate({
      name,
      type: "PIJE",
      platforms: selectedPlatforms,
      criteria: {
        ville: city,
        type_bien: typeBien,
        min_pieces: minPieces ? Number(minPieces) : undefined,
        max_prix: maxPrix ? Number(maxPrix) : undefined,
      },
      is_active: isActive,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nouvelle recherche PIJE</h1>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          Creer
        </Button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Nom</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="PIJE Neuilly T3" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Ville</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Neuilly-sur-Seine" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Type de bien</label>
          <Input value={typeBien} onChange={(e) => setTypeBien(e.target.value)} placeholder="Appartement" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Minimum pieces</label>
            <Input value={minPieces} onChange={(e) => setMinPieces(e.target.value)} placeholder="3" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Prix max</label>
            <Input value={maxPrix} onChange={(e) => setMaxPrix(e.target.value)} placeholder="1200000" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Plateformes</label>
          <div className="flex flex-wrap gap-4">
            {platforms.map((platform) => (
              <label key={platform.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected[platform.id]}
                  onCheckedChange={(value) =>
                    setSelected((prev) => ({ ...prev, [platform.id]: Boolean(value) }))
                  }
                />
                {platform.label}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onCheckedChange={(value) => setIsActive(Boolean(value))} />
          Active
        </label>
      </div>
    </div>
  );
}
