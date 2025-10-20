import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Discussion as DiscussionType } from "../../types/discussions";
import { DiscussionFilters as DiscussionFiltersType } from "../../types/discussionFilters";
import { GET_DISCUSSIONS } from "../../graphql/queries/discussions";
import {
  FOLLOW_DISCUSSION,
  UNFOLLOW_DISCUSSION,
} from "../../graphql/mutations/discussions";
import { ADMIN_DELETE_DISCUSSION } from "../../graphql/mutations/adminMutations";
import DiscussionFiltersComponent from "./DiscussionFilters";
import DiscussionCard from "./DiscussionCard";
import DiscussionEmptyState from "./DiscussionEmptyState";
import DiscussionErrorState from "./DiscussionErrorState";
import DiscussionSearchSummary from "./DiscussionSearchSummary";

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

  const { loading, error, data, refetch } = useQuery(GET_DISCUSSIONS, {
    variables: {
      search: searchDebounced || undefined,
      type: filters.type !== "all" ? filters.type : undefined,
      page: 1,
      limit: 20,
    },
  });

  const [followDiscussion] = useMutation(FOLLOW_DISCUSSION, {
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

  const [unfollowDiscussion] = useMutation(UNFOLLOW_DISCUSSION, {
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

  const [adminDeleteDiscussion] = useMutation(ADMIN_DELETE_DISCUSSION, {
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
    setFilters((prev) => ({ ...prev, type: value as any }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as any }));
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
    console.error("DiscussionList error details:", {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
    });

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
