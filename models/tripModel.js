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
        category: {
          type: String,
          required: true,
          enums: ["Food", "Stay", "Sights", "Transport", "Other"],
        },
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
      amount: { type: Number, default: 0 },
      budgetCurrency: { type: String, default: "MMK" },
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
          enum: ["Flight", "Hotel", "Event", "Rental", "Dinning"],
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

tripSchema.pre("save", function (next) {
  if (this.isModified("places")) {
    // Build itinerary from places
    this.itinerary = buildItineraryFromPlaces(this.places);

    // Build budget from places
    this.budget.expenses = [
      ...this.budget.expenses, // keep existing manual expenses
      ...this.places.map((place) => ({
        name: place.name || this.title,
        category: place.category || "Other",
        amount: place.cost?.amount || 0,
        currency: place.cost?.currency || "MMK",
        date: place.date || new Date(),
        notes: place.notes || "",
      })),
    ];

    // Auto-update total
    this.budget.total = this.budget.expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );
  }

  next();
});

export const tripModel =
  mongoose.models.trip || new mongoose.model("trip", tripSchema);
