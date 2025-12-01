import React from "react";
import { Breadcrumbs, Link, Typography, Box, SxProps, Theme } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path?: string; // Optional - if not provided, renders as Typography (current page)
  icon?: React.ReactNode; // Optional icon
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Breadcrumb Component
 * 
 * Displays a breadcrumb navigation trail using Material-UI components.
 * Items with paths are rendered as clickable links, items without paths
 * are rendered as Typography (current page).
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <NavigateNextIcon fontSize="small" />,
  sx,
}) => {
  const navigate = useNavigate();

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Breadcrumbs separator={separator} aria-label="breadcrumb navigation">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (item.path && !isLast) {
            return (
              <Link
                key={index}
                color="inherit"
                href={item.path}
                onClick={(e) => handleClick(e, item.path!)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          }

          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {item.icon}
              {item.label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;

