import { formatDistanceToNow } from "date-fns";

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "a moment ago";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "an unknown time ago";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return "an unknown time ago";
  }
};
