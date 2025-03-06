
import { 
  AlignLeft, 
  Calendar, 
  CheckSquare, 
  FileText, 
  List, 
  Mail, 
  Type, 
  Hash
} from "lucide-react";
import { FieldType } from "../types";

export const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  textarea: <AlignLeft className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  multiple_choice: <List className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />
};

export const fieldTypeLabels: Record<FieldType, string> = {
  text: "Short Text",
  textarea: "Long Text",
  number: "Number",
  email: "Email",
  multiple_choice: "Multiple Choice",
  checkbox: "Checkboxes",
  date: "Date",
  file: "File Upload"
};

export const fieldTypes: FieldType[] = [
  "text",
  "textarea",
  "number",
  "email",
  "multiple_choice",
  "checkbox",
  "date",
  "file"
];
