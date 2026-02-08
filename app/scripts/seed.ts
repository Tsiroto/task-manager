import connectDB from "@/lib/db";
import { Board, Column, Task } from "@/lib/models";

async function seed() {
  await connectDB();

  const userId = process.env.SEED_USER_ID || "chiroto";

  await Task.deleteMany({ userId });
  await Column.deleteMany({ userId } as any);
  await Board.deleteMany({ userId });

  const board = await Board.create({
    name: "My Tasks",
    userId,
    columns: [],
  });

  const columnsData = [
    { name: "Backlog", order: 0 },
    { name: "To Do", order: 1 },
    { name: "Doing", order: 2 },
    { name: "Review", order: 3 },
    { name: "Done", order: 4 },
  ];

  const columns = await Promise.all(
    columnsData.map((c) =>
      Column.create({
        name: c.name,
        order: c.order,
        boardId: board._id,
        tasks: [],
      })
    )
  );

  board.columns = columns.map((c) => c._id);
  await board.save();

  const col = (name: string) => {
    const found = columns.find((c) => c.name === name);
    if (!found) throw new Error(`Missing column: ${name}`);
    return found;
  };

  const sample = [
    {
      column: "Backlog",
      title: "Plan Q1 roadmap",
      labels: ["planning", "team"],
      priority: "medium",
      order: 0,
    },
    {
      column: "Backlog",
      title: "Define MVP for “Trello+”",
      subtitle: "Boards → Columns → Cards + auth",
      labels: ["product"],
      priority: "high",
      order: 1,
    },
    {
      column: "To Do",
      title: "Create task dialog UI",
      labels: ["frontend"],
      priority: "medium",
      dueDate: new Date(Date.now() + 7 * 86400000),
      order: 0,
    },
    {
      column: "Doing",
      title: "Refactor server actions to tasks.ts",
      labels: ["backend"],
      priority: "high",
      order: 0,
    },
    {
      column: "Review",
      title: "QA: moving tasks across columns",
      labels: ["qa"],
      priority: "medium",
      order: 0,
    },
    {
      column: "Done",
      title: "Rename UI copy from Job Hunt → Task Manager",
      labels: ["cleanup"],
      priority: "low",
      order: 0,
    },
  ] as const;

  for (const t of sample) {
    const columnDoc = col(t.column);
    const created = await Task.create({
      title: t.title,
      subtitle: (t as any).subtitle,
      labels: t.labels,
      priority: t.priority,
      dueDate: (t as any).dueDate,
      order: t.order,
      boardId: board._id,
      columnId: columnDoc._id,
      userId,
    });

    await Column.updateOne(
      { _id: columnDoc._id },
      { $push: { tasks: created._id } }
    );
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed", e);
  process.exit(1);
});
