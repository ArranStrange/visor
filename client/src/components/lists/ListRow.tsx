import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import TuneIcon from "@mui/icons-material/Tune";
import CameraRollIcon from "@mui/icons-material/CameraRoll";
import { gql, useMutation } from "@apollo/client";
import { useAdmin } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import ImageOptimizer from "../media/ImageOptimizer";

const squareImageStyles = {
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: 3,
} as const;

type ListTile =
  | { type: "info" }
  | {
      type: "image";
      id: string;
      itemType: "preset" | "filmsim";
      src: string;
      alt: string;
      to: string;
    };

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
                getUserLists(existing) {
                  if (!existing) return existing;
                  return existing.map((l: any) =>
                    l.id === id ? { ...l, isFeatured: false } : l
                  );
                },
              },
            });
          },
          refetchQueries: ["BrowseUserLists", "GetUserLists"],
          awaitRefetchQueries: true,
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
                    l.id === id
                      ? { ...l, isFeatured: true }
                      : { ...l, isFeatured: false }
                  );
                  return { ...existing, lists };
                },
                getUserLists(existing) {
                  if (!existing) return existing;

                  return existing.map((l: any) =>
                    l.id === id
                      ? { ...l, isFeatured: true }
                      : { ...l, isFeatured: false }
                  );
                },
              },
            });
          },
          refetchQueries: ["BrowseUserLists", "GetUserLists"],
          awaitRefetchQueries: true,
        });
      }
    } catch (err) {
      console.error("Error toggling featured state:", err);
    }
  };
  const totalItems = (presets?.length || 0) + (filmSims?.length || 0);

  const tiles = useMemo<ListTile[]>(() => {
    const imageTiles = [
      ...(presets || []).map((p) => ({
        type: "image" as const,
        id: `preset-${p.id}`,
        itemType: "preset" as const,
        src: p.afterImage?.url || "/placeholder-image.jpg",
        alt: p.title,
        to: `/preset/${p.slug}`,
      })),
      ...(filmSims || []).map((f) => ({
        type: "image" as const,
        id: `filmsim-${f.id}`,
        itemType: "filmsim" as const,
        src: f.sampleImages?.[0]?.url || "/placeholder-image.jpg",
        alt: f.name,
        to: `/filmsim/${f.slug}`,
      })),
    ].slice(0, 3);

    if (imageTiles.length === 0) {
      return [{ type: "info" as const }];
    }

    const insertionIndex = Math.min(1, imageTiles.length);
    return [
      ...imageTiles.slice(0, insertionIndex),
      { type: "info" as const },
      ...imageTiles.slice(insertionIndex),
    ];
  }, [presets, filmSims]);

  return (
    <Box sx={{ mb: { xs: 3, sm: 4, md: 5 }, py: { xs: 1.5, md: 2 } }}>
      <Box
        sx={{
          display: { xs: "grid", md: "flex" },
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "unset" },
          gap: { xs: 1.25, sm: 1.5, md: 2 },
          justifyContent: { md: "flex-start" },
          overflowX: { xs: "visible", md: "auto" },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          pb: 1,
          mb: { xs: 1.5, md: 2 },
        }}
      >
        {tiles.map((tile, idx) => {
          const commonSx = {
            flex: { xs: "0 0 auto", sm: "0 0 200px", md: "0 0 240px" },
            ...squareImageStyles,
          };

          if (tile.type === "info") {
            return (
              <Box
                key={`list-tile-info-${id}-${idx}`}
                sx={{
                  ...commonSx,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  gap: 1.25,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      src={owner?.avatar}
                      alt={owner?.username}
                      sx={{ width: 32, height: 32, cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${owner.id}`)}
                    >
                      {owner?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {isFeatured ? "Featured List" : "User List"}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {owner.username}
                      </Typography>
                    </Box>
                  </Stack>
                  {isAdmin && (
                    <Tooltip title={isFeatured ? "Unfeature" : "Feature"}>
                      <IconButton onClick={handleToggleFeatured} size="small">
                        {isFeatured ? (
                          <StarIcon color="warning" />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Box sx={{ minHeight: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 900, mb: 0.5, lineHeight: 1.15 }}
                    noWrap
                    title={name}
                  >
                    {name}
                  </Typography>
                  {description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: (t) => t.palette.text.secondary,
                        display: "-webkit-box",
                        WebkitLineClamp: 3 as any,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {description}
                    </Typography>
                  )}
                </Box>

                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/list/${id}`)}
                  >
                    View List
                  </Button>
                </Stack>
              </Box>
            );
          }

          const icon =
            tile.itemType === "preset" ? <TuneIcon /> : <CameraRollIcon />;

          return (
            <Box
              key={tile.id}
              sx={{
                ...commonSx,
                cursor: "pointer",
                position: "relative",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
              }}
              onClick={() => navigate(tile.to)}
            >
              <ImageOptimizer
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Chip
                icon={icon}
                label=""
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "#fff",
                  height: 20,
                  width: 20,
                  minWidth: 20,
                  "& .MuiChip-icon": {
                    color: "#fff",
                    fontSize: "0.875rem",
                    margin: 0,
                  },
                  "& .MuiChip-label": {
                    display: "none",
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ListRow;
