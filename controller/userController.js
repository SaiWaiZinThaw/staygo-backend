import userModel from "../models/userModel.js";
import { checkPrivateImg } from "../telegramBot.js";

export const getLoggedInUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await userModel.findById(userId);
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.name,
        photo_url: user.photo_url,
        privatePhoto: await checkPrivateImg(user.telegramId),
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
