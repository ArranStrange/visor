import { useState } from "react";
import { IconButton } from "@mui/material";

export function EmojiButton() {
  const [isHappy, setIsHappy] = useState(false);

  return (
    <IconButton
      onClick={() => setIsHappy(!isHappy)}
      sx={{
        display: "flex",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
        },
      }}
    >
      {isHappy ? "😊" : "😢"}
    </IconButton>
  );
}
