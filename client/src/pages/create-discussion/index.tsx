import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_DISCUSSION } from "../../graphql/discussions";
import DiscussionTypeSelect from "./DiscussionTypeSelect";
import ItemAutocomplete, { LinkableItem } from "./ItemAutocomplete";
import { DiscussionLinkedType } from "./discussionTypeLabels";

interface CreateDiscussionForm {
  title: string;
  linkedToType: DiscussionLinkedType;
  linkedToId: string;
}

const CreateDiscussion: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateDiscussionForm>({
    title: "",
    linkedToType: "PRESET",
    linkedToId: "",
  });
  const [selectedItem, setSelectedItem] = useState<LinkableItem | null>(null);

  const [createDiscussion, { loading: creating }] =
    useMutation(CREATE_DISCUSSION);

  const showItemSelection =
    form.linkedToType === "PRESET" || form.linkedToType === "FILMSIM";

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            href="/discussions"
            onClick={handleBackToDiscussions}
          >
            Discussions
          </Link>
          <Typography color="text.primary">Create Discussion</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" gutterBottom>
          Start a Discussion
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Create a new discussion about a preset or film simulation
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Discussion Title"
                value={form.title}
                onChange={handleTitleChange}
                required
                sx={{ mb: 3 }}
                placeholder="What would you like to discuss?"
              />

              <DiscussionTypeSelect
                value={form.linkedToType}
                onChange={handleTypeChange}
              />

              {showItemSelection && (
                <ItemAutocomplete
                  key={form.linkedToType}
                  linkedToType={form.linkedToType}
                  selectedItem={selectedItem}
                  onChange={handleItemChange}
                />
              )}

              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={creating || !form.title.trim()}
                >
                  {creating ? "Creating..." : "Create Discussion"}
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );

  function handleBackToDiscussions(e: React.MouseEvent) {
    e.preventDefault();
    navigate("/discussions");
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  }

  function handleTypeChange(linkedToType: DiscussionLinkedType) {
    setForm((prev) => ({ ...prev, linkedToType, linkedToId: "" }));
    setSelectedItem(null);
  }

  function handleItemChange(item: LinkableItem | null) {
    setSelectedItem(item);
    setForm((prev) => ({ ...prev, linkedToId: item?.id || "" }));
  }

  function handleCancel() {
    navigate("/discussions");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    try {
      const result = await createDiscussion({
        variables: {
          input: {
            title: form.title.trim(),
            linkedToType: form.linkedToType,
            linkedToId: form.linkedToId || "",
          },
        },
      });

      if (result.data?.createDiscussion) {
        navigate(`/discussions/${result.data.createDiscussion.id}`);
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
    }
  }
};

export default CreateDiscussion;
