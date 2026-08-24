import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Alert, Stack } from "@mui/material";
import ContentTypeToggle from "../../components/ui/ContentTypeToggle";
import ContentGridLoader from "../../components/ui/ContentGridLoader";
import DeleteContentDialog from "../../components/content/DeleteContentDialog";
import { useAuth } from "../../context/AuthContext";
import { useContentType } from "../../context/ContentTypeFilter";
import { GET_ALL_PRESETS } from "../../graphql/presets";
import { GET_ALL_FILMSIMS } from "../../graphql/filmSims";
import { GET_LIST, UPDATE_LIST, DELETE_LIST } from "../../graphql/lists";
import { buildCombinedContent } from "./buildCombinedContent";
import ListHeaderView from "./ListHeaderView";
import ListHeaderEdit from "./ListHeaderEdit";
import ListSummary from "./ListSummary";
import ListEditFields from "./ListEditFields";
import ListDetailLoading from "./ListDetailLoading";
import ListDetailLoadError from "./ListDetailLoadError";

interface ListFormData {
  name: string;
  description: string;
  isPublic: boolean;
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
  } = useQuery(GET_LIST, {
    variables: { id },
    onCompleted: handleListLoaded,
  });

  const {
    data: presetsData,
    loading: presetsLoading,
    error: presetsError,
  } = useQuery(GET_ALL_PRESETS, {
    skip: !listData?.getUserList,
  });

  const {
    data: filmSimsData,
    loading: filmSimsLoading,
    error: filmSimsError,
  } = useQuery(GET_ALL_FILMSIMS, {
    skip: !listData?.getUserList,
  });

  const [updateList] = useMutation(UPDATE_LIST, {
    onCompleted: handleUpdateCompleted,
    onError: (mutationError) => setError(mutationError.message),
  });

  const [deleteList, { loading: deletingList }] = useMutation(DELETE_LIST, {
    onCompleted: () => navigate("/lists"),
    onError: (mutationError) => setError(mutationError.message),
  });

  const isInitialLoad =
    (listLoading && !listData) ||
    (presetsLoading && !presetsData) ||
    (filmSimsLoading && !filmSimsData);

  if (isInitialLoad) {
    return <ListDetailLoading />;
  }

  if (queryError || presetsError || filmSimsError) {
    return (
      <ListDetailLoadError
        message={queryError?.message || presetsError?.message || filmSimsError?.message}
      />
    );
  }

  const list = listData?.getUserList;
  const isOwner = currentUser?.id === list?.owner?.id;

  const combinedData = buildCombinedContent(
    list,
    contentType,
    presetsData?.listPresets?.presets || [],
    filmSimsData?.listFilmSims?.filmSims || []
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <ContentTypeToggle />

        {renderHeader()}
        {renderMeta()}

        <ContentGridLoader customData={combinedData} contentType={contentType} />
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

  function renderHeader() {
    if (isEditing) {
      return (
        <ListHeaderEdit
          name={formData.name}
          onNameChange={handleInputChange}
          onCancel={() => setIsEditing(false)}
          onSave={handleSubmit}
        />
      );
    }
    return (
      <ListHeaderView
        name={list?.name}
        isPublic={!!list?.isPublic}
        isOwner={isOwner}
        onStartEdit={() => setIsEditing(true)}
      />
    );
  }

  function renderMeta() {
    if (isEditing) {
      return (
        <ListEditFields
          description={formData.description}
          isPublic={formData.isPublic}
          onDescriptionChange={handleInputChange}
          onIsPublicChange={handleInputChange}
          onDeleteClick={() => setDeleteDialogOpen(true)}
        />
      );
    }
    return (
      <ListSummary
        description={list?.description}
        ownerUsername={list?.owner?.username}
        presetCount={list?.presets?.length || 0}
        filmSimCount={list?.filmSims?.length || 0}
      />
    );
  }

  function handleListLoaded(data: any) {
    const list = data?.getUserList;
    if (list) {
      setFormData({
        name: list.name,
        description: list.description || "",
        isPublic: list.isPublic,
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
