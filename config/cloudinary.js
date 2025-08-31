import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
configDotenv({ path: "../.env" });
cloudinary.config({
  cloud_name: "dfzsumaxt",
  api_key: "618522279595966",
  api_secret: "dbVMx2b8rtq_2vtj8rJ9ghmn6-4",
  secure: true,
});

export default cloudinary;
