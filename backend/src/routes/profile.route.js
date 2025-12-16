import express from "express";
import * as profileController from "../controllers/profile.controller.js";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.middleware.js";

const profileRouter = express.Router();

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/avatar"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

profileRouter.get("/", verifyToken, profileController.getProfile);
profileRouter.put("/", verifyToken, profileController.updateProfile);
profileRouter.put(
  "/change-password",
  verifyToken,
  profileController.changePassword
);
profileRouter.post(
  "/avatar",
  upload.single("avatar"),
  verifyToken,
  profileController.uploadAvatar
);

export default profileRouter;
