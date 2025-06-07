import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";

const Upload: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [xmpFile, setXmpFile] = useState<File | null>(null);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags));
    if (xmpFile) formData.append("xmp", xmpFile);
    if (beforeImage) formData.append("beforeImage", beforeImage);
    if (afterImage) formData.append("afterImage", afterImage);
    formData.append("notes", notes);

    // Send to backend here via fetch or Apollo mutation
    console.log("Form submitted:", {
      title,
      tags,
      xmpFile,
      beforeImage,
      afterImage,
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Upload New Preset
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3} mt={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box>
            <InputLabel>Tags</InputLabel>
            <OutlinedInput
              placeholder="Type tag and press enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              fullWidth
            />
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <InputLabel htmlFor="xmp-upload">.xmp Preset File</InputLabel>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mt: 1 }}
            >
              {xmpFile ? xmpFile.name : "Upload XMP"}
              <input
                type="file"
                accept=".xmp"
                hidden
                onChange={(e) => setXmpFile(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <Box>
            <InputLabel htmlFor="before-upload">Before Image</InputLabel>
            <Button component="label" variant="outlined" sx={{ mt: 1 }}>
              {beforeImage ? beforeImage.name : "Upload Before"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setBeforeImage(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <Box>
            <InputLabel htmlFor="after-upload">After Image</InputLabel>
            <Button component="label" variant="outlined" sx={{ mt: 1 }}>
              {afterImage ? afterImage.name : "Upload After"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setAfterImage(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <TextField
            label="Creator Notes"
            multiline
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Submit Preset
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default Upload;
