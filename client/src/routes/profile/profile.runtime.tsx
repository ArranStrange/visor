/**
 * Profile Route Runtime Plugin
 *
 * Registers breadcrumb navigation for profile page
 */

import React from "react";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function ProfileBreadcrumb() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Profile", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, []);

  return null;
}

export default ProfileBreadcrumb;

