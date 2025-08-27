import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));
  await mongoose.connect("mongodb://localhost:27017/staygo");
};

export default connectDB;
