import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
const token = "8302880429:AAH6yKKUm269dnAFTuL8qja1BcWFY_62mRQ"; // Replace with your bot token
const DEFAULT_AVATAR_URL = "https://i.imgur.com/eSiF3Sx.jpeg"; // Your default avatar

const bot = new TelegramBot(token, { polling: true });

// Listen for /avatar command
bot.onText(/\/avatar/, async (msg) => {
  const userId = 2063258935;
  const chatId = msg.chat.id;

  try {
    // Step 1: Get user's profile photos
    const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

    if (photos.total_count === 0) {
      // No profile photo set
      await bot.sendPhoto(chatId, DEFAULT_AVATAR_URL, {
        caption: "You don't have a profile photo. Here's a default one!",
      });
      return;
    }

    // Step 2: Get the largest photo (last size in the array)
    const photo = photos.photos[0];
    const fileId = photo[0].file_id; // Highest resolution

    // Step 3: Get file path via getFile
    const file = await bot.getFile(fileId);
    console.log(file);
    const filePath = file.file_path;

    // Step 4: Construct direct file URL
    const telegramFileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // Step 5: Check if the file is accessible (not blocked by privacy)
    const headResponse = await axios.head(telegramFileUrl);
    console.log(headResponse);

    if (headResponse.status === 200) {
      console.log(headResponse.status);
      // File is accessible — send real photo
      await bot.sendPhoto(chatId, telegramFileUrl, {
        caption: "Here's your profile photo!",
      });
    } else {
      // Not reachable — likely private
      throw new Error("File not accessible");
    }
  } catch (error) {
    console.error("Error fetching photo:", error.message);

    // Fallback: send default avatar
    await bot.sendPhoto(chatId, DEFAULT_AVATAR_URL, {
      caption:
        "Your photo is private or not accessible. Here's a default avatar!",
    });
  }
});

export const checkPrivateImg = async (id) => {
  if (!bot) {
    return true;
  }

  try {
    const photos = await bot.getUserProfilePhotos(id, { limit: 1 });

    if (photos.total_count === 0) {
      return true;
    }

    const photo = photos.photos[0];
    const fileId = photo[photo.length - 1].file_id;

    const file = await bot.getFile(fileId);

    return false;
  } catch (error) {
    return true;
  }
};
