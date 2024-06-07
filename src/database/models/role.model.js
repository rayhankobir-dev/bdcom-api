import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    status: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: {
      createdAt: { type: Date, default: Date.now, select: false },
      updatedAt: { type: Date, default: Date.now, select: false },
    },
  }
);

schema.index({ code: 1 });

export const RoleModel = mongoose.model("Role", schema);
