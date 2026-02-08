"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Board, Column, Task } from "@/lib/models";
import { getSession } from "@/lib/auth/auth";
import mongoose from "mongoose";

function serializeTask(t: any) {
  return {
    ...t,
    _id: String(t._id),
    boardId: String(t.boardId),
    columnId: String(t.columnId),

    // IMPORTANT: stringify any nested ObjectIds if your schema ever includes them later
    userId: t.userId != null ? String(t.userId) : undefined,

    // Dates
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : undefined,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : undefined,
  };
}

function requireObjectId(id: string, label: string) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}: ${id}`);
  }
}

function normalizeLabels(input?: string[] | string) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : input.split(",");
  return arr.map((s) => s.trim()).filter(Boolean).slice(0, 20);
}

type Priority = "low" | "medium" | "high";

export async function getBoard(boardId: string) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  requireObjectId(boardId, "boardId");
  await connectDB();

  const board = await Board.findOne({ _id: boardId, userId }).lean();
  if (!board) throw new Error("Board not found");

  const columns = await Column.find({ boardId: board._id }).sort({ order: 1 }).lean();
  const columnIds = columns.map((c) => c._id);

  const tasks = await Task.find({ boardId: board._id, columnId: { $in: columnIds } })
    .sort({ order: 1 })
    .lean();

  const tasksByColumn = new Map<string, any[]>();
  for (const t of tasks) {
    const key = String(t.columnId);
    if (!tasksByColumn.has(key)) tasksByColumn.set(key, []);
    tasksByColumn.get(key)!.push(t);
  }

  return {
    ...board,
    _id: String(board._id),
    userId: String((board as any).userId),
    columns: columns.map((c) => ({
      ...c,
      _id: String(c._id),
      boardId: String((c as any).boardId),
      tasks: (tasksByColumn.get(String(c._id)) ?? []).map((t) => serializeTask(t)),
    })),
  };
}

export async function createTask(input: {
  boardId: string;
  columnId: string;
  title: string;
  subtitle?: string;
  link?: string;
  labels?: string[] | string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
}) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  requireObjectId(input.boardId, "boardId");
  requireObjectId(input.columnId, "columnId");
  if (!input.title?.trim()) throw new Error("Title is required");

  await connectDB();

  const board = await Board.findOne({ _id: input.boardId, userId });
  if (!board) throw new Error("Board not found");

  const column = await Column.findOne({ _id: input.columnId, boardId: board._id });
  if (!column) throw new Error("Column not found");

  const last = await Task.findOne({ boardId: board._id, columnId: column._id })
    .sort({ order: -1 })
    .lean();

  const nextOrder = (last?.order ?? -100) + 100;

  const created = await Task.create({
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    link: input.link?.trim() || undefined,
    labels: normalizeLabels(input.labels),
    description: input.description?.trim() || undefined,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    priority: input.priority,

    boardId: board._id,
    columnId: column._id,
    userId,
    order: nextOrder,
  });

  await Column.updateOne({ _id: column._id }, { $addToSet: { tasks: created._id } });

  revalidatePath("/dashboard");

  // Convert to plain object and serialize IDs/Dates
  const plain = created.toObject({ getters: false, virtuals: false });
  return serializeTask(plain);
}

export async function updateTask(
  taskId: string,
  patch: Partial<{
    title: string;
    subtitle: string;
    link: string;
    labels: string[] | string;
    description: string;
    dueDate: string;
    priority: Priority;
    columnId: string;
    order: number;
  }>
) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  requireObjectId(taskId, "taskId");
  await connectDB();

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new Error("Task not found");

  if (typeof patch.columnId === "string") {
    requireObjectId(patch.columnId, "columnId");

    if (String(task.columnId) !== String(patch.columnId)) {
      await Column.updateOne({ _id: task.columnId }, { $pull: { tasks: task._id } });
      await Column.updateOne({ _id: patch.columnId }, { $addToSet: { tasks: task._id } });
      task.columnId = new mongoose.Types.ObjectId(patch.columnId);
    }
  }

  if (typeof patch.order === "number") {
    task.order = Math.max(0, patch.order) * 100;
  }

  if (typeof patch.title === "string") task.title = patch.title.trim();
  if (typeof patch.subtitle === "string") task.subtitle = patch.subtitle.trim() || undefined;
  if (typeof patch.link === "string") task.link = patch.link.trim() || undefined;
  if (typeof patch.description === "string") task.description = patch.description.trim() || undefined;
  if (typeof patch.labels !== "undefined") task.labels = normalizeLabels(patch.labels);
  if (typeof patch.priority !== "undefined") task.priority = patch.priority;
  if (typeof patch.dueDate !== "undefined") task.dueDate = patch.dueDate ? new Date(patch.dueDate) : undefined;

  await task.save();

  revalidatePath("/dashboard");

  const plain = task.toObject({ getters: false, virtuals: false });
  return serializeTask(plain);
}

export async function deleteTask(taskId: string) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  requireObjectId(taskId, "taskId");
  await connectDB();

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new Error("Task not found");

  await Column.updateOne({ _id: task.columnId }, { $pull: { tasks: task._id } });
  await Task.deleteOne({ _id: task._id });

  revalidatePath("/dashboard");
  return { ok: true };
}
