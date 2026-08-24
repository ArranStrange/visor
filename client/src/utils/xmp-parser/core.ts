export const convertToDatabaseValue = (value: string): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.round(num * 100);
};

/**
 * Read a crs:* setting from an rdf:Description.
 *
 * Lightroom writes XMP in two shapes: attribute form
 * (crs:Contrast2012="+5" on the Description tag) and element form
 * (<crs:Contrast2012>+5</crs:Contrast2012> as a child). Only reading
 * attributes silently parsed element-form presets as all zeros.
 */
export const getCrsValue = (description: Element, name: string): string => {
  const attr = description.getAttribute(`crs:${name}`);
  if (attr !== null && attr !== "") return attr;

  const el = description.getElementsByTagName(`crs:${name}`)[0];
  const text = el?.textContent?.trim();
  if (text) return text;

  return "0";
};
