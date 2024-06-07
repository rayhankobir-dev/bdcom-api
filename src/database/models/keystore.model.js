import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    client: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    primaryKey: { type: String, required: true, trim: true },
    secondaryKey: { type: String, required: true, trim: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const KeystoreModel = mongoose.model("Keystore", schema);
