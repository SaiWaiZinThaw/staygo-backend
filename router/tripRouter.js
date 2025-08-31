import { userAuth } from "../middlewares/userAuth.js";
import express from "express";
import {
  createTrip,
  getATrip,
  getAllTrips,
} from "../controller/tripController.js";
import upload from "../middlewares/multer.js";

export const tripRouter = express.Router();

tripRouter.post("/create", upload.single("photo"), userAuth, createTrip);
tripRouter.get("/", userAuth, getAllTrips);
tripRouter.get("/:tripId", userAuth, getATrip);
