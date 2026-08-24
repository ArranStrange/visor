import { buildGridContent } from "../../src/components/ui/content-grid-data";

describe("Content grid data shaping", () => {
  it("keeps page chunks interleaved and inserts one support card", () => {
    const presets = Array.from({ length: 21 }, (_, index) => ({
      id: `preset-${index}`,
      title: `Preset ${index}`,
      creator: { username: "creator" },
    }));
    const filmSims = Array.from({ length: 21 }, (_, index) => ({
      id: `film-${index}`,
      name: `Film ${index}`,
      creator: { username: "creator" },
    }));

    const content = buildGridContent({
      contentType: "all",
      presetData: {
        listPresets: { presets, currentPage: 2, hasNextPage: false },
      },
      filmSimData: {
        listFilmSims: { filmSims, currentPage: 2, hasNextPage: false },
      },
    });

    expect(content[0].type).to.equal("buymeacoffee");
    expect(content[1].data.id).to.equal("preset-0");
    expect(content[20].data.id).to.equal("preset-19");
    expect(content[21].data.id).to.equal("film-0");
    expect(content[40].data.id).to.equal("film-19");
    expect(content[41].data.id).to.equal("preset-20");
    expect(content[42].data.id).to.equal("film-20");
  });

  it("uses custom data directly and disables query-only search shaping", () => {
    const customData = [
      { type: "film", data: { id: "custom-film", name: "Custom" } },
    ];

    const content = buildGridContent({
      contentType: "films",
      customData,
      searchQuery: "not-a-match",
    });

    expect(content).to.deep.equal(customData);
  });
});
