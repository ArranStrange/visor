import React from "react";
import { Divider } from "@mui/material";

export function DividerWrapper({ my = 3 }: { my?: number }) {
  return <Divider sx={{ my }} />;
}

