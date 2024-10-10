import User from "../models/user.model.js";
import Assignment from "../models/assignment.model.js";

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find(
      { isAdmin: true },
      { password: 0 } // Exclude password
    ).select("-__v -isAdmin -createdAt -updatedAt");

    res.status(200).json(admins);
  } catch (error) {
    console.log("Error in getAllAdmins controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
