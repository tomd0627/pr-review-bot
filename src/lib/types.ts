export type Severity = "critical" | "major" | "minor";
export type Category = "accessibility" | "performance" | "quality";

export interface Finding {
  file: string;
  line: number;
  severity: Severity;
  category: Category;
  criterion?: string;
  title: string;
  message: string;
  suggestion: string;
}

export type ReviewStatus = "idle" | "streaming" | "done" | "error";
