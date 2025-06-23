import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DiscussionList from "../components/discussions/DiscussionList";

const Discussions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              💬 Discussions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join the VISOR community conversation about presets, film
              simulations, and photography
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/discussions/new")}
          >
            Start Discussion
          </Button>
        </Box>

        {/* Discussion list */}
        <DiscussionList />
      </Box>
    </Container>
  );
};

export default Discussions;
