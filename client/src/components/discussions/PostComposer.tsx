import React, { useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Autocomplete,
  Tooltip,
  Avatar,
  Typography,
} from "@mui/material";
import {
  Send as SendIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  AlternateEmail as MentionIcon,
  Close as CloseIcon,
  Palette as PresetIcon,
  CameraAlt as FilmSimIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

interface PostComposerProps {
  onSubmit: (content: string, images?: File[]) => void;
  placeholder?: string;
  buttonText?: string;
  showMentions?: boolean;
  presets?: Array<{ id: string; title: string; slug: string }>;
  filmSims?: Array<{ id: string; title: string; slug: string }>;
  users?: Array<{ id: string; username: string; avatar?: string }>;
  maxImages?: number;
}

const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  placeholder = "Share your thoughts...",
  buttonText = "Post",
  showMentions = true,
  presets = [],
  filmSims = [],
  users = [],
  maxImages = 5,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!content.trim() || !user) return;

    onSubmit(content, selectedImages);

    // Reset form
    setContent("");
    setSelectedImages([]);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (selectedImages.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addMention = (type: "user" | "preset" | "filmsim", item: any) => {
    let mentionText = "";
    switch (type) {
      case "user":
        mentionText = `@${item.username} `;
        break;
      case "preset":
        mentionText = `@preset:${item.title} `;
        break;
      case "filmsim":
        mentionText = `@filmsim:${item.title} `;
        break;
    }
    setContent((prev) => prev + mentionText);
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const commonEmojis = [
    "👍",
    "❤️",
    "🔥",
    "😊",
    "🎉",
    "👏",
    "🤔",
    "😍",
    "🙌",
    "💯",
  ];

  if (!user) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary">
              Please log in to join the discussion
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* User info */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2">{user.username}</Typography>
        </Box>

        {/* Content input */}
        <TextField
          data-cy="comment-input"
          fullWidth
          multiline
          rows={3}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Selected images preview */}
        {selectedImages.length > 0 && (
          <ImageList
            sx={{
              width: "100%",
              maxWidth: 400,
              mb: 2,
              gridTemplateColumns:
                "repeat(auto-fill, minmax(80px, 1fr)) !important",
            }}
            cols={5}
            rowHeight={80}
          >
            {selectedImages.map((file, index) => (
              <ImageListItem key={index}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  style={{ objectFit: "cover" }}
                />
                <ImageListItemBar
                  actionIcon={
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{ color: "white" }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}

        {/* Action buttons */}
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {/* Image upload */}
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
          <Tooltip title="Add images">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedImages.length >= maxImages}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>

          {/* Emoji picker */}
          <Tooltip title="Add emoji">
            <IconButton
              size="small"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <EmojiIcon />
            </IconButton>
          </Tooltip>

          {/* Mentions */}
          {showMentions && (
            <>
              {/* User mentions */}
              <Autocomplete
                options={users}
                getOptionLabel={(option) => option.username}
                onChange={(_, value) => value && addMention("user", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Mention user"
                    sx={{ minWidth: 120 }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <MentionIcon sx={{ mr: 1, fontSize: 16 }} />
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar
                      src={option.avatar}
                      sx={{ width: 20, height: 20, mr: 1 }}
                    >
                      {option.username.charAt(0).toUpperCase()}
                    </Avatar>
                    {option.username}
                  </Box>
                )}
              />

              {/* Preset mentions */}
              <Autocomplete
                options={presets}
                getOptionLabel={(option) => option.title}
                onChange={(_, value) => value && addMention("preset", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Mention preset"
                    sx={{ minWidth: 120 }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <PresetIcon sx={{ mr: 1, fontSize: 16 }} />
                      ),
                    }}
                  />
                )}
              />

              {/* Film sim mentions */}
              <Autocomplete
                options={filmSims}
                getOptionLabel={(option) => option.title}
                onChange={(_, value) => value && addMention("filmsim", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Mention film sim"
                    sx={{ minWidth: 120 }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <FilmSimIcon sx={{ mr: 1, fontSize: 16 }} />
                      ),
                    }}
                  />
                )}
              />
            </>
          )}

          <Box flex={1} />

          {/* Submit button */}
          <Button
            data-cy="submit-comment"
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            {buttonText}
          </Button>
        </Box>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <Box
            mt={2}
            p={2}
            sx={{
              backgroundColor: "action.hover",
              borderRadius: 1,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {commonEmojis.map((emoji) => (
              <Chip
                key={emoji}
                label={emoji}
                size="small"
                onClick={() => addEmoji(emoji)}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PostComposer;
