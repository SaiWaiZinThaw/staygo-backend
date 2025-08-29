import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: false },
  username: { type: String, required: false },
  photo_url: { type: String, required: false },
  auth_date: { type: Number, required: true },
  hash: { type: String, required: true, unique: true },
});

const userModel =
  mongoose.models.user || new mongoose.model("user", userSchema);

export default userModel;
