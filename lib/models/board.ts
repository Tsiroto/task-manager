import mongoose, { Schema, Document } from "mongoose";

export interface IBoard extends Document {
  name: string;
  userId: string;

  /**
   * Privacy flag
   * - true  → visible only to owner (for now)
   * - false → visible to all signed-in users
   */
  isPrivate: boolean;

  columns: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * Board visibility
     * Default: private (safe default)
     */
    isPrivate: {
      type: Boolean,
      default: true,
      index: true,
    },

    columns: [
      {
        type: Schema.Types.ObjectId,
        ref: "Column",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in dev / hot reload
export default mongoose.models.Board ||
  mongoose.model<IBoard>("Board", BoardSchema);
