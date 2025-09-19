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
        <Box
          display="flex"
          alignItems={{ xs: "stretch", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          mb={3}
          gap={2}
        >
          <Typography variant="h4" component="h1">
            Discussions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/discussions/new")}
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              mt: { xs: 2, sm: 0 },
            }}
          >
            Start Discussion
          </Button>
        </Box>

        <DiscussionList />
      </Box>
    </Container>
  );
};

export default Discussions;
