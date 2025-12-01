/**
 * Upload Route Runtime Plugin
 *
 * Registers breadcrumb navigation for upload page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function UploadBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Upload", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default UploadBreadcrumb;

