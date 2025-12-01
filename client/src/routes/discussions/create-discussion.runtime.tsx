/**
 * Create Discussion Route Runtime Plugin
 *
 * Registers breadcrumb navigation for create discussion page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function CreateDiscussionBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Discussions", path: "/discussions" },
    { label: "Create Discussion", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default CreateDiscussionBreadcrumb;

