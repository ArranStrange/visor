import React from "react";
import { Box, Alert, CircularProgress, Card, CardContent } from "@mui/material";
import { useQuery } from "@apollo/client";
import { Discussion as DiscussionType } from "@/features/discussions/types/discussions";
import { GET_DISCUSSION_BY_ITEM } from "@/features/discussions/graphql/discussions";
import { useDiscussionOperations } from "@/features/discussions/hooks/useDiscussionOperations";
import DiscussionHeader from "@/features/discussions/components/DiscussionHeader";
import DiscussionComposer from "@/features/discussions/components/DiscussionComposer";
import DiscussionPosts from "@/features/discussions/components/DiscussionPosts";
import DiscussionThreadEmptyState from "@/features/discussions/components/DiscussionThreadEmptyState";
import { getErrorMessage } from "@/utils/errorHandling";

interface DiscussionThreadProps {
  itemId: string;
  itemType: "preset" | "filmsim";
  itemTitle: string;
  isEmbedded?: boolean;
  showPreviewOnly?: boolean;
  minimalHeader?: boolean;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  itemId,
  itemType,
  itemTitle,
  isEmbedded = true,
  showPreviewOnly = false,
  minimalHeader = false,
}) => {
  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
  } = useQuery(GET_DISCUSSION_BY_ITEM, {
    variables: {
      type: itemType.toUpperCase() as "PRESET" | "FILMSIM",
      refId: itemId,
    },
    skip: !itemId || !itemType,
  });

  const discussion: DiscussionType | null =
    discussionData?.getDiscussionByLinkedItem;

  const {
    user,
    deleteError,
    setDeleteError,
    creatingPost,
    isUserFollowing,
    handleFollow,
    handleCreatePost,
    handleEdit,
    handleDelete,
  } = useDiscussionOperations(itemId, itemType, itemTitle, discussion);

  if (discussionLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (discussionError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading discussion: {getErrorMessage(discussionError)}
      </Alert>
    );
  }

  if (!discussion) {
    return (
      <DiscussionThreadEmptyState
        itemType={itemType}
        showPreviewOnly={showPreviewOnly}
        user={user}
        onCreatePost={handleCreatePost}
        isCreating={creatingPost}
      />
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DiscussionHeader
            discussion={discussion}
            isUserFollowing={isUserFollowing(discussion)}
            onFollow={handleFollow}
            isEmbedded={isEmbedded}
            minimalHeader={minimalHeader}
          />
        </CardContent>
      </Card>

      <DiscussionComposer
        onSubmit={handleCreatePost}
        placeholder="Add to the discussion..."
        buttonText="Post"
        isCreating={creatingPost}
        showPreviewOnly={showPreviewOnly}
      />

      <DiscussionPosts
        discussionId={discussion.id}
        posts={discussion.posts || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isEmbedded={isEmbedded}
        deleteError={deleteError}
        onClearDeleteError={() => setDeleteError(null)}
      />
    </Box>
  );
};

export default DiscussionThread;
