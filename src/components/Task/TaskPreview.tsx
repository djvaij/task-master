import type { Todo } from "../../services/todosApi";
import type { TodoStatus } from "../../types/todo";
import styles from "./Task.module.css";
import { GripVertical } from "lucide-react";

type TaskPreviewProps = {
  todo: Todo;
};

type StatusColors = { [K in TodoStatus]: string };

const statusColors: StatusColors = {
  todo: "#ff6b6b",
  in_progress: "#4dabf7",
  done: "#51cf66",
};

const TaskPreview: React.FC<TaskPreviewProps> = ({ todo }) => {
  const style: React.CSSProperties = {
    borderLeft: `4px solid ${statusColors[todo.status]}`,
  };
  return (
    <div className={`${styles.task} ${styles.dragOverlay}`} style={style}>
      <div className={styles.taskHeader}>
        <div className={styles.dragHandle} aria-label="Drag preview">
          <GripVertical />
        </div>
        <h3 className={styles.taskTitle}>{todo.title}</h3>
        {/* Non-interactive status badge for preview */}
        <span className={styles.status + " " + (
          todo.status === "todo"
            ? styles["status-todo"]
            : todo.status === "in_progress"
            ? styles["status-in-progress"]
            : styles["status-done"]
        )}>
          {todo.status === "todo" ? "To Do" : todo.status === "in_progress" ? "In Progress" : "Done"}
        </span>
      </div>
    </div>
  );
};

export default TaskPreview;


