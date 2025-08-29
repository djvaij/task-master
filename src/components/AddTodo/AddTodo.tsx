import { useState, type FC } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";
import styles from "./AddTodo.module.css";

interface AddTodoProps extends React.HTMLAttributes<HTMLDivElement> {
  onAdd: (title: string) => Promise<void> | void;
}

export const AddTodo: FC<AddTodoProps> = ({ className, onAdd }) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const value = title.trim();
    if (!value || isSubmitting) return;
    setSubmitting(true);
    try {
      await onAdd(value);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      <input
        type="text"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handleAdd();
          }
        }}
      />
      <button className={styles.button} onClick={handleAdd} disabled={isSubmitting}>
        <Plus />
      </button>
    </div>
  );
};
