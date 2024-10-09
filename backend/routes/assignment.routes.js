import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  acceptAssignment,
  createAssignment,
  deleteAssignment,
  getAssignments,
  rejectAssignment,
  updateAssignment,
} from "../controllers/assignment.controller.js";

const router = express.Router();

router.get("/", protectRoute, getAssignments);
router.post("/create", protectRoute, createAssignment);
router.post("/update/:id", protectRoute, updateAssignment);
router.post("/delete/:id", protectRoute, deleteAssignment);
router.post("/accept/:id", protectRoute, acceptAssignment);
router.post("/reject/:id", protectRoute, rejectAssignment);

export default router;
