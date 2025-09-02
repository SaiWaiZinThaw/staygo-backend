import mongoose from "mongoose";
import { buildItineraryFromPlaces } from "../middlewares/tripUpdater.js";

if (mongoose.models.trip) {
  delete mongoose.models.trip;
}

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
    photo: { type: String },

    destination: {
      type: [String],
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Itinerary
    itinerary: [
      {
        date: { type: Date, required: true },
        places: [
          {
            name: { type: String, required: true },
            address: { type: String },
            category: { type: String },
            visited: { type: Boolean, default: false },
            date: { type: Date, default: Date.now },
            startTime: { type: String },
            endTime: { type: String },
            cost: {
              amount: { type: Number, default: 0 },
              currency: { type: String, default: "MMK" },
            },
            link: { type: String },
            notes: { type: String },
          },
        ],
      },
    ],

    // Places
    places: [
      new mongoose.Schema({
        name: { type: String, required: true },
        address: { type: String },
        category: { type: String },
        visited: { type: Boolean, default: false },
        date: { type: Date, default: Date.now },
        startTime: { type: String },
        endTime: { type: String },
        cost: {
          amount: { type: Number, default: 0 },
          currency: { type: String, default: "MMK" },
        },
        link: { type: String },
        notes: { type: String },
      }),
    ],

    budget: {
      total: { type: Number, default: 0 },
      currency: { type: String, default: "MMK" },
      expenses: [
        {
          name: { type: String, required: true },
          category: { type: String, required: true },
          amount: { type: Number, required: true },
          currency: { type: String, default: "MMK" },
          date: { type: Date, default: Date.now },
          notes: { type: String },
        },
      ],
    },

    bookings: [
      {
        type: {
          type: String,
          enum: ["flight", "hotel", "event", "rental", "dinning"],
          required: true,
        },
        title: { type: String, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        cost: {
          amount: { type: Number, default: 0 },
          currency: { type: String, default: "MMK" },
        },
        details: { type: String },
        confirmed: { type: Boolean, default: true },
      },
    ],

    notes: [
      {
        text: { type: String, required: true },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    telegramChatId: { type: String },
    telegramMessageId: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔹 Hook: keep itinerary in sync with places
tripSchema.pre("save", function (next) {
  if (this.isModified("places")) {
    this.itinerary = buildItineraryFromPlaces(this.places);
  }
  next();
});

export const tripModel =
  mongoose.models.trip || new mongoose.model("trip", tripSchema);
