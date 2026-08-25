import { useState } from "react";
import { Box } from "@mui/material";
import { ParsedSettings } from "@/types/xmpSettings";
import { parseXmpContent } from "@/features/settings/utils/settingsParser";
import FileUpload from "@/components/ui/FileUpload";
import StatusMessage from "@/components/ui/StatusMessage";

interface XmpParserProps {
  onSettingsParsed: (settings: ParsedSettings, file: File) => void;
}

const XmpParser = ({ onSettingsParsed }: XmpParserProps) => {
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const settings = parseXmpContent(content);
        onSettingsParsed(settings, file);
        setStatus({ type: "success", message: "Lightroom File Uploaded" });
      } catch {
        setStatus({
          type: "error",
          message: "Error processing the file settings",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <FileUpload
        accept=".xmp"
        onFileSelect={handleFileSelect}
        label="Click to upload XMP file"
        id="xmp-file-input"
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </Box>
  );
};

export default XmpParser;
