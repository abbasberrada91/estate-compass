import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createProperty } from "@/lib/api";

export default function NewProperty() {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createProperty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: "Bien cree" });
      navigate("/biens");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      reference: title,
      address,
      price: price ? Number(price) : null,
      type: "appartement",
      operation: "vente",
      status: "disponible",
      description: title,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nouveau bien</h1>
        <Button onClick={handleSubmit} disabled={mutation.isPending || !title || !address}>
          Creer
        </Button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Titre</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bien Neuilly T3" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Adresse</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 rue ..." />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Prix</label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1200000" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Description</label>
          <Textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} />
        </div>
      </div>
    </div>
  );
}
