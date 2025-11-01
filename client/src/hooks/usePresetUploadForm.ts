import { useState, useCallback } from "react";
import { ParsedSettings } from "../types/xmpSettings";
import {
  ImageInput,
  validatePresetImage,
  uploadPresetImageToCloudinary,
} from "../utils/presetUploadUtils";

export interface PresetUploadFormState {
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
  beforeImage: File | null;
  afterImage: File | null;
  notes: string;
  parsedSettings: ParsedSettings | null;
  uploadedBeforeImage: ImageInput | null;
  uploadedAfterImage: ImageInput | null;
}

export interface UsePresetUploadFormReturn {
  formState: PresetUploadFormState;
  setFormState: React.Dispatch<React.SetStateAction<PresetUploadFormState>>;
  error: string | null;
  setError: (error: string | null) => void;
  fileError: string | null;
  setFileError: (error: string | null) => void;
  isUploading: boolean;
  handleTagKeyDown: (e: React.KeyboardEvent) => void;
  handleBeforeImageChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleAfterImageChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleSettingsParsed: (settings: ParsedSettings) => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateTagInput: (tagInput: string) => void;
  removeTag: (tag: string) => void;
  updateNotes: (notes: string) => void;
}

export const usePresetUploadForm = (): UsePresetUploadFormReturn => {
  const [formState, setFormState] = useState<PresetUploadFormState>({
    title: "",
    description: "",
    tags: [],
    tagInput: "",
    beforeImage: null,
    afterImage: null,
    notes: "",
    parsedSettings: null,
    uploadedBeforeImage: null,
    uploadedAfterImage: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && formState.tagInput.trim()) {
        e.preventDefault();
        const newTag = formState.tagInput.trim().toLowerCase();
        if (!formState.tags.includes(newTag)) {
          setFormState((prev) => ({
            ...prev,
            tags: [...prev.tags, newTag],
            tagInput: "",
          }));
        }
      }
    },
    [formState.tagInput, formState.tags]
  );

  const handleBeforeImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError(null);
      const file = e.target.files?.[0];
      if (file) {
        const validation = validatePresetImage(file);
        if (!validation.isValid) {
          setFileError(validation.error || "Invalid file");
          e.target.value = "";
          return;
        }

        setFormState((prev) => ({ ...prev, beforeImage: file }));
        try {
          setIsUploading(true);
          const result = await uploadPresetImageToCloudinary(file);
          setFormState((prev) => ({ ...prev, uploadedBeforeImage: result }));
        } catch (error) {
          setFileError("Failed to upload before image to Cloudinary");
          console.error("Error uploading before image:", error);
        } finally {
          setIsUploading(false);
        }
      }
    },
    []
  );

  const handleAfterImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError(null);
      const file = e.target.files?.[0];
      if (file) {
        const validation = validatePresetImage(file);
        if (!validation.isValid) {
          setFileError(validation.error || "Invalid file");
          e.target.value = "";
          return;
        }

        setFormState((prev) => ({ ...prev, afterImage: file }));
        try {
          setIsUploading(true);
          const result = await uploadPresetImageToCloudinary(file);
          setFormState((prev) => ({ ...prev, uploadedAfterImage: result }));
        } catch (error) {
          setFileError("Failed to upload after image to Cloudinary");
          console.error("Error uploading after image:", error);
        } finally {
          setIsUploading(false);
        }
      }
    },
    []
  );

  const handleSettingsParsed = useCallback((settings: ParsedSettings) => {
    if (!settings || typeof settings !== "object") {
      setError("Invalid settings format received from XMP parser");
      return;
    }
    setFormState((prev) => ({ ...prev, parsedSettings: settings }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setFormState((prev) => ({ ...prev, title }));
  }, []);

  const updateDescription = useCallback((description: string) => {
    setFormState((prev) => ({ ...prev, description }));
  }, []);

  const updateTagInput = useCallback((tagInput: string) => {
    setFormState((prev) => ({ ...prev, tagInput }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setFormState((prev) => ({ ...prev, notes }));
  }, []);

  return {
    formState,
    setFormState,
    error,
    setError,
    fileError,
    setFileError,
    isUploading,
    handleTagKeyDown,
    handleBeforeImageChange,
    handleAfterImageChange,
    handleSettingsParsed,
    updateTitle,
    updateDescription,
    updateTagInput,
    removeTag,
    updateNotes,
  };
};
