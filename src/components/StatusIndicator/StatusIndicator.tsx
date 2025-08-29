import type { TodoStatus } from "../../types/todo";
import styles from "./StatusIndicator.module.css";

type StatusIndicatorProps = {
  status: TodoStatus;
};

const statusLabels: Record<TodoStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <span className={`${styles.status} ${styles[`status-${status}`]}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusIndicator;
