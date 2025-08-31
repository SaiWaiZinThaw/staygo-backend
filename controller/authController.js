import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export const login = async (req, res) => {
  const {
    telegramId,
    first_name,
    last_name,
    username,
    photo_url,
    auth_date,
    hash,
  } = req.body;

  if (
    (!telegramId,
    !first_name,
    last_name,
    !username,
    !photo_url,
    !auth_date,
    !hash)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ telegramId });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser.telegramId },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ success: true, message: `Welcome back, ${username}`, token });
    }
    const user = new userModel({
      telegramId,
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash,
    });
    await user.save();

    const token = jwt.sign({ id: user.telegramId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ success: true, message: `Welcome, ${username}`, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
