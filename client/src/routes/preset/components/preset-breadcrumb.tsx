import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "@gql/queries/getPresetBySlug";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function PresetBreadcrumb() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(GET_PRESET_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const preset = data?.getPreset;

  const items = [
    { label: "Explore", path: "/explore" },
    { label: preset?.title || "Loading...", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, [
    preset?.title,
    slug,
  ]);

  return null;
}

