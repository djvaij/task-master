import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoStatus } from "../../types/todo";
import type { Todo } from "../../services/todosApi";
import {
  useDeleteTodoMutation,
  useUpdateTodoMutation,
} from "../../services/todosApi";
import { useToast } from "../common/Toast/ToastProvider";
import styles from "./Task.module.css";
import { GripVertical, Trash } from "lucide-react";

type TaskProps = {
  todo: Todo;
};

type StatusColors = {
  [K in TodoStatus]: string;
};

const statusColors: StatusColors = {
  todo: "#ff6b6b",
  in_progress: "#4dabf7",
  done: "#51cf66",
};

const Task: React.FC<TaskProps> = ({ todo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: "task",
      todo,
    },
    attributes: {
      roleDescription: "draggable task",
    },
  });

  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();
  const { showToast } = useToast();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `4px solid ${statusColors[todo.status]}`,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.task}>
      <div className={styles.taskHeader}>
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Drag"
        >
          <GripVertical />
        </div>
        <h3 className={styles.taskTitle}>{todo.title}</h3>
        <div className={styles.taskActions}>
          <select
            className={styles.statusSelect}
            value={todo.status}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              const nextStatus = e.target.value as TodoStatus;
              if (nextStatus === todo.status) return;
              showToast({ type: "info", message: "Оновлюємо статус..." });
              try {
                await updateTodo({
                  id: todo.id,
                  changes: { status: nextStatus, order: Date.now() },
                }).unwrap();
                showToast({ type: "success", message: "Статус оновлено" });
              } catch {
                showToast({
                  type: "error",
                  message: "Не вдалося оновити статус",
                });
              }
            }}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button
            className={styles.deleteBtn}
            aria-label="Delete task"
            title="Delete task"
            disabled={isDeleting}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async (e) => {
              e.stopPropagation();
              showToast({ type: "info", message: "Видаляємо задачу..." });
              try {
                await deleteTodo(todo.id).unwrap();
                showToast({ type: "success", message: "Задачу видалено" });
              } catch {
                showToast({
                  type: "error",
                  message: "Не вдалося видалити задачу",
                });
              }
            }}
          >
            <Trash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task;
