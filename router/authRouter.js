import express from "express";
import { login, logout } from "../controller/authController.js";
import { getLoggedInUser } from "../controller/userController.js";
import { userAuth } from "../middlewares/userAuth.js";

export const authRouter = express.Router();

authRouter.post("/auth/telegram", login);
authRouter.post("/logout", logout);
authRouter.get("/me", userAuth, getLoggedInUser);
