import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  role: "owner" | "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
    },

    /**
     * Global app role
     */
    role: {
      type: String,
      enum: ["owner", "admin", "user"],
      default: "user",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
