/**
 * My Lists Route Runtime Plugin
 *
 * Registers breadcrumb navigation for my lists page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function MyListsBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Lists", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default MyListsBreadcrumb;

