import React from "react";
import NavBar from "./Navbar";
import ContentTypeToggle from "../ContentTypeToggle";
import { Box } from "@mui/material";

const NavWithToggle: React.FC = () => {
  return (
    <Box>
      <NavBar />
      <Box
        sx={{
          backgroundColor: "background.default",

          display: "flex",
          justifyContent: "center",
        }}
      >
        <ContentTypeToggle />
      </Box>
    </Box>
  );
};

export default NavWithToggle;
