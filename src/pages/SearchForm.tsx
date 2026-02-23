import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterToggle } from "@/components/search/FilterToggle";
import { TagInput } from "@/components/search/TagInput";
import { CityInput } from "@/components/search/CityInput";
import { RangeInput } from "@/components/search/RangeInput";
import { useToast } from "@/hooks/use-toast";
import { createSearch, updateSearch } from "@/lib/api";
import { buildSearchQuery, validateRange, type SearchKind, type SearchPlatform } from "@/lib/searchQuery";

const TYPE_BIENS = ["Appartement", "Maison", "Terrain", "Bureau", "Commerce"];
const TRANSACTION_TYPES = [
  { id: "rent", label: "Location" },
  { id: "sale", label: "Vente" },
];
const CITY_PRESETS = [
  "Paris intra-muros",
  "Montrouge",
  "Issy-les-Moulineaux",
  "Boulogne-Billancourt",
  "Saint-Cloud",
  "Suresnes",
  "Courbevoie",
  "Neuilly-sur-Seine",
  "Levallois-Perret",
];
const SELOGER_CITY_IDS: Record<string, string> = {
  Paris: "AD08FR31096",
  "Levallois-Perret": "AD08FR31096",
};

const ETAGE_OPTIONS = [
  { id: "dernier_etage", label: "Dernier etage" },
  { id: "rdc", label: "RDC" },
  { id: "autres_etages", label: "Autres etages" },
];
const DPE_OPTIONS = ["A", "B", "C", "D", "E"];
const CARACTERISTIQUES = [
  { id: "parking_garage", label: "Parking / garage" },
  { id: "balcon_terrasse", label: "Balcon / terrasse" },
  { id: "jardin", label: "Jardin" },
  { id: "piscine", label: "Piscine" },
];
const INTERIEUR = [
  { id: "cave", label: "Cave" },
  { id: "entierement_meuble", label: "Entierement meuble" },
  { id: "non_meuble", label: "Non meuble" },
  { id: "cuisine_integree", label: "Cuisine integree" },
  { id: "chauffage_au_sol", label: "Chauffage au sol" },
];
const UTILISATION = [{ id: "a_renover", label: "A renover" }];
const ACCESSIBILITE = [
  { id: "acces_mobilite_reduite", label: "Acces mobilite reduite" },
  { id: "ascenseur", label: "Ascenseur" },
];

interface SearchFormProps {
  kind: SearchKind;
  platformOptions: { id: string; label: string; annonceur?: string }[];
  title: string;
  searchId?: number;
  initialData?: { name: string; active: number; query_json: string | Record<string, unknown> };
  showHeader?: boolean;
}

