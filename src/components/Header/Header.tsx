import { AddTodo } from "../AddTodo";
import { Logo } from "../Logo";
import styles from "./Header.module.css";
import { Album } from "lucide-react";
import { useCreateTodoMutation } from "../../services/todosApi";
import { useToast } from "../common/Toast/ToastProvider";

export const Header = () => {
  const [createTodo] = useCreateTodoMutation();
  const { showToast } = useToast();
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Logo />
        <AddTodo
          onAdd={async (title) => {
            showToast({ type: "info", message: "Створюємо задачу..." });
            try {
              await createTodo({ title }).unwrap();
              showToast({ type: "success", message: "Задачу створено" });
            } catch {
              showToast({
                type: "error",
                message: "Не вдалося створити задачу",
              });
            } finally {
              // auto-dismiss info toast via duration, nothing to do
            }
          }}
        />
      </div>
      <div className={styles.right}>
        <div className={styles.title}>Task Master</div>
        <Album size={32} />
      </div>
      {/* Optionally reflect states */}
      {/* {isLoading && <div>Adding...</div>} */}
      {/* {isSuccess && <div>Added!</div>} */}
      {/* {isError && <div>Failed</div>} */}
    </header>
  );
};
