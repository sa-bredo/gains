
import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Invalid date";
  }
};
