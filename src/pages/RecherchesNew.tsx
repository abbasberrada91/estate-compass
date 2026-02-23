import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/pages/SearchForm";
import type { SearchKind } from "@/lib/searchQuery";

const PIGE_PLATFORMS = [
  { id: "seloger", label: "SeLoger" },
  { id: "pap", label: "PAP" },
  { id: "leboncoin", label: "Leboncoin" },
];

const CONQ_PLATFORMS = [
  { id: "seloger", label: "SeLoger", annonceur: "agence" },
  { id: "leboncoin", label: "Leboncoin", annonceur: "professionnel" },
  { id: "belles_demeures", label: "Belles Demeures" },
  { id: "figaro_immo", label: "Figaro Immo" },
  { id: "bienici", label: "Bien'ici" },
];

const normalizeMode = (value: string | null): SearchKind => {
  if (!value) return "PIGE";
  const lower = value.toLowerCase();
  return lower === "conq" ? "CONQ" : "PIGE";
};

export default function RecherchesNew() {
  const [params, setParams] = useSearchParams();
  const mode = useMemo(() => normalizeMode(params.get("mode")), [params]);

  const handleModeChange = (next: SearchKind) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("mode", next.toLowerCase());
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Nouvelle recherche</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "PIGE" ? "default" : "outline"}
            onClick={() => handleModeChange("PIGE")}
          >
            PIJE
          </Button>
          <Button
            variant={mode === "CONQ" ? "default" : "outline"}
            onClick={() => handleModeChange("CONQ")}
          >
            CONQ
          </Button>
        </div>
      </div>

      <SearchForm
        key={mode}
        kind={mode}
        title={mode === "PIGE" ? "Recherche PIJE" : "Recherche CONQ"}
        platformOptions={mode === "PIGE" ? PIGE_PLATFORMS : CONQ_PLATFORMS}
        showHeader={false}
      />
    </div>
  );
}
