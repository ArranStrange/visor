// Convert database values to XMP format (multiply by 100 for percentage values)
export const convertToXMPValue = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0";
  // Convert from database format (0-100) to XMP format (0-100)
  return (value / 100).toString();
};
