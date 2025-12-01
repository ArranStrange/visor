/**
 * Upload FilmSim Route Runtime Plugin
 *
 * Registers breadcrumb navigation for upload filmsim page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function UploadFilmSimBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Upload", path: "/upload" },
    { label: "Upload Film Simulation", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default UploadFilmSimBreadcrumb;

