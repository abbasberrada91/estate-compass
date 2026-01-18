import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createContact } from "@/lib/api";

export default function NewContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact cree" });
      navigate("/contacts");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      type: "proprietaire",
      first_name: "",
      last_name: name,
      email,
      phone,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nouveau contact</h1>
        <Button onClick={handleSubmit} disabled={mutation.isPending || !name}>
          Creer
        </Button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Nom</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dupont" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.fr" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Telephone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 00 00 00 00" />
        </div>
      </div>
    </div>
  );
}
