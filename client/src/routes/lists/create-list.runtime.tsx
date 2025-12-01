/**
 * Create List Route Runtime Plugin
 *
 * Registers breadcrumb navigation for create list page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function CreateListBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Lists", path: "/lists" },
    { label: "Create List", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default CreateListBreadcrumb;

