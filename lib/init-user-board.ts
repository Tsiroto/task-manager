import connectDB from "./db";
import { Board, Column } from "./models";

const DEFAULT_COLUMNS = [
  { name: "Backlog", order: 0 },
  { name: "To Do", order: 1 },
  { name: "Doing", order: 2 },
  { name: "Review", order: 3 },
  { name: "Done", order: 4 },
] as const;

/**
 * Creates (or returns) a default board for a user.
 * Now supports multiple boards by name.
 *
 * @param userId - required
 * @param boardName - optional, defaults to "My Tasks"
 */
export async function initializeUserBoard(userId: string, boardName = "My Tasks") {
  try {
    if (!userId) throw new Error("initializeUserBoard: missing userId");

    const name = String(boardName || "").trim();
    if (!name) throw new Error("initializeUserBoard: missing boardName");

    await connectDB();

    // 1) If it already exists, return it
    const existingBoard = await Board.findOne({ userId, name });
    if (existingBoard) return existingBoard;

    // 2) Create board
    const board = await Board.create({
      name,
      userId,
      columns: [],
    });

    // 3) Create default columns for that board
    const columns = await Column.insertMany(
      DEFAULT_COLUMNS.map((col) => ({
        name: col.name,
        order: col.order,
        boardId: board._id,
        tasks: [],
      }))
    );

    // 4) Link columns back to board
    board.columns = columns.map((c: any) => c._id);
    await board.save();

    return board;
  } catch (err) {
    console.error("[initializeUserBoard] failed", { userId, boardName, err });
    throw err;
  }
}
