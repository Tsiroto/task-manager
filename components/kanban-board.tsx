"use client";

import * as React from "react";
import CreateJobDialog from "./create-job-dialog";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { deleteTask, updateTask } from "@/lib/actions/tasks";

type Task = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  labels?: string[];
  description?: string;
  dueDate?: string | Date;
  priority?: "low" | "medium" | "high";
  order: number;
  columnId: string;
};

type Column = {
  _id: string;
  name: string;
  order: number;
  tasks: Task[];
};

type Board = {
  _id: string;
  name: string;
  columns: Column[];
};

type Props = {
  board: Board;
  onRefresh?: () => void;
};

function formatDueDate(dueDate: string | Date) {
  try {
    if (typeof dueDate === "string") return dueDate;
    return new Date(dueDate).toISOString().slice(0, 10);
  } catch {
    return String(dueDate);
  }
}

export default function KanbanBoard({ board, onRefresh }: Props) {
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function onDelete(taskId: string) {
    setBusyId(taskId);
    try {
      await deleteTask(taskId);
      onRefresh?.();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  async function quickMove(task: Task, dir: -1 | 1) {
    const cols = [...board.columns].sort((a, b) => a.order - b.order);
    const currentIndex = cols.findIndex((c) => c._id === task.columnId);
    const next = cols[currentIndex + dir];
    if (!next) return;

    setBusyId(task._id);
    try {
      await updateTask(task._id, {
        columnId: next._id,
        order: 0,
      });

      onRefresh?.();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to move");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold">{board.name}</div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((col) => (
            <div key={col._id} className="min-w-[320px] max-w-90 flex-1">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">
                  {col.name}{" "}
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    ({col.tasks?.length ?? 0})
                  </span>
                </div>

                <CreateJobDialog
                  boardId={board._id}
                  columnId={col._id}
                  onCreated={onRefresh}
                  triggerLabel="+ Task"
                />
              </div>

              <div className="space-y-3 rounded-lg bg-gray-50 p-3 border">
                {(col.tasks ?? [])
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((task) => (
                    <Card key={task._id} className="shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium leading-snug truncate">
                              {task.title}
                            </div>
                            {task.subtitle ? (
                              <div className="text-xs text-gray-600 truncate">
                                {task.subtitle}
                              </div>
                            ) : null}
                          </div>

                          <Button
                            variant="ghost"
                            type="button"
                            className="h-8 px-2"
                            onClick={() => onDelete(task._id)}
                            disabled={busyId === task._id}
                            title="Delete"
                          >
                            ✕
                          </Button>
                        </div>

                        {task.labels?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((l) => (
                              <span
                                key={l}
                                className="rounded-full border bg-white px-2 py-0.5 text-[11px] text-gray-700"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            {task.priority ? (
                              <span className="rounded-md border bg-white px-2 py-1">
                                {task.priority}
                              </span>
                            ) : null}

                            {task.dueDate ? (
                              <span className="rounded-md border bg-white px-2 py-1">
                                due {formatDueDate(task.dueDate)}
                              </span>
                            ) : null}

                            {task.link ? (
                              <a
                                href={task.link}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                link
                              </a>
                            ) : null}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => quickMove(task, -1)}
                              disabled={busyId === task._id}
                              title="Move left"
                            >
                              ←
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => quickMove(task, 1)}
                              disabled={busyId === task._id}
                              title="Move right"
                            >
                              →
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {(!col.tasks || col.tasks.length === 0) && (
                  <div className="text-xs text-gray-500 py-6 text-center">
                    No tasks yet
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
