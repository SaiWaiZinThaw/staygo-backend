import mongoose from "mongoose";
import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./router/authRouter.js";
import cookieParser from "cookie-parser";
dotenv.config({ path: "./.env" });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({}));
const port = process.env.API_PORT || 3000;
connectDB();

app.get("/", (req, res) => {
  res.send("It worked");
});

app.use("/api", authRouter);

app.listen(port, (port) => console.log("Backend server running on", port));
