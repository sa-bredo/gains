
import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Invalid date";
  }
};
