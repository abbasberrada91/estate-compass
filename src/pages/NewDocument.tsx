import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { createDocument } from "@/lib/api";

export default function NewDocument() {
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("mandat");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document cree" });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      name,
      type: docType,
      status: "brouillon",
      category: docType,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nouveau document</h1>
        <Button onClick={handleSubmit} disabled={mutation.isPending || !name}>
          Creer
        </Button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Titre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mandat Neuilly" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mandat">Mandat</SelectItem>
              <SelectItem value="avenant">Avenant</SelectItem>
              <SelectItem value="fiche_bien">Fiche bien</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
