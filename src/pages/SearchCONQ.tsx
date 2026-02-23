import { SearchForm } from "@/pages/SearchForm";

const CONQ_PLATFORMS = [
  { id: "seloger", label: "SeLoger", annonceur: "agence" },
  { id: "leboncoin", label: "Leboncoin", annonceur: "professionnel" },
  { id: "belles_demeures", label: "Belles Demeures" },
  { id: "figaro_immo", label: "Figaro Immo" },
  { id: "bienici", label: "Bien'ici" },
];

export default function SearchCONQ() {
  return <SearchForm kind="CONQ" title="Recherche CONQ" platformOptions={CONQ_PLATFORMS} />;
}
