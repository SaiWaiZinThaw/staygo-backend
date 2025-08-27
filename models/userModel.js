import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  photo_url: { type: String, required: true },
  auth_date: { type: Number, required: true },
  hash: { type: String, required: true, unique: true },
});

const userModel =
  mongoose.models.user || new mongoose.model("user", userSchema);

export default userModel;
