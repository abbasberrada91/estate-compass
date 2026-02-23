import { buildSearchQuery, validateRange } from "@/lib/searchQuery";

describe("searchQuery", () => {
  it("builds minimal query with enabled filters", () => {
    const query = buildSearchQuery({
      kind: "PIGE",
      platforms: [{ name: "seloger" }],
      filters: {
        localisation: { villes: ["Paris"] },
        pieces_min: 3,
        prix: { min: 1000 },
        dpe: ["C"],
      },
    });

    expect(query.filters?.localisation?.villes).toEqual(["Paris"]);
    expect(query.filters?.localisation?.cps).toBeUndefined();
    expect(query.filters?.pieces_min).toBe(3);
    expect(query.filters?.prix).toEqual({ min: 1000 });
    expect(query.filters?.dpe).toEqual(["C"]);
  });

  it("validates min/max correctly", () => {
    expect(validateRange(5, 2, "Prix")).toBe("Prix min doit etre <= max");
    expect(validateRange(2, 5, "Prix")).toBeNull();
  });
});
