import React from "react";
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  SxProps,
  Theme,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMobileDetection } from "hooks/useMobileDetection";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <NavigateNextIcon sx={{ fontSize: "12px" }} />,
  sx,
}) => {
  const navigate = useNavigate();
  const isMobile = useMobileDetection();

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    navigate(path);
  };

  if (isMobile) {
    return null;
  }

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
                  fontSize: "12px",
                  alignItems: "center",
                  gap: 0.5,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {item.label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
