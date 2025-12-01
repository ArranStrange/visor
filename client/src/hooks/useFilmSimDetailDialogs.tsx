import { useState, ReactNode } from "react";
import { useFilmSimOperations } from "./useFilmSimOperations";
import { useFilmSimPhotos } from "./useFilmSimPhotos";
import { useFeatured } from "./useFeatured";
import EditFilmSimDialog from "components/dialogs/EditFilmSimDialog";
import RecommendedPresetsManager from "components/cards/RecommendedPresetsManager";
import DeleteFilmSimDialog from "components/filmsims/dialogs/DeleteFilmSimDialog";
import FullscreenImageDialog from "components/presets/dialogs/FullscreenImageDialog";

interface FilmSim {
  id: string;
  name: string;
  featured?: boolean;
  recommendedPresets?: any[];
  [key: string]: any;
}

export const useFilmSimDetailDialogs = (
  filmSim: FilmSim | null | undefined,
  refetch: () => void
) => {
  const { isAdmin } = useFeatured();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [recommendedPresetsDialogOpen, setRecommendedPresetsDialogOpen] =
    useState(false);

  const operations = useFilmSimOperations(
    filmSim || { id: "", name: "" },
    refetch
  );

  const photos = useFilmSimPhotos();

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    operations.handleEdit();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    operations.handleDelete();
  };

  // Toolbar props - passed to FilmSimDetailToolbar.Slot
  const toolbarProps = {
    onMenuOpen: handleMenuOpen,
    onFeaturedToggle: operations.handleToggleFeatured,
    menuAnchorEl,
    menuOpen,
    onMenuClose: handleMenuClose,
    onEditClick: handleEditClick,
    onDeleteClick: handleDeleteClick,
  };

  // Section props - passed to FilmSimDetailSection.Slot
  const sectionProps = {
    onImageClick: photos.handleImageClick,
    onRecommendedPresetsManage: () => setRecommendedPresetsDialogOpen(true),
  };

  // Dialog components to render
  const dialogs: ReactNode = (
    <>
      {filmSim && (
        <>
          <EditFilmSimDialog
            open={operations.editDialogOpen}
            onClose={() => operations.setEditDialogOpen(false)}
            filmSim={filmSim}
            onSuccess={refetch}
          />

          <DeleteFilmSimDialog
            open={operations.deleteDialogOpen}
            filmSimName={filmSim.name}
            deleting={operations.deletingFilmSim}
            onClose={() => operations.setDeleteDialogOpen(false)}
            onConfirm={operations.handleDeleteFilmSim}
          />

          <FullscreenImageDialog
            open={!!photos.fullscreenImage}
            imageUrl={photos.fullscreenImage}
            isFeatured={photos.currentImageFeatured}
            showFeaturedToggle={isAdmin && !!photos.currentImageId}
            onClose={() => photos.setFullscreenImage(null)}
            onFeaturedToggle={photos.handleToggleFeaturedPhoto}
          />

          <RecommendedPresetsManager
            open={recommendedPresetsDialogOpen}
            onClose={() => setRecommendedPresetsDialogOpen(false)}
            filmSimId={filmSim.id}
            filmSimName={filmSim.name}
            currentRecommendedPresets={filmSim.recommendedPresets || []}
          />
        </>
      )}
    </>
  );

  return {
    toolbarProps,
    sectionProps,
    dialogs,
  };
};
