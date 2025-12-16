import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const dashBoardRouter = express.Router();

dashBoardRouter.get("/overview", verifyAdmin, dashboardController.overview);

export default dashBoardRouter;
