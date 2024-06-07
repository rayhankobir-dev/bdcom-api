import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 200 },
    email: {
      type: String,
      required: true,
      unique: true,
      default: false,
      trim: true,
      select: false,
    },
    password: { type: String, required: true, select: false },
    roles: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Role",
        },
      ],
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

schema.index({ email: 1, status: 1 });
schema.index({ _id: 1, email: 1 });
schema.index({ _id: 1, status: 1 });

export const UserModel = mongoose.model("User", schema);
