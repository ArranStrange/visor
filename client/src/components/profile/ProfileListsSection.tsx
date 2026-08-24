import React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListIcon from "@mui/icons-material/List";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ProfileListsSectionProps {
  lists: any[];
}

const ProfileListsSection: React.FC<ProfileListsSectionProps> = ({ lists }) => {
  const navigate = useNavigate();
  const publicLists = lists.filter((list) => list.isPublic);

  if (publicLists.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Lists
      </Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="lists-content"
          id="lists-header"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ListIcon color="primary" />
            <Typography variant="h6">
              Public Lists ({publicLists.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ p: 0 }}>
            {publicLists.map((list, index) => (
              <ProfileListRow
                key={list.id}
                list={list}
                showDivider={index < publicLists.length - 1}
                onSelect={() => navigate(`/list/${list.id}`)}
              />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

interface ProfileListRowProps {
  list: any;
  showDivider: boolean;
  onSelect: () => void;
}

const ProfileListRow: React.FC<ProfileListRowProps> = ({
  list,
  showDivider,
  onSelect,
}) => (
  <React.Fragment>
    <ListItem disablePadding>
      <ListItemButton onClick={onSelect}>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1} component="span">
              <Typography variant="h6" component="span">
                {list.name}
              </Typography>
              <Chip size="small" label="Public" color="primary" />
            </Box>
          }
          secondary={
            <Box component="span">
              {list.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                  sx={{ display: "block", mb: 1 }}
                >
                  {list.description}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" component="span">
                {list.presets?.length || 0} presets •{" "}
                {list.filmSims?.length || 0} film sims
              </Typography>
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
    {showDivider && <Divider />}
  </React.Fragment>
);

export default ProfileListsSection;
