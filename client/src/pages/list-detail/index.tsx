import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Alert, Stack } from "@mui/material";
import ContentTypeToggle from "../../components/ui/ContentTypeToggle";
import ContentGridLoader from "../../components/ui/ContentGridLoader";
import DeleteContentDialog from "../../components/content/DeleteContentDialog";
import { useAuth } from "../../context/AuthContext";
import { useContentType } from "../../context/ContentTypeFilter";
import { GET_LIST, UPDATE_LIST, DELETE_LIST } from "../../graphql/lists";
import { buildCombinedContent, GetListData } from "./buildCombinedContent";
import { useListContent } from "./use-list-content";
import ListHeaderView from "./ListHeaderView";
import ListHeaderEdit from "./ListHeaderEdit";
import ListSummary from "./ListSummary";
import ListEditFields from "./ListEditFields";
import ListDetailLoading from "./ListDetailLoading";
import ListDetailLoadError from "./ListDetailLoadError";
import { getErrorMessage } from "../../utils/errorHandling";

interface ListFormData {
  name: string;
  description: string;
  isPublic: boolean;
}

interface GetListVariables {
  id: string;
}

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { contentType } = useContentType();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ListFormData>({
    name: "",
    description: "",
    isPublic: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: listLoading,
    error: queryError,
    data: listData,
  } = useQuery<GetListData, GetListVariables>(GET_LIST, {
    variables: { id: id ?? "" },
    skip: !id,
    onCompleted: handleListLoaded,
  });
  const listContent = useListContent(listData?.getUserList);

  const [updateList] = useMutation(UPDATE_LIST, {
    onCompleted: handleUpdateCompleted,
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const [deleteList, { loading: deletingList }] = useMutation(DELETE_LIST, {
    onCompleted: () => navigate("/lists"),
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const isInitialLoad = (listLoading && !listData) || listContent.loading;

  if (isInitialLoad) {
    return <ListDetailLoading />;
  }

  if (queryError || listContent.error) {
    return (
      <ListDetailLoadError
        message={getErrorMessage(queryError ?? listContent.error)}
      />
    );
  }

  const list = listData?.getUserList;
  const isOwner = currentUser?.id === list?.owner?.id;

  const combinedData = buildCombinedContent(
    list,
    contentType,
    listContent.presets,
    listContent.filmSims
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <ContentTypeToggle />

        {renderListDetails()}

        <ContentGridLoader
          customData={combinedData}
          contentType={contentType}
        />
      </Stack>

      <DeleteContentDialog
        open={deleteDialogOpen}
        title="Delete List"
        description="Are you sure you want to delete this list? This action cannot be undone."
        deleting={deletingList}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );

  function renderListDetails() {
    if (isEditing) {
      return (
        <>
          <ListHeaderEdit
            name={formData.name}
            onNameChange={handleInputChange}
            onCancel={() => setIsEditing(false)}
            onSave={handleSubmit}
          />
          <ListEditFields
            description={formData.description}
            isPublic={formData.isPublic}
            onDescriptionChange={handleInputChange}
            onIsPublicChange={handleInputChange}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />
        </>
      );
    }

    return (
      <>
        <ListHeaderView
          name={list?.name ?? ""}
          isPublic={!!list?.isPublic}
          isOwner={isOwner}
          onStartEdit={() => setIsEditing(true)}
        />
        <ListSummary
          description={list?.description}
          ownerUsername={list?.owner?.username}
          presetCount={list?.presets?.length || 0}
          filmSimCount={list?.filmSims?.length || 0}
        />
      </>
    );
  }

  function handleListLoaded(data: GetListData) {
    const list = data?.getUserList;
    if (list) {
      setFormData({
        name: list.name,
        description: list.description || "",
        isPublic: Boolean(list.isPublic),
      });
    }
  }

  function handleUpdateCompleted() {
    setSuccess("List updated successfully");
    setIsEditing(false);
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit() {
    updateList({
      variables: {
        id,
        input: formData,
      },
    });
  }

  function handleDeleteConfirm() {
    deleteList({ variables: { id } });
  }
};

export default ListDetail;
