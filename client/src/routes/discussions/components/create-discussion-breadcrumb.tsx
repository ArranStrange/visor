import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function CreateDiscussionBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Discussions", path: "/discussions" },
    { label: "Create Discussion", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

