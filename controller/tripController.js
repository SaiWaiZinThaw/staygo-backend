import cloudinary from "../config/cloudinary.js";
import { tripModel } from "../models/tripModel.js";
import userModel from "../models/userModel.js";

export const createTrip = async (req, res) => {
  const { title, destination, startDate, endDate } = req.body;
  const { telegramId } = req;
  const user = await userModel.findOne({ telegramId });

  if (!telegramId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }
  if (!title || !destination || !startDate || !endDate) {
    res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  let destinationArray;

  try {
    // Try parsing as JSON (if sent as JSON string)
    destinationArray = JSON.parse(destination);
  } catch (err) {
    // If not valid JSON, try splitting by comma
    destinationArray = destination.split(",").map((d) => d.trim());
  }

  // Validate it's now an array and not empty
  if (!Array.isArray(destinationArray) || destinationArray.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Destination must be a non-empty array of strings",
    });
  }

  // Optional: Validate each item is a string
  if (!destinationArray.every((d) => typeof d === "string" && d.length > 0)) {
    return res.status(400).json({
      success: false,
      message: "All destinations must be non-empty strings",
    });
  }

  // ✅ Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format",
    });
  }

  if (start > end) {
    return res.status(400).json({
      success: false,
      message: "Start date cannot be after end date",
    });
  }

  let imageUrl = null;

  // Upload photo to Cloudinary if provided
  if (req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "staygo/trips", resource_type: "image" },
          (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          }
        );
        uploadStream.end(req.file.buffer); // ✅ Use buffer, not path
      });

      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({
        success: false,
        message: `Image upload failed: ${error.message}`,
      });
    }
  }

  try {
    const trip = new tripModel({
      creator: user.telegramId,
      participants: [user.telegramId],
      title,
      destination,
      startDate: start,
      endDate: end,
      photo: imageUrl,
    });
    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip created successfully",
      trip: trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);

    // Handle common Mongoose errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTrip = async (req, res) => {
  const { tripId } = req.params;
  const { telegramId } = req;
  const { places } = req.body;
  console.log(places);
  // Authentication
  if (!telegramId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }

  if (!tripId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: tripId",
    });
  }

  let placesArray;

  try {
    placesArray = JSON.parse(places);
  } catch (err) {
    placesArray = places.split(",").map((d) => d.trim());
  }

  if (!Array.isArray(placesArray) || placesArray.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Places must be a non-empty array of strings",
    });
  }

  if (
    !placesArray.every(
      (p) =>
        p &&
        typeof p === "object" &&
        p.name &&
        typeof p.name === "string" &&
        p.name.trim() !== ""
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Each place must be an object with a non-empty 'name' string",
    });
  }

  try {
    const trip = await tripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Authorization: Only creator or participant can update?
    // Adjust based on your business logic
    if (
      trip.creator !== telegramId &&
      !trip.participants.includes(telegramId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to edit this trip",
      });
    }

    // Convert strings into proper place objects
    // If input is an array of place objects, keep them as is
    const newPlaces = placesArray.map((p) => ({
      ...p,
      date: p.date ? new Date(p.date) : new Date(),
    }));

    // ✅ Correct way: Update `places` array by pushing new entries
    trip.places.push(...newPlaces);
    trip.updatedAt = Date.now(); // Ensure timestamp updates

    // Save the updated document
    const updatedTrip = await trip.save();

    return res.status(200).json({
      success: true,
      message: "Places added successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Update trip error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getATrip = async (req, res) => {
  const { tripId } = req.params;
  const { telegramId } = req;

  if (!telegramId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }
  if (!tripId) {
    res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const trip = await tripModel.findById(tripId);
    if (
      trip.creator.toString() !== telegramId &&
      !trip.participants.includes(telegramId)
    ) {
      return res.status(404).json({
        success: true,
        message: "Trip Not found",
      });
    }
    if (!trip) {
      return res.status(404).json({
        success: true,
        message: "Trip not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Trip retrieved successfully",
      trip: trip,
    });
  } catch (error) {
    console.error("Get trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllTrips = async (req, res) => {
  const { telegramId } = req;

  if (!telegramId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }

  try {
    const trips = await tripModel.find({
      participants: telegramId,
      creator: telegramId,
    });

    if (trips.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No trips found",
        trips: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Trip retrieved successfully",
      trips: trips,
    });
  } catch (error) {
    console.error("Get trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchTrip = async (req, res) => {};