export function SearchForm({
  kind,
  platformOptions,
  title,
  searchId,
  initialData,
  showHeader = true,
}: SearchFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const [platforms, setPlatforms] = useState<Record<string, boolean>>(
    () => platformOptions.reduce((acc, option) => ({ ...acc, [option.id]: false }), {})
  );
  const [transactionTypes, setTransactionTypes] = useState<Record<string, boolean>>({
    rent: true,
    sale: false,
  });

  const [localisationEnabled, setLocalisationEnabled] = useState(false);
  const [villesEnabled, setVillesEnabled] = useState(false);
  const [cpsEnabled, setCpsEnabled] = useState(false);
  const [villes, setVilles] = useState<string[]>([]);
  const [cps, setCps] = useState<string[]>([]);

  const [typeEnabled, setTypeEnabled] = useState(false);
  const [typeBien, setTypeBien] = useState<Record<string, boolean>>(
    () => TYPE_BIENS.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );

  const [piecesEnabled, setPiecesEnabled] = useState(false);
  const [piecesMin, setPiecesMin] = useState("");

  const [chambresEnabled, setChambresEnabled] = useState(false);
  const [chambres, setChambres] = useState("");

  const [prixEnabled, setPrixEnabled] = useState(false);
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");

  const [etageEnabled, setEtageEnabled] = useState(false);
  const [etage, setEtage] = useState<Record<string, boolean>>({
    dernier_etage: false,
    rdc: false,
    autres_etages: false,
  });

  const [anneeEnabled, setAnneeEnabled] = useState(false);
  const [anneeMin, setAnneeMin] = useState("");
  const [anneeMax, setAnneeMax] = useState("");

  const [dpeEnabled, setDpeEnabled] = useState(false);
  const [dpe, setDpe] = useState<Record<string, boolean>>({ A: false, B: false, C: false, D: false, E: false });

  const [caracteristiquesEnabled, setCaracteristiquesEnabled] = useState(false);
  const [caracteristiques, setCaracteristiques] = useState<Record<string, boolean>>({
    parking_garage: false,
    balcon_terrasse: false,
    jardin: false,
    piscine: false,
  });

  const [interieurEnabled, setInterieurEnabled] = useState(false);
  const [interieur, setInterieur] = useState<Record<string, boolean>>({
    cave: false,
    entierement_meuble: false,
    non_meuble: false,
    cuisine_integree: false,
    chauffage_au_sol: false,
  });

  const [utilisationEnabled, setUtilisationEnabled] = useState(false);
  const [utilisation, setUtilisation] = useState<Record<string, boolean>>({ a_renover: false });

  const [accessibiliteEnabled, setAccessibiliteEnabled] = useState(false);
  const [accessibilite, setAccessibilite] = useState<Record<string, boolean>>({
    acces_mobilite_reduite: false,
    ascenseur: false,
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      searchId ? updateSearch(searchId, payload) : createSearch(payload),
    onSuccess: (data) => {
      const createdId = (data as { id?: number | string })?.id;
      toast({ title: "Recherche enregistree" });
      if (createdId) {
        navigate(`/recherches/${createdId}/resultats`);
        return;
      }
      navigate("/recherches");
    },
    onError: (error: Error) => {
      const status = (error as Error & { status?: number }).status;
      if (status === 401) {
        toast({ title: "Session expirée", description: "Merci de vous reconnecter." });
        navigate("/login");
        return;
      }
      toast({ title: "Erreur", description: error.message });
    },
  });

  const selectedPlatforms = useMemo(() => {
    return platformOptions
      .filter((option) => platforms[option.id])
      .map((option) => {
        const platform: SearchPlatform = { name: option.id };
        if (option.annonceur) {
          platform.annonceur = option.annonceur;
        }
        return platform;
      });
  }, [platformOptions, platforms]);

  const selogerMissingCityIds = useMemo(() => {
    if (!villesEnabled || !villes.length) return false;
    const usesSeloger = selectedPlatforms.some((platform) => platform.name === "seloger");
    if (!usesSeloger) return false;
    return villes.some((city) => !SELOGER_CITY_IDS[city]);
  }, [selectedPlatforms, villes, villesEnabled]);

  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name || "");
    setActive(Boolean(initialData.active));
    try {
      const parsed =
        typeof initialData.query_json === "string"
          ? JSON.parse(initialData.query_json || "{}")
          : initialData.query_json && typeof initialData.query_json === "object"
            ? initialData.query_json
            : {};
      const parsedPlatforms = Array.isArray(parsed.platforms)
        ? parsed.platforms
        : parsed.platforms && typeof parsed.platforms === "object"
          ? Object.keys(parsed.platforms).map((name) => ({ name }))
          : [];
      setPlatforms(
        platformOptions.reduce((acc, option) => {
          const isSelected = parsedPlatforms.some((item: SearchPlatform) => item.name === option.id);
          return { ...acc, [option.id]: isSelected };
        }, {} as Record<string, boolean>)
      );
      const transactionTypes = Array.isArray(parsed?.transaction?.types) ? parsed.transaction.types : [];
      if (transactionTypes.length) {
        setTransactionTypes({
          rent: transactionTypes.includes("rent"),
          sale: transactionTypes.includes("sale"),
        });
      }

      const filters = parsed.filters || {};
      const locations = parsed.locations || {};
      if (filters.localisation) {
        setLocalisationEnabled(true);
        if (filters.localisation.villes?.length) {
          setVillesEnabled(true);
          setVilles(
            filters.localisation.villes.map((item) =>
              typeof item === "string" ? item : item.label || ""
            )
          );
        }
        if (filters.localisation.cps?.length) {
          setCpsEnabled(true);
          setCps(
            filters.localisation.cps.map((item) =>
              typeof item === "string" ? item : item.label || ""
            )
          );
        }
      } else if (locations.cities?.length) {
        setLocalisationEnabled(true);
        setVillesEnabled(true);
        setVilles(locations.cities.filter((item: string) => typeof item === "string"));
      }
      if (locations.postalCodes?.length) {
        setLocalisationEnabled(true);
        setCpsEnabled(true);
        setCps(locations.postalCodes.filter((item: string) => typeof item === "string"));
      }
      if (filters.type_bien) {
        setTypeEnabled(true);
        const values = Array.isArray(filters.type_bien) ? filters.type_bien : [filters.type_bien];
        setTypeBien(
          TYPE_BIENS.reduce((acc, item) => ({ ...acc, [item]: values.includes(item) }), {})
        );
      }
      if (filters.pieces_min !== undefined) {
        setPiecesEnabled(true);
        setPiecesMin(String(filters.pieces_min));
      }
      if (filters.chambres !== undefined) {
        setChambresEnabled(true);
        setChambres(String(filters.chambres));
      }
      if (filters.prix) {
        setPrixEnabled(true);
        setPrixMin(filters.prix.min !== undefined ? String(filters.prix.min) : "");
        setPrixMax(filters.prix.max !== undefined ? String(filters.prix.max) : "");
      }
      if (filters.etage?.length) {
        setEtageEnabled(true);
        setEtage({
          dernier_etage: filters.etage.includes("dernier_etage"),
          rdc: filters.etage.includes("rdc"),
          autres_etages: filters.etage.includes("autres_etages"),
        });
      }
      if (filters.annee_construction) {
        setAnneeEnabled(true);
        setAnneeMin(filters.annee_construction.min !== undefined ? String(filters.annee_construction.min) : "");
        setAnneeMax(filters.annee_construction.max !== undefined ? String(filters.annee_construction.max) : "");
      }
      if (filters.dpe?.length) {
        setDpeEnabled(true);
        setDpe({
          A: filters.dpe.includes("A"),
          B: filters.dpe.includes("B"),
          C: filters.dpe.includes("C"),
          D: filters.dpe.includes("D"),
          E: filters.dpe.includes("E"),
        });
      }
      if (filters.caracteristiques?.length) {
        setCaracteristiquesEnabled(true);
        setCaracteristiques({
          parking_garage: filters.caracteristiques.includes("parking_garage"),
          balcon_terrasse: filters.caracteristiques.includes("balcon_terrasse"),
          jardin: filters.caracteristiques.includes("jardin"),
          piscine: filters.caracteristiques.includes("piscine"),
        });
      }
      if (filters.interieur?.length) {
        setInterieurEnabled(true);
        setInterieur({
          cave: filters.interieur.includes("cave"),
          entierement_meuble: filters.interieur.includes("entierement_meuble"),
          non_meuble: filters.interieur.includes("non_meuble"),
          cuisine_integree: filters.interieur.includes("cuisine_integree"),
          chauffage_au_sol: filters.interieur.includes("chauffage_au_sol"),
        });
      }
      if (filters.utilisation?.length) {
        setUtilisationEnabled(true);
        setUtilisation({ a_renover: filters.utilisation.includes("a_renover") });
      }
      if (filters.accessibilite?.length) {
        setAccessibiliteEnabled(true);
        setAccessibilite({
          acces_mobilite_reduite: filters.accessibilite.includes("acces_mobilite_reduite"),
          ascenseur: filters.accessibilite.includes("ascenseur"),
        });
      }
    } catch (_error) {
      return;
    }
  }, [initialData, platformOptions]);

  const buildFilters = () => {
    const filters: Record<string, unknown> = {};

    if (localisationEnabled) {
      const localisation: Record<string, string[]> = {};
      if (villesEnabled) {
        localisation.villes = villes.map((city) => {
          const locationId = SELOGER_CITY_IDS[city];
          return locationId ? { label: city, selogerLocationId: locationId } : city;
        });
      }
      if (cpsEnabled) {
        localisation.cps = cps;
      }
      if (Object.keys(localisation).length) {
        filters.localisation = localisation;
      }
    }

    if (typeEnabled) {
      const types = Object.keys(typeBien).filter((key) => typeBien[key]);
      if (types.length) {
        filters.type_bien = types;
      }
    }
    if (piecesEnabled) {
      filters.pieces_min = Number(piecesMin);
    }
    if (chambresEnabled) {
      filters.chambres = Number(chambres);
    }
    if (prixEnabled) {
      const prix: Record<string, number> = {};
      if (prixMin) prix.min = Number(prixMin);
      if (prixMax) prix.max = Number(prixMax);
      filters.prix = prix;
    }
    if (etageEnabled) {
      filters.etage = Object.keys(etage).filter((key) => etage[key]);
    }
    if (anneeEnabled) {
      const annee: Record<string, number> = {};
      if (anneeMin) annee.min = Number(anneeMin);
      if (anneeMax) annee.max = Number(anneeMax);
      filters.annee_construction = annee;
    }
    if (dpeEnabled) {
      filters.dpe = Object.keys(dpe).filter((key) => dpe[key]);
    }
    if (caracteristiquesEnabled) {
      filters.caracteristiques = Object.keys(caracteristiques).filter((key) => caracteristiques[key]);
    }
    if (interieurEnabled) {
      filters.interieur = Object.keys(interieur).filter((key) => interieur[key]);
    }
    if (utilisationEnabled) {
      filters.utilisation = Object.keys(utilisation).filter((key) => utilisation[key]);
    }
    if (accessibiliteEnabled) {
      filters.accessibilite = Object.keys(accessibilite).filter((key) => accessibilite[key]);
    }

    return filters;
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push("Le nom est obligatoire");
    }
    if (!selectedPlatforms.length) {
      errors.push("Selectionnez au moins une plateforme");
    }
    if (!Object.values(transactionTypes).some(Boolean)) {
      errors.push("Selectionnez au moins un type de transaction");
    }
    if (localisationEnabled) {
      if (villesEnabled && villes.length === 0) {
        errors.push("Ajoutez au moins une ville");
      }
      if (cpsEnabled && cps.length === 0) {
        errors.push("Ajoutez au moins un code postal");
      }
      if (villesEnabled === false && cpsEnabled === false) {
        errors.push("Activez villes ou codes postaux");
      }
    }
    if (typeEnabled && !Object.values(typeBien).some(Boolean)) {
      errors.push("Selectionnez au moins un type de bien");
    }
    if (piecesEnabled && !piecesMin) {
      errors.push("Renseignez le minimum de pieces");
    }
    if (chambresEnabled && !chambres) {
      errors.push("Renseignez le nombre de chambres");
    }
    if (prixEnabled) {
      if (!prixMin && !prixMax) {
        errors.push("Renseignez un prix min ou max");
      }
      const rangeError = validateRange(
        prixMin ? Number(prixMin) : undefined,
        prixMax ? Number(prixMax) : undefined,
        "Prix"
      );
      if (rangeError) errors.push(rangeError);
    }
    if (etageEnabled && !Object.values(etage).some(Boolean)) {
      errors.push("Selectionnez au moins un etage");
    }
    if (anneeEnabled) {
      const rangeError = validateRange(
        anneeMin ? Number(anneeMin) : undefined,
        anneeMax ? Number(anneeMax) : undefined,
        "Annee de construction"
      );
      if (rangeError) errors.push(rangeError);
    }
    if (dpeEnabled && !Object.values(dpe).some(Boolean)) {
      errors.push("Selectionnez au moins une classe DPE");
    }
    if (caracteristiquesEnabled && !Object.values(caracteristiques).some(Boolean)) {
      errors.push("Selectionnez au moins une caracteristique");
    }
    if (interieurEnabled && !Object.values(interieur).some(Boolean)) {
      errors.push("Selectionnez au moins un filtre interieur");
    }
    if (utilisationEnabled && !Object.values(utilisation).some(Boolean)) {
      errors.push("Selectionnez au moins une utilisation");
    }
    if (accessibiliteEnabled && !Object.values(accessibilite).some(Boolean)) {
      errors.push("Selectionnez au moins une accessibilite");
    }

    if (errors.length) {
      toast({ title: "Validation", description: errors[0] });
      return false;
    }
    return true;
  };

  const handleSubmit = (runNow = false) => {
    if (!validateForm()) return;

    const filters = buildFilters();
    const selectedTransactions = Object.keys(transactionTypes).filter((key) => transactionTypes[key]);
    const query = buildSearchQuery({
      kind,
      platforms: selectedPlatforms,
      filters,
      transaction: selectedTransactions.length ? { types: selectedTransactions } : undefined,
      context: { mode: kind.toLowerCase() },
      locations: {
        cities: villesEnabled ? villes : undefined,
        postalCodes: cpsEnabled ? cps : undefined,
      },
    });

    mutation.mutate({
      kind,
      name,
      query,
      active,
      run_now: runNow,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showHeader ? (
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit(false)} disabled={mutation.isPending}>
              Enregistrer
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={mutation.isPending}>
              Enregistrer et lancer le run
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit(false)} disabled={mutation.isPending}>
              Enregistrer
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={mutation.isPending}>
              Enregistrer et lancer le run
            </Button>
          </div>
        </div>
      )}

      <div className="card p-4 space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Nom</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Recherche Paris" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Plateformes</label>
          <div className="flex flex-wrap gap-4">
            {platformOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={platforms[option.id]}
                  onCheckedChange={(value) =>
                    setPlatforms((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1 rounded-md border border-border p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Les URLs des plateformes sont generees automatiquement a partir des filtres.
          </p>
          <p className="text-[11px] text-muted-foreground">
            En cas d&apos;anti-bot, l&apos;assistant de run affichera une action guidee minimale.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Transaction</label>
          <div className="flex flex-wrap gap-4">
            {TRANSACTION_TYPES.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={transactionTypes[option.id]}
                  onCheckedChange={(value) =>
                    setTransactionTypes((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <FilterToggle
          label="Localisation"
          enabled={localisationEnabled}
          onToggle={setLocalisationEnabled}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FilterToggle label="Villes" enabled={villesEnabled} onToggle={setVillesEnabled}>
              <CityInput
                label="Villes"
                values={villes}
                onChange={setVilles}
                placeholder="Ajouter une ville"
                presets={CITY_PRESETS}
              />
              {selogerMissingCityIds ? (
                <p className="text-xs text-amber-500">
                  SeLoger necessite un ID ville : la plateforme sera ignoree au run tant que non resolu.
                </p>
              ) : null}
            </FilterToggle>
            <FilterToggle label="Codes postaux" enabled={cpsEnabled} onToggle={setCpsEnabled}>
              <TagInput
                label="Codes postaux"
                values={cps}
                onChange={setCps}
                placeholder="75017"
              />
            </FilterToggle>
          </div>
        </FilterToggle>

        <FilterToggle label="Type de bien" enabled={typeEnabled} onToggle={setTypeEnabled}>
          <div className="flex flex-wrap gap-4">
            {TYPE_BIENS.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={typeBien[item]}
                  onCheckedChange={(value) =>
                    setTypeBien((prev) => ({ ...prev, [item]: Boolean(value) }))
                  }
                />
                {item}
              </label>
            ))}
          </div>
        </FilterToggle>

        <div className="grid gap-4 md:grid-cols-2">
          <FilterToggle label="Pieces minimum" enabled={piecesEnabled} onToggle={setPiecesEnabled}>
            <Input value={piecesMin} onChange={(event) => setPiecesMin(event.target.value)} placeholder="3" />
          </FilterToggle>
          <FilterToggle label="Chambres" enabled={chambresEnabled} onToggle={setChambresEnabled}>
            <Input value={chambres} onChange={(event) => setChambres(event.target.value)} placeholder="2" />
          </FilterToggle>
        </div>

        <FilterToggle label="Prix" enabled={prixEnabled} onToggle={setPrixEnabled}>
          <RangeInput
            labelMin="Prix min"
            labelMax="Prix max"
            minValue={prixMin}
            maxValue={prixMax}
            onMinChange={setPrixMin}
            onMaxChange={setPrixMax}
          />
        </FilterToggle>

        <FilterToggle label="Etage" enabled={etageEnabled} onToggle={setEtageEnabled}>
          <div className="flex flex-wrap gap-4">
            {ETAGE_OPTIONS.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={etage[option.id]}
                  onCheckedChange={(value) =>
                    setEtage((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterToggle>

        <FilterToggle label="Annee de construction" enabled={anneeEnabled} onToggle={setAnneeEnabled}>
          <RangeInput
            labelMin="Annee min"
            labelMax="Annee max"
            minValue={anneeMin}
            maxValue={anneeMax}
            onMinChange={setAnneeMin}
            onMaxChange={setAnneeMax}
          />
        </FilterToggle>

        <FilterToggle label="DPE" enabled={dpeEnabled} onToggle={setDpeEnabled}>
          <div className="flex flex-wrap gap-4">
            {DPE_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={dpe[option]}
                  onCheckedChange={(value) =>
                    setDpe((prev) => ({ ...prev, [option]: Boolean(value) }))
                  }
                />
                {option}
              </label>
            ))}
          </div>
        </FilterToggle>

        <FilterToggle
          label="Caracteristiques"
          enabled={caracteristiquesEnabled}
          onToggle={setCaracteristiquesEnabled}
        >
          <div className="flex flex-wrap gap-4">
            {CARACTERISTIQUES.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={caracteristiques[option.id]}
                  onCheckedChange={(value) =>
                    setCaracteristiques((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterToggle>

        <FilterToggle label="Interieur" enabled={interieurEnabled} onToggle={setInterieurEnabled}>
          <div className="flex flex-wrap gap-4">
            {INTERIEUR.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={interieur[option.id]}
                  onCheckedChange={(value) =>
                    setInterieur((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterToggle>

        <FilterToggle label="Utilisation" enabled={utilisationEnabled} onToggle={setUtilisationEnabled}>
          <div className="flex flex-wrap gap-4">
            {UTILISATION.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={utilisation[option.id]}
                  onCheckedChange={(value) =>
                    setUtilisation((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterToggle>

        <FilterToggle label="Accessibilite" enabled={accessibiliteEnabled} onToggle={setAccessibiliteEnabled}>
          <div className="flex flex-wrap gap-4">
            {ACCESSIBILITE.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={accessibilite[option.id]}
                  onCheckedChange={(value) =>
                    setAccessibilite((prev) => ({ ...prev, [option.id]: Boolean(value) }))
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterToggle>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={active} onCheckedChange={(value) => setActive(Boolean(value))} />
          Active
        </label>
      </div>
    </div>
  );
}
