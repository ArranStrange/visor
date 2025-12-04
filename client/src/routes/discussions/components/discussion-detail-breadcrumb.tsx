import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_DISCUSSION } from "@gql/queries/discussions";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

export function DiscussionDetailBreadcrumb() {
  const { discussionId } = useParams<{ discussionId: string }>();
  const { data } = useQuery(GET_DISCUSSION, {
    variables: { id: discussionId! },
    skip: !discussionId || discussionId === "new",
  });

  const discussion = data?.getDiscussion;

  const items = [
    { label: "Home", path: "/" },
    { label: "Discussions", path: "/discussions" },
    { label: discussion?.title || "Loading...", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, [
    discussion?.title,
    discussionId,
  ]);

  return null;
}

