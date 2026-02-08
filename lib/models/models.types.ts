export interface Task {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  order: number;
  columnId?: string;
  labels?: string[];
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface Column {
  _id: string;
  name: string;
  order: number;
  tasks: Task[];
}

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
}
