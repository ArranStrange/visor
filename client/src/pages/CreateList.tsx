import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { gql } from "@apollo/client";
import { ListType } from "../types/lists";

const CREATE_LIST = gql`
  mutation CreateList($input: JSON!) {
    createUserList(input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

const CreateList: React.FC = () => {
  const { type } = useParams<{ type: ListType }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
    isFavouriteList: type === "favourite",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [createList] = useMutation(CREATE_LIST, {
    onCompleted: (data) => {
      navigate(`/lists/${type}/${data.createUserList.id}`);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isPublic" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createList({
        variables: {
          input: formData,
        },
      });
    } catch (err) {
      console.error("Error creating list:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Create New {type === "favourite" ? "Favourite" : "Custom"} List
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              label="List Name"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              label="Description"
              placeholder="Describe your list..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  name="isPublic"
                />
              }
              label="Public List"
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? <CircularProgress size={24} /> : "Create List"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateList;
