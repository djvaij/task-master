import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoStatus } from "../../types/todo";
import type { Todo } from "../../services/todosApi";
import styles from "./Task.module.css";

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
      roleDescription: 'draggable task',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `4px solid ${statusColors[todo.status]}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.task}
      {...attributes}
      {...listeners}
    >
      <div className={styles.taskHeader}>
        <h3 className={styles.taskTitle}>{todo.title}</h3>
        {/* <StatusIndicator status={todo.status} /> */}
      </div>
    </div>
  );
};

export default Task;
