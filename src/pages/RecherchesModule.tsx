import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchesList from "@/pages/SearchesList";
import type { SearchKind } from "@/lib/searchQuery";

const normalizeMode = (value: string | null): SearchKind | null => {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "pije") return "PIGE";
  if (lower === "conq") return "CONQ";
  return null;
};

export default function RecherchesModule() {
  const [params] = useSearchParams();
  const mode = useMemo(() => normalizeMode(params.get("mode")), [params]);
  const title = mode ? `Recherches ${mode}` : "Recherches";
  const createPath = mode ? `/recherches/new?mode=${mode.toLowerCase()}` : "/recherches/new";

  return <SearchesList kind={mode} title={title} createPath={createPath} />;
}
