import express from "express";
import { login, logout } from "../controller/userController.js";

export const authRouter = express.Router();

authRouter.post("/auth/telegram", login);
authRouter.post("/logout", logout);
