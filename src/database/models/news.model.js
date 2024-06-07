import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

schema.index({ author: 1 });
schema.index({ isPublished: 1 });

export const NewsModel = mongoose.model("News", schema);
