import { SearchForm } from "@/pages/SearchForm";

const PIGE_PLATFORMS = [
  { id: "seloger", label: "SeLoger" },
  { id: "pap", label: "PAP" },
  { id: "leboncoin", label: "Leboncoin" },
];

export default function SearchPIGE() {
  return <SearchForm kind="PIGE" title="Recherche PIGE" platformOptions={PIGE_PLATFORMS} />;
}
