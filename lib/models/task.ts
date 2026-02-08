import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  subtitle?: string;
  link?: string;
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  userId: string;
  order: number;
  labels?: string[];
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    link: { type: String },

    columnId: { type: Schema.Types.ObjectId, ref: "Column", required: true, index: true },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    userId: { type: String, required: true, index: true },

    order: { type: Number, required: true, default: 0 },

    labels: [{ type: String }],
    description: { type: String },

    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"] },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);