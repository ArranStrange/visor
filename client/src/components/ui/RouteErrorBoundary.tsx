import { Component, ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

// Lazy route chunks can fail to load when a stale tab navigates after a
// redeploy has replaced the hashed chunk files; without a boundary that
// rejection renders a blank screen.
class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 4,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="subtitle1">
          Something went wrong loading this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A new version of VISOR may have been released.
        </Typography>
        <Button variant="outlined" onClick={handleReload}>
          Reload page
        </Button>
      </Box>
    );

    function handleReload() {
      window.location.reload();
    }
  }
}

export default RouteErrorBoundary;
