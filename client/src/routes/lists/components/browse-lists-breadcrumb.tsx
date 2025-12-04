import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function BrowseListsBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Lists", path: "/lists" },
    { label: "Browse", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

