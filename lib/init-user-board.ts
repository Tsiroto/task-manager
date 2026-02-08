import connectDB from "./db";
import { Board, Column } from "./models";

const DEFAULT_COLUMNS = [
  { name: "Backlog", order: 0 },
  { name: "To Do", order: 1 },
  { name: "Doing", order: 2 },
  { name: "Review", order: 3 },
  { name: "Done", order: 4 },
];

export async function initializeUserBoard(userId: string) {
  try {
    if (!userId) throw new Error("initializeUserBoard: missing userId");

    await connectDB();

    const existingBoard = await Board.findOne({ userId, name: "My Tasks" });
    if (existingBoard) return existingBoard;

    const board = await Board.create({
      name: "My Tasks",
      userId,
      columns: [],
    });

    const columns = await Promise.all(
      DEFAULT_COLUMNS.map((col) =>
        Column.create({
          name: col.name,
          order: col.order,
          boardId: board._id,
          tasks: [],
        })
      )
    );

    board.columns = columns.map((c) => c._id);
    await board.save();

    return board;
  } catch (err) {
    console.error("[initializeUserBoard] failed", { userId, err });
    throw err;
  }
}