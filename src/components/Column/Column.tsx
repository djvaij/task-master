import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { TodoStatus } from "../../types/todo";
import type { Todo } from "../../services/todosApi";
import Task from "../Task";
import styles from "./Column.module.css";
import { Lightbulb, Wrench, Check } from "lucide-react";

type ColumnProps = {
  status: TodoStatus;
  todos: Todo[];
};

const statusTitles = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusIcons = {
  todo: <Lightbulb />,
  in_progress: <Wrench />,
  done: <Check />,
};

const Column = ({ status, todos }: ColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: "column", status },
  });
  const style = {} as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className={styles.column}>
      <h2 className={styles.columnHeader}>
        {statusTitles[status]} ({todos.length}){statusIcons[status]}
      </h2>
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.tasks}>
          {todos.map((todo) => (
            <Task key={todo.id} todo={todo} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default Column;
