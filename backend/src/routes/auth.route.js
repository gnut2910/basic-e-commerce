import * as authController from "../controllers/auth.controller.js";
import express from "express";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

authRouter.get("/me", verifyToken, authController.getMe);

authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password/:token", authController.resetPassword);

//Admin
authRouter.get("/users", verifyAdmin, authController.getAllUsers);
authRouter.delete("/user/:id", verifyAdmin, authController.deleteUser);
authRouter.put("/user/:id", verifyAdmin, authController.editUser);
authRouter.post("/create", verifyAdmin, authController.createUserByAdmin);
export default authRouter;
