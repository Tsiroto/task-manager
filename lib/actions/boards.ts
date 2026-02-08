"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Board, Column, Task } from "@/lib/models";
import { initializeUserBoard } from "@/lib/init-user-board";

export type BoardScope = "my" | "all";

function buildNameFilter(q?: string) {
  const query = (q ?? "").trim();
  if (!query) return null;
  return { name: { $regex: query, $options: "i" } };
}

/**
 * scope="my": only boards owned by me
 * scope="all": my boards + all public boards from everyone
 */
export async function listBoardsForUser({
  userId,
  scope,
  q,
}: {
  userId: string;
  scope: BoardScope;
  q?: string;
}) {
  await connectDB();

  const nameFilter = buildNameFilter(q);

  const base =
    scope === "my"
      ? { userId }
      : {
          $or: [
            { userId }, // my boards (private + public)
            { isPrivate: false }, // public boards from anyone
          ],
        };

  const filter = nameFilter ? { $and: [base, nameFilter] } : base;

  const boards = await Board.find(filter)
    .select("_id name userId isPrivate updatedAt createdAt")
    .sort({ updatedAt: -1 })
    .lean();

  return boards.map((b: any) => ({
    _id: String(b._id),
    name: b.name as string,
    userId: b.userId as string,
    isPrivate: !!b.isPrivate,
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
    isMine: b.userId === userId,
  }));
}

export async function createBoardAction(formData: FormData, userId: string) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Board name is required");

  // Create board + default columns, private by default.
  const board = await initializeUserBoard(userId, name);

  // Ensure it’s private by default even if initializeUserBoard doesn't set it
  await connectDB();
  await Board.updateOne({ _id: board._id, userId }, { $set: { isPrivate: true } });

  revalidatePath("/boards");
}

export async function renameBoardAction(formData: FormData, userId: string) {
  const boardId = String(formData.get("boardId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!boardId || !name) throw new Error("Invalid request");

  await connectDB();

  const board = await Board.findOne({ _id: boardId, userId });
  if (!board) throw new Error("Board not found");

  board.name = name;
  await board.save();

  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
}

export async function toggleBoardPrivacyAction(formData: FormData, userId: string) {
  const boardId = String(formData.get("boardId") || "").trim();
  const makePrivate = String(formData.get("isPrivate") || "") === "true";

  if (!boardId) throw new Error("Invalid request");

  await connectDB();

  const board = await Board.findOne({ _id: boardId, userId });
  if (!board) throw new Error("Board not found");

  board.isPrivate = makePrivate;
  await board.save();

  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
}

export async function deleteBoardAction(formData: FormData, userId: string) {
  const boardId = String(formData.get("boardId") || "").trim();
  if (!boardId) throw new Error("Invalid request");

  await connectDB();

  const board = await Board.findOne({ _id: boardId, userId }).lean();
  if (!board) throw new Error("Board not found");

  await Task.deleteMany({ boardId });
  await Column.deleteMany({ boardId });
  await Board.deleteOne({ _id: boardId, userId });

  revalidatePath("/boards");
}
