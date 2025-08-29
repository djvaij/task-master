import { useGetTodosQuery } from "../../services/todosApi";
import styles from "./Board.module.css";
import { type TodoStatus } from "../../types/todo";
import type { Todo } from "../../services/todosApi";
import Column from "../Column";
import { useMemo } from "react";

const statuses: TodoStatus[] = ["todo", "in_progress", "done"];

export const Board = () => {
  const { data: todos = [], isLoading, error } = useGetTodosQuery();

  const todosByStatus = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = todos
        .filter((todo: Todo) => todo.status === status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return acc;
    }, {} as Record<TodoStatus, Todo[]>);
  }, [todos]);

  if (isLoading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error)
    return (
      <div className={styles.error}>
        Error loading tasks. Please try again later.
      </div>
    );

  return (
    <div className={styles.board}>
      {statuses.map((status) => (
        <Column key={status} status={status} todos={todosByStatus[status]} />
      ))}
    </div>
  );
};
