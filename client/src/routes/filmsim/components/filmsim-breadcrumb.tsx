import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "@gql/queries/getFilmSimBySlug";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function FilmSimBreadcrumb() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const filmSim = data?.getFilmSim;

  const items = [
    { label: "Search", path: "/search" },
    { label: filmSim?.name || "Loading...", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, [
    filmSim?.name,
    slug,
  ]);

  return null;
}

