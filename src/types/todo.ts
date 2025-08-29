export type TodoStatus = "todo" | "in_progress" | "done";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  title: string;
  description: string;
  status: TodoStatus;
}

export interface UpdateTodoStatusPayload {
  id: string;
  status: TodoStatus;
}
