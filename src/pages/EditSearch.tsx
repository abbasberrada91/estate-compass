import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SearchForm } from "@/pages/SearchForm";
import { getSearch } from "@/lib/api";
import type { SearchRecord } from "@/lib/types";

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

export default function EditSearch() {
  const { id } = useParams();
  const searchId = Number(id);

  const { data } = useQuery({
    queryKey: ["search", searchId],
    queryFn: () => getSearch(searchId) as Promise<SearchRecord>,
    enabled: Number.isFinite(searchId),
  });

  const kind = data?.kind === "CONQ" ? "CONQ" : "PIGE";
  const platformOptions = useMemo(() => (kind === "CONQ" ? CONQ_PLATFORMS : PIGE_PLATFORMS), [kind]);

  if (!data) {
    return (
      <div className="card p-4">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <SearchForm
      kind={kind}
      title={`Modifier ${kind}`}
      platformOptions={platformOptions}
      searchId={searchId}
      initialData={data}
    />
  );
}
