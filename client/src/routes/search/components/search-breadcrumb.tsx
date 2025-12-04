import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function SearchBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Search", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

