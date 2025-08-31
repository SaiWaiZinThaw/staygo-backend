import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
});

export const categoryModel =
  mongoose.models.category || new mongoose.model("category", categorySchema);

const statusSchema = new mongoose.shcema({
  name: String,
});

export const statusModel =
  mongoose.models.status || new mongoose.model("status", statusSchema);
