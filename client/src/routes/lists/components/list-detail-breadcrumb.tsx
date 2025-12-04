import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import Breadcrumb from "components/ui/Breadcrumb";

const GET_LIST = gql`
  query GetList($id: ID!) {
    getUserList(id: $id) {
      id
      name
    }
  }
`;

export function ListDetailBreadcrumb() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery(GET_LIST, {
    variables: { id },
    skip: !id,
  });

  const list = data?.getUserList;

  const items = [
    { label: "Home", path: "/" },
    { label: "Lists", path: "/lists" },
    { label: list?.name || "Loading...", path: undefined },
  ];

  PageBreadcrumbs.usePlug(<Breadcrumb items={items} />, [list?.name, id]);

  return null;
}

