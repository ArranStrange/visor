import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import type { UserList } from "../../types/lists";

interface AddToListRowProps {
  list: UserList;
  onAdd: (listId: string) => void;
}

function AddToListRow({ list, onAdd }: AddToListRowProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleAdd}>
        <ListItemText
          primary={list.name}
          secondary={
            <Box>
              {list.description && (
                <Typography variant="body2" color="text.secondary">
                  {list.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {list.presets?.length || 0} presets •{" "}
                {list.filmSims?.length || 0} film sims
                {list.isPublic && " • Public"}
              </Typography>
            </Box>
          }
          secondaryTypographyProps={{ component: "div" }}
        />
      </ListItemButton>
    </ListItem>
  );

  function handleAdd() {
    onAdd(list.id);
  }
}

export default AddToListRow;
