import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseMetadataSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  const getBoolAttr = (name: string): boolean =>
    getCrsValue(description, name) === "True";

  return {
    metadata: {
      rating: convertToDatabaseValue(getAttr("Rating")),
      label: getAttr("Label"),
      title: getAttr("Title"),
      creator: getAttr("Creator"),
      dateCreated: getAttr("DateCreated"),
    },
    hasSettings: getBoolAttr("HasSettings"),
    rawFileName: getAttr("RawFileName"),
    snapshot: getAttr("Snapshot"),
  };
};
