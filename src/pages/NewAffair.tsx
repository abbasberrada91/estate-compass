import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createAffair } from "@/lib/api";

export default function NewAffair() {
  const [title, setTitle] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createAffair(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affairs"] });
      toast({ title: "Affaire creee" });
      navigate("/affaires");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      operation: "vente",
      property_id: propertyId ? Number(propertyId) : null,
      seller_contact_id: sellerId ? Number(sellerId) : null,
      status: "en_cours",
      conditions: title,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nouvelle affaire</h1>
        <Button onClick={handleSubmit} disabled={mutation.isPending || !title}>
          Creer
        </Button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Titre</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Affaire Neuilly" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Bien ID (optionnel)</label>
          <Input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="1" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Contact vendeur ID (optionnel)</label>
          <Input value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="1" />
        </div>
      </div>
    </div>
  );
}
