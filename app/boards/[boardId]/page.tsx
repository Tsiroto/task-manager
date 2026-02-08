import { Suspense } from "react";
import { redirect } from "next/navigation";

import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { getBoard as getBoardById } from "@/lib/actions/tasks";

type Props = {
  params: { boardId: string };
};

async function BoardPageInner({ params }: Props) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const { boardId } = params;

  await connectDB();

  const boardMeta = await Board.findById(boardId)
    .select("_id userId isPrivate")
    .lean();

  if (!boardMeta?._id) redirect("/boards");

  const isOwner = String(boardMeta.userId) === String(userId);
  const isPublic = boardMeta.isPrivate === false;

  if (!isOwner && !isPublic) redirect("/boards");

  const board = await getBoardById(boardId);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <KanbanBoard board={board} />
      </div>
    </div>
  );
}

export default function BoardPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BoardPageInner {...props} />
    </Suspense>
  );
}
