type ContentTypeFilter = "all" | "presets" | "films";

interface CombinedPresetItem {
  type: "preset";
  data: any;
}

interface CombinedFilmItem {
  type: "film";
  data: any;
}

export type CombinedContentItem = CombinedPresetItem | CombinedFilmItem;

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x200/2a2a2a/ffffff?text=Loading...";

export function buildCombinedContent(
  list: any,
  contentType: ContentTypeFilter,
  allPresets: any[],
  allFilmSims: any[]
): CombinedContentItem[] {
  const presetsMap = new Map<string, any>(
    allPresets.map((preset) => [preset.id, preset])
  );
  const filmSimsMap = new Map<string, any>(
    allFilmSims.map((filmSim) => [filmSim.id, filmSim])
  );

  const presetItems: CombinedPresetItem[] =
    contentType === "all" || contentType === "presets"
      ? (list?.presets || []).map((preset: any) => buildPresetItem(preset, presetsMap))
      : [];

  const filmItems: CombinedFilmItem[] =
    contentType === "all" || contentType === "films"
      ? (list?.filmSims || []).map((filmSim: any) =>
          buildFilmItem(filmSim, filmSimsMap)
        )
      : [];

  return [...presetItems, ...filmItems];
}

function buildPresetItem(
  preset: any,
  presetsMap: Map<string, any>
): CombinedPresetItem {
  const fullPreset = presetsMap.get(preset.id);
  return {
    type: "preset",
    data: fullPreset || {
      ...preset,
      afterImage: {
        url: preset?.afterImage?.url || PLACEHOLDER_IMAGE,
      },
      tags: [],
      creator: { username: "Unknown" },
    },
  };
}

function buildFilmItem(
  filmSim: any,
  filmSimsMap: Map<string, any>
): CombinedFilmItem {
  const fullFilmSim = filmSimsMap.get(filmSim.id);
  if (fullFilmSim) {
    return {
      type: "film",
      data: {
        ...fullFilmSim,
        title: fullFilmSim.name,
        thumbnail: fullFilmSim.sampleImages?.[0]?.url,
        tags: fullFilmSim.tags || [],
        creator: fullFilmSim.creator || { username: "Unknown" },
      },
    };
  }
  return {
    type: "film",
    data: {
      ...filmSim,
      title: filmSim.name,
      thumbnail: filmSim?.sampleImages?.[0]?.url || PLACEHOLDER_IMAGE,
      tags: [],
      creator: { username: "Unknown" },
    },
  };
}
