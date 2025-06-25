import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { CloudinaryOptimizer } from "../utils/cloudinary";
import OptimizedImage from "./OptimizedImage";

const CloudinaryDemo: React.FC = () => {
  // Example Cloudinary URLs (replace with actual URLs from your app)
  const sampleImages = [
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  ];

  const testUrl =
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cloudinary Optimization Demo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              URL Transformations
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Original:</strong> {testUrl}
              <br />
              <strong>Thumbnail:</strong>{" "}
              {CloudinaryOptimizer.getThumbnail(testUrl)}
              <br />
              <strong>Progressive:</strong>{" "}
              {CloudinaryOptimizer.getProgressive(testUrl)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Responsive SrcSet
            </Typography>
            <Typography variant="body2" component="div">
              {(() => {
                const responsive =
                  CloudinaryOptimizer.getResponsiveSrcSet(testUrl);
                return (
                  <>
                    <strong>Mobile:</strong> {responsive.mobile}
                    <br />
                    <strong>Tablet:</strong> {responsive.tablet}
                    <br />
                    <strong>Desktop:</strong> {responsive.desktop}
                  </>
                );
              })()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Optimized Image Loading Demo
          </Typography>
          <Grid container spacing={2}>
            {sampleImages.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ aspectRatio: "3/4", position: "relative" }}>
                  <OptimizedImage
                    src={image}
                    alt={`Demo image ${index + 1}`}
                    aspectRatio="3:4"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CloudinaryDemo;
