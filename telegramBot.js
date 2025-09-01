import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { tripModel } from "./models/tripModel.js";
import userModel from "./models/userModel.js";
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

bot.onText(/\/mytrips/, async (msg) => {
  const telegramId = msg.from.id;
  const trips = await tripModel.find({
    $or: [{ creator: telegramId }, { participants: telegramId }],
  });

  if (trips.length === 0) {
    return bot.sendMessage(msg.chat.id, "📭 No trips found.");
  }

  trips.forEach((t) => {
    bot.sendMessage(
      msg.chat.id,
      `🎯 ${t.title} (${t.startDate} → ${t.endDate})`
    );
    if (t.photo) {
      bot.sendPhoto(msg.chat.id, t.photo);
    }
  });
});

const tripCreationState = {};

bot.onText(/\/newtrip/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Start trip creation flow
  tripCreationState[chatId] = {
    step: "waiting_for_title",
    creator: userId,
    participants: [userId],
  };

  bot.sendMessage(chatId, "🔤 Enter the trip name:");
});

// Handle all text messages during trip creation
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip if not in trip creation flow
  if (!tripCreationState[chatId]) return;

  const state = tripCreationState[chatId];

  try {
    if (state.step === "waiting_for_title") {
      state.title = text;
      state.step = "waiting_for_destination";
      bot.sendMessage(
        chatId,
        "🌍 Enter destinations (comma-separated): Paris, Berlin, Rome"
      );
    } else if (state.step === "waiting_for_destination") {
      const destinations = text
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);
      if (destinations.length === 0) {
        return bot.sendMessage(
          chatId,
          "❌ Please enter at least one destination."
        );
      }
      state.destination = destinations;
      state.step = "waiting_for_start_date";
      bot.sendMessage(chatId, "📅 Enter start date (YYYY-MM-DD):");
    } else if (state.step === "waiting_for_start_date") {
      const date = new Date(text);
      if (isNaN(date.getTime())) {
        return bot.sendMessage(chatId, "❌ Invalid date. Use YYYY-MM-DD");
      }
      state.startDate = text;
      state.step = "waiting_for_end_date";
      bot.sendMessage(chatId, "🔚 Enter end date (YYYY-MM-DD)");
    } else if (state.step === "waiting_for_end_date") {
      const date = new Date(text);
      if (isNaN(date.getTime())) {
        return bot.sendMessage(chatId, "❌ Invalid date. Use YYYY-MM-DD");
      }
      state.endDate = text;

      // ✅ All data collected — create trip
      await createTripInDatabase(state);
      delete tripCreationState[chatId]; // End state

      bot.sendMessage(chatId, `✅ Trip "${state.title}" created successfully!`);
    }
  } catch (err) {
    console.error("Trip creation error:", err);
    bot.sendMessage(chatId, "❌ Something went wrong. Please try again.");
    delete tripCreationState[chatId];
  }
});

bot.onText(/\/format/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(msg.chat.id, "<b>Format</b> /n hi", {
    parse_mode: "HTML",
  });
});

bot.on("message", (msg) => {
  if (msg.text === "hi") {
    bot.sendVideo(
      msg.chat.id,
      "https://streamtape.com/v/zDvVwvDBGbuGZw/%28_BMT_%29_Oh_My_Ghost_Clients_%282025%29_Ep_10_-_720p_End.mp4"
    );
  }
});

// Dummy function — replace with your API call
async function createTripInDatabase(tripData) {
  const trip = new tripModel(tripData);
  await trip.save();
}
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
