import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function UploadFilmSimBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Upload", path: "/upload" },
    { label: "Upload Film Simulation", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

