import mongoose from "mongoose";

const placeCategorySchema = new mongoose.Schema({
  name: String,
});

export const placeCategoryModel =
  mongoose.models.placeCategory ||
  new mongoose.model("placeCategory", placeCategorySchema);

const expenseCategorySchema = new mongoose.Schema({
  name: String,
});

export const expenseCategoryModel =
  mongoose.models.expenseCategory ||
  new mongoose.model("expenseCategory", expenseCategorySchema);

const tripStatusSchema = new mongoose.shcema({
  name: String,
});

export const tripStatusModel =
  mongoose.models.tripStatus ||
  new mongoose.model("tripStatus", tripStatusSchema);
