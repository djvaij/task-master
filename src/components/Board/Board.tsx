import { useGetTodosQuery } from "../../services/todosApi";
import styles from "./Board.module.css";
import { type TodoStatus } from "../../types/todo";
import type { Todo } from "../../services/todosApi";
import Column from "../Column";
import { useMemo } from "react";

const statuses: TodoStatus[] = ["todo", "in_progress", "done"];

export const Board = () => {
  const { data: todos = [], isError } = useGetTodosQuery(undefined, {
    refetchOnReconnect: true,
    refetchOnFocus: false,
  });

  const todosByStatus = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = todos
        .filter((todo: Todo) => todo.status === status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return acc;
    }, {} as Record<TodoStatus, Todo[]>);
  }, [todos]);

  // Не показуємо повноекранну помилку. Завжди рендеримо дошку.
  // Якщо перше завантаження та немає даних — просто будуть порожні колонки.

  return (
    <div className={styles.board}>
      {isError && todos.length > 0 && (
        <div className={styles.banner}>
          You are offline. Showing cached data.
        </div>
      )}
      {statuses.map((status) => (
        <Column key={status} status={status} todos={todosByStatus[status]} />
      ))}
    </div>
  );
};
