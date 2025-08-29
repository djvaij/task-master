import { useState, type FC } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";
import styles from "./AddTodo.module.css";

interface AddTodoProps extends React.HTMLAttributes<HTMLDivElement> {
  onAdd: (title: string) => void;
}

export const AddTodo: FC<AddTodoProps> = ({ className, onAdd }) => {
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (title.trim() === "") return;
    onAdd(title);
  };

  return (
    <div className={clsx(styles.container, className)}>
      <input
        type="text"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className={styles.button} onClick={handleAdd}>
        <Plus />
      </button>
    </div>
  );
};
