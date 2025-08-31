import mongoose from "mongoose";
const tripSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: String,
        ref: "User",
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    photo: { type: String, required: false },

    destination: {
      type: [String], // Array of destination names
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    // Date range
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Itinerary: Array of days/events
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        activities: [
          {
            time: String, // e.g., "10:00 AM"
            title: String,
            location: String,
            description: String,
          },
        ],
      },
    ],

    // List of places to visit
    places: [
      {
        name: { type: String, required: true },
        address: { type: String },
        category: { type: String }, // e.g., "Museum", "Restaurant"
        visited: { type: Boolean, default: false },
        notes: { type: String },
      },
    ],

    // Budget details
    budget: {
      total: { type: Number, default: 0 },
      currency: { type: String, default: "MMK" },
      expenses: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
          category: { type: String, required: true },
          currency: { type: String, default: "MMK" },
          category: { type: String },
          date: { type: Date, default: Date.now },
          place: { type: String },
          paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },

    // Bookings (flights, hotels, etc.)
    bookings: [
      {
        type: {
          type: String,
          enum: ["flight", "hotel", "event", "rental"],
          required: true,
        },
        title: { type: String, required: true },
        provider: { type: String },
        bookingRef: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        cost: { type: Number },
        currency: { type: String },
        details: { type: String },
        confirmed: { type: Boolean, default: true },
      },
    ],

    // Notes (collaborative notes)
    notes: [
      {
        text: { type: String, required: true },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Telegram integration: link to a Telegram group/chat
    telegramChatId: {
      type: String,
      required: false, // optional
    },
    telegramMessageId: {
      type: String,
      required: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

export const tripModel =
  mongoose.models.trip || new mongoose.model("trip", tripSchema);
