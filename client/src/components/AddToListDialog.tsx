import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_LISTS, ADD_TO_LIST } from "../graphql/queries";

const AddToListDialog: React.FC<AddToListDialogProps> = ({
  open,
  onClose,
  presetId,
  filmSimId,
  itemName,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  console.log("AddToListDialog - Current user:", currentUser);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { loading, data } = useQuery(GET_USER_LISTS, {
    variables: {
      userId: currentUser?.id,
    },
    skip: !currentUser?.id,
  });

  const [addToList] = useMutation(ADD_TO_LIST, {
    onCompleted: (data) => {
      console.log("Mutation completed successfully:", data);
      setSuccess("Added to list successfully!");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    },
    onError: (error) => {
      console.error("Mutation error details:", {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
        extraInfo: error.extraInfo,
        currentUser: currentUser,
      });
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleAddToList = async (listId: string) => {
    try {
      console.log("Adding to list with params:", {
        listId,
        presetId: presetId || null,
        filmSimId: filmSimId || null,
        currentUser: currentUser,
      });

      // Validate that we have at least one item to add
      if (!presetId && !filmSimId) {
        throw new Error("No item selected to add to list");
      }

      // Validate that we have a valid list ID
      if (!listId) {
        throw new Error("Invalid list ID");
      }

      // Validate that we have a logged in user
      if (!currentUser?.id) {
        throw new Error("You must be logged in to add items to a list");
      }

      const result = await addToList({
        variables: {
          listId,
          presetIds: presetId ? [presetId] : [],
          filmSimIds: filmSimId ? [filmSimId] : [],
        },
      });

      console.log("Mutation result:", result);
    } catch (err) {
      console.error("Error adding to list:", err);
      setError(err instanceof Error ? err.message : "Failed to add to list");
    }
  };
};

export default AddToListDialog;
