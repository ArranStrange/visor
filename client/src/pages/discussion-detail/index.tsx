import React from "react";
import { Container, Box } from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GET_DISCUSSION,
  CREATE_REPLY,
  UPDATE_REPLY,
  DELETE_REPLY,
} from "../../graphql/discussions";
import { useDiscussionOperations } from "../../hooks/useDiscussionOperations";
import DiscussionHeader from "./DiscussionHeader";
import PostsSection from "./PostsSection";
import DiscussionLoading from "./DiscussionLoading";
import DiscussionLoadError from "./DiscussionLoadError";
import DiscussionNotFound from "./DiscussionNotFound";

const DiscussionDetail: React.FC = () => {
  const { discussionId: routeDiscussionId } = useParams<{
    discussionId: string;
  }>();
  const discussionId = routeDiscussionId ?? "";
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    loading: discussionLoading,
    error: discussionError,
    data: discussionData,
  } = useQuery(GET_DISCUSSION, {
    variables: { id: discussionId },
    skip: !discussionId || discussionId === "new",
    errorPolicy: "all",
  });

  const discussion = discussionData?.getDiscussion;

  const itemType: "preset" | "filmsim" =
    discussion?.linkedTo?.type === "FILMSIM" ? "filmsim" : "preset";
  const itemId = discussion?.linkedTo?.refId || "";
  const itemTitle = discussion?.title || "";

  const { handleCreatePost, handleEdit, handleDelete } =
    useDiscussionOperations(itemId, itemType, itemTitle, discussion ?? null, {
      query: GET_DISCUSSION,
      variables: { id: discussionId },
    });

  const [createReply] = useMutation(CREATE_REPLY, {
    refetchQueries: [{ query: GET_DISCUSSION, variables: { id: discussionId } }],
  });

  const [updateReply] = useMutation(UPDATE_REPLY, {
    refetchQueries: [{ query: GET_DISCUSSION, variables: { id: discussionId } }],
  });

  const [deleteReply] = useMutation(DELETE_REPLY, {
    refetchQueries: [{ query: GET_DISCUSSION, variables: { id: discussionId } }],
  });

  if (discussionLoading && !discussion) {
    return <DiscussionLoading />;
  }

  if (discussionError) {
    return <DiscussionLoadError error={discussionError} />;
  }

  if (!discussion) {
    return (
      <DiscussionNotFound
        discussionId={discussionId}
        error={discussionError}
      />
    );
  }

  const linkedImage = getLinkedImage();

  return (
    <Container maxWidth="lg">
      <Box py={2}>
        <DiscussionHeader
          discussion={discussion}
          linkedImage={linkedImage}
          onBackToDiscussions={handleBackToDiscussions}
          onNavigateToLinkedItem={handleNavigateToLinkedItem}
        />
        <PostsSection
          discussion={discussion}
          showComposer={!!user}
          onCreatePost={handleCreatePost}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleReply}
          onEditReply={handleEditReply}
          onDeleteReply={handleDeleteReply}
        />
      </Box>
    </Container>
  );

  function getLinkedImage(): string | null {
    if (
      discussion.linkedTo.type === "PRESET" &&
      discussion.linkedTo.preset?.afterImage?.url
    ) {
      return discussion.linkedTo.preset.afterImage.url;
    }
    if (
      discussion.linkedTo.type === "FILMSIM" &&
      discussion.linkedTo.filmSim?.sampleImages?.[0]?.url
    ) {
      return discussion.linkedTo.filmSim.sampleImages[0].url;
    }
    return null;
  }

  function handleBackToDiscussions(e: React.MouseEvent) {
    e.preventDefault();
    navigate("/discussions");
  }

  function handleNavigateToLinkedItem() {
    const path =
      discussion.linkedTo.type === "PRESET"
        ? `/preset/${discussion.linkedTo.preset?.slug}`
        : `/filmsim/${discussion.linkedTo.filmSim?.slug}`;
    navigate(path);
  }

  async function handleReply(postIndex: number, content: string) {
    try {
      await createReply({
        variables: {
          input: {
            discussionId,
            postIndex,
            content: content.trim(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  }

  async function handleEditReply(
    postIndex: number,
    replyIndex: number,
    content: string
  ) {
    try {
      await updateReply({
        variables: {
          input: {
            discussionId,
            postIndex,
            replyIndex,
            content: content.trim(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to update reply:", error);
    }
  }

  async function handleDeleteReply(postIndex: number, replyIndex: number) {
    try {
      await deleteReply({
        variables: {
          discussionId,
          postIndex,
          replyIndex,
        },
      });
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
  }
};

export default DiscussionDetail;
