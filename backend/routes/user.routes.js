import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getAllAdmins } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/admin", protectRoute, getAllAdmins);

export default router;
