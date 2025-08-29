import type { Todo } from "../../services/todosApi";
import styles from "./Task.module.css";

type TaskPreviewProps = {
  todo: Todo;
};

const TaskPreview: React.FC<TaskPreviewProps> = ({ todo }) => {
  return (
    <div className={styles.task} style={{ opacity: 0.9 }}>
      <div className={styles.taskHeader}>
        <h3 className={styles.taskTitle}>{todo.title}</h3>
      </div>
    </div>
  );
};

export default TaskPreview;


