"use client";

import { useEffect, useState } from "react";
import { Board, Column, Task } from "../models/models.types";
import { updateTask } from "../actions/tasks";

export function useBoard(initialBoard?: Board | null) {
  const [board, setBoard] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
      setBoard(initialBoard);
      setColumns(initialBoard.columns || []);
    }
  }, [initialBoard]);

  async function moveTaskClient(taskId: string, newColumnId: string, newOrder: number) {
    // optimistic update
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        tasks: [...(col.tasks || [])],
      }));

      let taskToMove: Task | null = null;
      let oldColumnId: string | null = null;

      for (const col of newColumns) {
        const idx = (col.tasks || []).findIndex((t) => t._id === taskId);
        if (idx !== -1) {
          taskToMove = col.tasks![idx];
          oldColumnId = col._id;
          col.tasks = col.tasks!.filter((t) => t._id !== taskId);
          break;
        }
      }

      if (taskToMove && oldColumnId) {
        const targetIdx = newColumns.findIndex((c) => c._id === newColumnId);
        if (targetIdx !== -1) {
          const target = newColumns[targetIdx];
          const current = target.tasks || [];

          const updated = [...current];
          updated.splice(newOrder, 0, {
            ...taskToMove,
            columnId: newColumnId,
            order: newOrder * 100,
          });

          const withOrders = updated.map((t, idx) => ({
            ...t,
            order: idx * 100,
          }));

          newColumns[targetIdx] = {
            ...target,
            tasks: withOrders,
          };
        }
      }

      return newColumns;
    });

    try {
      await updateTask(taskId, { columnId: newColumnId, order: newOrder });
    } catch (err) {
      console.error("Error moving task", err);
      setError(err instanceof Error ? err.message : "Failed to move task");
    }
  }

  return { board, columns, error, moveTask: moveTaskClient };
}
