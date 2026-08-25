import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Discussion as DiscussionType } from "@/features/discussions/types/discussions";
import { DiscussionFilters as DiscussionFiltersType } from "@/features/discussions/types/discussionFilters";
import {
  GET_DISCUSSIONS,
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
  ADMIN_DELETE_DISCUSSION,
  type AdminDeleteDiscussionMutationData,
  type AdminDeleteDiscussionMutationVariables,
  type FollowDiscussionMutationData,
  type FollowDiscussionMutationVariables,
  type GetDiscussionsQueryData,
  type GetDiscussionsQueryVariables,
  type UnfollowDiscussionMutationData,
  type UnfollowDiscussionMutationVariables,
} from "@/features/discussions/graphql/discussions";
import DiscussionFiltersComponent from "@/features/discussions/components/DiscussionFilters";
import DiscussionCard from "@/features/discussions/components/DiscussionCard";
import DiscussionEmptyState from "@/features/discussions/components/DiscussionEmptyState";
import DiscussionErrorState from "@/features/discussions/components/DiscussionErrorState";
import DiscussionSearchSummary from "@/features/discussions/components/DiscussionSearchSummary";
import { getErrorMessage } from "@/utils/errorHandling";

const DiscussionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState<DiscussionFiltersType>({
    search: "",
    type: "all",
    sortBy: "newest",
  });

  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(filters.search || "");
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const { loading, error, data, refetch } = useQuery<
    GetDiscussionsQueryData,
    GetDiscussionsQueryVariables
  >(GET_DISCUSSIONS, {
    variables: {
      search: searchDebounced || undefined,
      type: filters.type !== "all" ? filters.type : undefined,
      page: 1,
      limit: 20,
    },
  });

  const [followDiscussion] = useMutation<
    FollowDiscussionMutationData,
    FollowDiscussionMutationVariables
  >(FOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const [unfollowDiscussion] = useMutation<
    UnfollowDiscussionMutationData,
    UnfollowDiscussionMutationVariables
  >(UNFOLLOW_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const [adminDeleteDiscussion] = useMutation<
    AdminDeleteDiscussionMutationData,
    AdminDeleteDiscussionMutationVariables
  >(ADMIN_DELETE_DISCUSSION, {
    refetchQueries: [
      {
        query: GET_DISCUSSIONS,
        variables: {
          search: filters.search || undefined,
          type: filters.type !== "all" ? filters.type : undefined,
          page: 1,
          limit: 20,
        },
      },
    ],
  });

  const discussions: DiscussionType[] = data?.getDiscussions?.discussions || [];

  const handleFollow = async (discussionId: string, isFollowed: boolean) => {
    try {
      if (isFollowed) {
        await unfollowDiscussion({ variables: { discussionId } });
      } else {
        await followDiscussion({ variables: { discussionId } });
      }
    } catch (error) {
      console.error("Failed to follow/unfollow discussion:", error);
    }
  };

  const handleAdminDelete = async (discussionId: string) => {
    try {
      await adminDeleteDiscussion({ variables: { id: discussionId } });
    } catch (error) {
      console.error("Failed to delete discussion:", error);
    }
  };

  const handleAdminEdit = (discussionId: string) => {
    navigate(`/discussions/${discussionId}/edit`);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: value as DiscussionFiltersType["type"],
    }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, search: "", type: "all" }));
  };

  const handleRetry = () => {
    refetch();
  };

  const handleCreateNew = () => {
    navigate("/discussions/new");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("DiscussionList error:", getErrorMessage(error));

    return (
      <DiscussionErrorState
        error={error}
        onRetry={handleRetry}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="body1" color="text.secondary">
          Join the conversation about presets, film simulations, and photography
        </Typography>
      </Box>

      <DiscussionFiltersComponent
        filters={filters}
        onSearchChange={handleSearchChange}
        onTypeChange={handleTypeChange}
        onSortChange={handleSortChange}
        loading={loading}
        resultCount={discussions.length}
      />

      <DiscussionSearchSummary
        filters={filters}
        loading={loading}
        resultCount={discussions.length}
      />

      <Box>
        {discussions.length === 0 ? (
          <DiscussionEmptyState
            filters={filters}
            onClearSearch={handleClearSearch}
          />
        ) : (
          discussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              user={user}
              searchTerm={filters.search || ""}
              onFollow={handleFollow}
              onDelete={handleAdminDelete}
              onEdit={handleAdminEdit}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default DiscussionList;
