import React from "react";
import PresetCard from "@/features/presets/components/PresetCard";
import FilmSimCard from "@/features/film-sims/components/FilmSimCard";
import BuyMeACoffeeCard from "./BuyMeACoffeeCard";
import { GridContentData, GridContentItem } from "./content-grid-data";

interface ContentGridItemProps {
  item: GridContentItem;
  renderItem?: (item: GridContentData) => React.ReactNode;
}

export function ContentGridItem({ item, renderItem }: ContentGridItemProps) {
  const { data } = item;

  if (renderItem) return <>{renderItem(data)}</>;
  if (item.type === "buymeacoffee") return <BuyMeACoffeeCard />;
  if (item.type === "preset") {
    return (
      <PresetCard
        id={data.id}
        slug={data.slug ?? ""}
        title={data.title ?? ""}
        afterImage={data.afterImage}
        beforeImage={data.beforeImage}
        tags={data.tags ?? []}
        creator={data.creator ?? undefined}
        featured={data.featured}
      />
    );
  }

  return (
    <FilmSimCard
      id={data.id ?? ""}
      name={data.name ?? ""}
      slug={data.slug ?? ""}
      thumbnail={data.thumbnail ?? ""}
      tags={data.tags}
      creator={data.creator ?? undefined}
      featured={data.featured}
    />
  );
}
