import React, { createContext, useContext, useState } from "react";

type ContentType = "all" | "presets" | "films";

interface ContentTypeContextProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
}

const ContentTypeContext = createContext<ContentTypeContextProps | undefined>(
  undefined
);

export const ContentTypeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contentType, setContentType] = useState<ContentType>("all");

  return (
    <ContentTypeContext.Provider value={{ contentType, setContentType }}>
      {children}
    </ContentTypeContext.Provider>
  );
};

export const useContentType = (): ContentTypeContextProps => {
  const context = useContext(ContentTypeContext);
  if (!context) {
    throw new Error("useContentType must be used within a ContentTypeProvider");
  }
  return context;
};
