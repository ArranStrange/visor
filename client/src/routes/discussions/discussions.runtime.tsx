/**
 * Discussions Route Runtime Plugin
 *
 * Registers breadcrumb navigation for discussions page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function DiscussionsBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Discussions", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default DiscussionsBreadcrumb;

