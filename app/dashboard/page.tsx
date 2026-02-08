import { Suspense } from "react";
import { redirect } from "next/navigation";

import KanbanBoard from "@/components/kanban-board";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { getBoard as getBoardById } from "@/lib/actions/tasks";
import { initializeUserBoard } from "@/lib/init-user-board";

async function getOrCreateMyTasksBoardId(userId: string): Promise<string> {
  await connectDB();

  const existing = await Board.findOne({ userId, name: "My Tasks" })
    .select("_id")
    .lean();

  if (existing?._id) return String(existing._id);

  const created = await initializeUserBoard(userId);
  return String(created._id);
}

async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const boardId = await getOrCreateMyTasksBoardId(session.user.id);
  const board = await getBoardById(boardId);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Task Management</h1>
          <p className="text-gray-600">My Tasks</p>
        </div>

        <KanbanBoard board={board} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardPage />
    </Suspense>
  );
}
