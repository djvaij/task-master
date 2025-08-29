import { AddTodo } from "../AddTodo";
import { Logo } from "../Logo";
import styles from "./Header.module.css";
import { Album } from "lucide-react";

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Logo />
        <AddTodo onAdd={() => {}} />
      </div>
      <div className={styles.right}>
        <div className={styles.title}>Task Master</div>
        <Album size={32} />
      </div>
    </header>
  );
};
