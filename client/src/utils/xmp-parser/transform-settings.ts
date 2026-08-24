import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseTransformSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  const getBoolAttr = (name: string): boolean =>
    getCrsValue(description, name) === "True";

  return {
    transform: {
      perspectiveVertical: convertToDatabaseValue(
        getAttr("PerspectiveVertical")
      ),
      perspectiveHorizontal: convertToDatabaseValue(
        getAttr("PerspectiveHorizontal")
      ),
      perspectiveRotate: convertToDatabaseValue(getAttr("PerspectiveRotate")),
      perspectiveScale: convertToDatabaseValue(getAttr("PerspectiveScale")),
      perspectiveAspect: convertToDatabaseValue(getAttr("PerspectiveAspect")),
      autoPerspective: getBoolAttr("AutoPerspective"),
    },
  };
};
