/**
 * Public Profile Route Runtime Plugin
 *
 * Registers breadcrumb navigation for public profile pages
 */

import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_UPLOADS } from "@gql/queries/getUserUploads";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

function PublicProfileBreadcrumb() {
  const { userId } = useParams<{ userId: string }>();
  const { data } = useQuery(GET_USER_UPLOADS, {
    variables: { userId },
    skip: !userId,
  });

  const user = data?.getUser;

  const items = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile" },
    { label: user?.username || "Loading...", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, [user?.username, userId]);

  return null;
}

export default PublicProfileBreadcrumb;

