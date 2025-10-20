import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { gql, useMutation } from "@apollo/client";
import { useAdmin } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import ImageOptimizer from "../media/ImageOptimizer";

interface ListRowProps {
  id: string;
  name: string;
  description?: string;
  owner: { id: string; username: string; avatar?: string };
  isFeatured?: boolean;
  presets: Array<{
    id: string;
    title: string;
    slug: string;
    afterImage?: { id?: string; url: string } | null;
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
    sampleImages?: Array<{ id?: string; url: string }>;
  }>;
}

const FEATURE_LIST = gql`
  mutation FeatureUserList($id: ID!) {
    featureUserList(id: $id) {
      id
      isFeatured
    }
  }
`;

const UNFEATURE_LIST = gql`
  mutation UnfeatureUserList($id: ID!) {
    unfeatureUserList(id: $id) {
      id
      isFeatured
    }
  }
`;

const ListRow: React.FC<ListRowProps> = ({
  id,
  name,
  description,
  owner,
  presets,
  filmSims,
  isFeatured,
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [featureList] = useMutation(FEATURE_LIST, {
    optimisticResponse: {
      featureUserList: { __typename: "UserList", id, isFeatured: true },
    },
  });
  const [unfeatureList] = useMutation(UNFEATURE_LIST, {
    optimisticResponse: {
      unfeatureUserList: { __typename: "UserList", id, isFeatured: false },
    },
  });

  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFeatured) {
        await unfeatureList({
          variables: { id },
          update: (cache, { data }) => {
            const updated = data?.unfeatureUserList;
            if (!updated) return;
            cache.modify({
              fields: {
                browseUserLists(existing) {
                  if (!existing?.lists) return existing;
                  const lists = existing.lists.map((l: any) =>
                    l.id === id ? { ...l, isFeatured: false } : l
                  );
                  return { ...existing, lists };
                },
              },
            });
          },
        });
      } else {
        await featureList({
          variables: { id },
          update: (cache, { data }) => {
            const updated = data?.featureUserList;
            if (!updated) return;
            cache.modify({
              fields: {
                browseUserLists(existing) {
                  if (!existing?.lists) return existing;
                  const lists = existing.lists.map((l: any) =>
                    l.id === id ? { ...l, isFeatured: true } : l
                  );
                  return { ...existing, lists };
                },
              },
            });
          },
        });
      }
    } catch (err) {
      console.error("Error toggling featured state:", err);
    }
  };
  const totalItems = (presets?.length || 0) + (filmSims?.length || 0);

  const items = useMemo(() => {
    const presetItems = (presets || []).map((p) => ({
      ...p,
      type: "preset" as const,
    }));
    const filmSimItems = (filmSims || []).map((f) => ({
      ...f,
      type: "filmsim" as const,
    }));
    return [...presetItems, ...filmSimItems];
  }, [presets, filmSims]);

  return (
    <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
      <Stack
        direction={{ xs: "row", sm: "row" }}
        alignItems={{ xs: "center", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: { xs: 1.5, sm: 2 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ minWidth: 0 }}
        >
          <Avatar
            src={owner?.avatar}
            alt={owner?.username}
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              cursor: "pointer",
            }}
            onClick={() => navigate(`/profile/${owner.id}`)}
          >
            {owner?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {totalItems} {totalItems === 1 ? "item" : "items"} • by{" "}
              {owner.username}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isAdmin && (
            <Tooltip title={isFeatured ? "Unfeature" : "Feature"}>
              <IconButton onClick={handleToggleFeatured} size="small">
                {isFeatured ? <StarIcon color="warning" /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate(`/list/${id}`)}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            View list
          </Button>
        </Stack>
      </Stack>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.25, display: { xs: "none", sm: "block" } }}
        >
          {description}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          gap: { xs: 1.25, sm: 1.5, md: 2 },
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: 1,
          scrollSnapType: { xs: "x mandatory", sm: "none" },
        }}
      >
        {items.map((item) => {
          const isPreset = item.type === "preset";
          const to = isPreset
            ? `/preset/${item.slug}`
            : `/filmsim/${item.slug}`;
          const src = isPreset
            ? item.afterImage?.url || "/placeholder-image.jpg"
            : item.sampleImages?.[0]?.url || "/placeholder-image.jpg";

          return (
            <Box
              key={`${item.type}-${item.id}`}
              sx={{
                flex: { xs: "0 0 140px", sm: "0 0 180px", md: "0 0 220px" },
                borderRadius: 1,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                boxShadow: 1,
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                scrollSnapAlign: { xs: "start", sm: "unset" },
              }}
              onClick={() => navigate(to)}
            >
              <ImageOptimizer
                src={src}
                alt={isPreset ? item.title : item.name}
                aspectRatio="4:5"
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ListRow;
