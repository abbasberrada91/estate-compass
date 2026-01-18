import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createSearchProfile, getSearchProfiles, updateSearchProfile } from "@/lib/api";
import type { SearchProfile } from "@/lib/types";

export default function Recherches() {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("seloger");
  const [queryJson, setQueryJson] = useState("{}");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["search-profiles"],
    queryFn: () => getSearchProfiles() as Promise<SearchProfile[]>,
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId ? updateSearchProfile(editingId, payload) : createSearchProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-profiles"] });
      toast({ title: editingId ? "Recherche mise a jour" : "Recherche creee" });
      setName("");
      setQueryJson("{}");
      setActive(true);
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(queryJson || "{}");
    } catch (error) {
      toast({ title: "JSON invalide", description: "Verifiez le format de la requete." });
      return;
    }

    mutation.mutate({
      name,
      platform,
      query: parsed,
      active,
    });
  };

  const handleEdit = (profile: SearchProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setPlatform(profile.platform);
    setQueryJson(profile.query_json || "{}");
    setActive(Boolean(profile.active));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Recherches</h1>
        <Button className="gap-1.5" onClick={handleSubmit} disabled={mutation.isPending || !name.trim()}>
          <Save className="h-4 w-4" />
          {editingId ? "Mettre a jour" : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" />
            Nouvelle recherche
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Nom</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Recherche PIJE 1" />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Plateforme</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seloger">SeLoger</SelectItem>
                <SelectItem value="leboncoin">Leboncoin</SelectItem>
                <SelectItem value="pap">PAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Requete JSON</label>
            <Textarea
              rows={6}
              value={queryJson}
              onChange={(e) => setQueryJson(e.target.value)}
              placeholder='{"url": "https://www.seloger.com/..."}'
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={active} onCheckedChange={(value) => setActive(Boolean(value))} />
            Active
          </label>
        </div>

        <div className="card p-4">
          <div className="text-sm font-medium mb-4">Recherches existantes ({profiles.length}/100)</div>
          <div className="space-y-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleEdit(profile)}
                className="w-full text-left flex items-center justify-between border-b border-border pb-3"
              >
                <div>
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {profile.platform} • {profile.active ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                </div>
              </button>
            ))}
            {profiles.length === 0 && (
              <div className="text-sm text-muted-foreground">Aucune recherche pour l'instant.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
