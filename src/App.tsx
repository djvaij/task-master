import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Board } from "./components/Board/Board";
import { Header } from "./components/Header";
import { useGetTodosQuery, useUpdateTodoMutation } from "./services/todosApi";
import styles from "./App.module.css";
import TaskPreview from "./components/Task/TaskPreview";
import { useMemo, useState } from "react";
import type { TodoStatus } from "./types/todo";

function App() {
  const { data: todos = [], isLoading, error } = useGetTodosQuery();
  const [updateTodo] = useUpdateTodoMutation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const activeTodo = useMemo(() => {
    if (!activeId) return null;
    return todos.find((t) => t.id === activeId) ?? null;
  }, [activeId, todos]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(String(active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // No-op if dropped onto itself
    if (String(over.id) === String(active.id)) {
      setActiveId(null);
      return;
    }

    // Ensure we only process task drag
    const activeType = active.data.current?.type as string | undefined;
    if (activeType !== "task") {
      setActiveId(null);
      return;
    }

    const dragged = todos.find((t) => t.id === String(active.id));
    if (!dragged) {
      setActiveId(null);
      return;
    }

    // Determine drop target
    // 1) Try match by task id regardless of data.current
    const overTask = todos.find((t) => t.id === String(over.id));
    let targetStatus: TodoStatus;
    let insertBeforeTaskId: string | null = null;

    if (overTask) {
      targetStatus = overTask.status;
      insertBeforeTaskId = overTask.id;
    } else {
      // Could be a column id
      const overIdStr = String(over.id) as TodoStatus;
      if (
        overIdStr === "todo" ||
        overIdStr === "in_progress" ||
        overIdStr === "done"
      ) {
        targetStatus = overIdStr;
      } else {
        targetStatus = dragged.status;
      }
    }

    // No-op if dropped on background of the same column without target task
    if (!overTask && targetStatus === dragged.status) {
      setActiveId(null);
      return;
    }

    // Build target list snapshot (sorted) without the dragged item for index calc
    const sortedTarget = todos
      .filter((t) =>
        insertBeforeTaskId
          ? t.status === targetStatus
          : t.status === targetStatus
      )
      .filter((t) => t.id !== dragged.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let insertIndex = sortedTarget.length;
    if (insertBeforeTaskId) {
      const idx = sortedTarget.findIndex((t) => t.id === insertBeforeTaskId);
      if (idx >= 0) insertIndex = idx;
    }

    // Same-column adjustment: when dragging downward, drop after the hovered item
    if (insertBeforeTaskId && targetStatus === dragged.status) {
      const originalColumn = todos
        .filter((t) => t.status === dragged.status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const draggedOriginalIndex = originalColumn.findIndex(
        (t) => t.id === dragged.id
      );
      const overOriginalIndex = originalColumn.findIndex(
        (t) => t.id === insertBeforeTaskId
      );
      const idxInTarget = sortedTarget.findIndex(
        (t) => t.id === insertBeforeTaskId
      );
      if (
        draggedOriginalIndex >= 0 &&
        overOriginalIndex >= 0 &&
        idxInTarget >= 0
      ) {
        // If dragged was above over originally, dropping should place it AFTER the over item
        if (draggedOriginalIndex < overOriginalIndex) {
          insertIndex = idxInTarget + 1;
        } else {
          insertIndex = idxInTarget;
        }
      }
    }

    const prevItem = sortedTarget[insertIndex - 1];
    const nextItem = sortedTarget[insertIndex];
    const prevOrder = prevItem?.order;
    const nextOrder = nextItem?.order;

    let newOrder: number;
    if (prevOrder != null && nextOrder != null) {
      // place between two neighbors
      newOrder = prevOrder + (nextOrder - prevOrder) / 2;
    } else if (prevOrder != null) {
      // at the end
      newOrder = prevOrder + 1000;
    } else if (nextOrder != null) {
      // at the start
      newOrder = nextOrder - 1000;
    } else {
      // list empty
      newOrder = 0;
    }

    try {
      await updateTodo({
        id: dragged.id,
        changes: { status: targetStatus, order: newOrder },
      }).unwrap();
    } catch (err) {
      console.error("Failed to persist reorder:", err);
    }

    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>We couldn't load your tasks. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Board />
          <DragOverlay dropAnimation={null}>
            {activeTodo ? <TaskPreview todo={activeTodo} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
}

export default App;
