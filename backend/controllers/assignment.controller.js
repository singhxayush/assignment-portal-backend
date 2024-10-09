import User from "../models/user.model.js";
import Assignment from "../models/assignment.model.js";

// Create new assignment
export const createAssignment = async (req, res) => {
  try {
    const { task, assignedAdmins } = req.body; // assignedAdmins will now be array of usernames
    const userId = req.user._id; // From auth middleware

    // Check if user is not an admin
    const user = await User.findById(userId);
    if (user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Admins cannot create assignments" });
    }

    // Verify all assigned users exist and are admins
    const admins = await User.find({
      username: { $in: assignedAdmins },
      isAdmin: true,
    });

    if (admins.length !== assignedAdmins.length) {
      return res.status(400).json({
        error:
          "One or more admin usernames are invalid or users are not admins",
      });
    }

    // Get admin IDs from the found admin documents
    const adminIds = admins.map((admin) => admin._id);

    const newAssignment = new Assignment({
      userId,
      task,
      assignedAdmins: adminIds, // Store the admin IDs in the assignment
    });

    await newAssignment.save();

    // Populate user and admin details before sending response
    const populatedAssignment = await Assignment.findById(newAssignment._id)
      .populate("userId", "fullName username")
      .select("-__v -updatedAt")
      .populate("assignedAdmins", "fullName username");

    res.status(201).json(populatedAssignment);
  } catch (error) {
    console.log("Error in createAssignment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update existing assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user._id;
    const { task, assignedAdmins } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this assignment" });
    }

    // check if the new assigned admins are valid admins
    // if the assignedAdmins array is provided
    let adminIds = [];
    if (assignedAdmins && assignedAdmins.length > 0) {
      const admins = await User.find({
        username: { $in: assignedAdmins },
        isAdmin: true,
      });

      if (admins.length !== assignedAdmins.length) {
        return res.status(400).json({
          error:
            "One or more admin usernames are invalid or users are not admins",
        });
      }

      adminIds = admins.map((admin) => admin._id);
    }

    assignment.task = task || assignment.task;
    if (adminIds.length > 0) {
      assignment.assignedAdmins = adminIds;
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate("userId", "fullName username")
      .select("-__v")
      .populate("assignedAdmins", "fullName username");

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.log("Error in updateAssignment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete assignment (only creator can delete)
export const deleteAssignment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user._id; // From auth middleware

    // Find the assignment by ID
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the user is the creator of the assignment
    if (assignment.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this assignment" });
    }

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAssignment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get assignments based on user role
export const getAssignments = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    let assignments;

    if (user.isAdmin) {
      // admin -> get assignments assigned to them
      assignments = await Assignment.find({
        assignedAdmins: userId,
      })
        .populate("userId", "fullName username")
        .select("-__v -isAdmin -updatedAt -assignedAdmins")
        .sort({ createdAt: -1 });
    } else {
      // regular user -> get their submitted assignments
      assignments = await Assignment.find({
        userId: userId,
      })
        .populate("assignedAdmins", "fullName username")
        .select("-__v -isAdmin -updatedAt")
        .sort({ createdAt: -1 }); // Latest first
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.log("Error in getAssignments controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept assignment (admin only)
export const acceptAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { feedback } = req.body;

    // Verify user is admin and assigned to this assignment
    const assignment = await Assignment.findOne({
      _id: id,
      assignedAdmins: adminId,
    });

    if (!assignment) {
      return res.status(404).json({
        error: "Assignment not found or you're not authorized",
      });
    }

    assignment.status = "accepted";
    if (feedback) {
      assignment.feedback = feedback;
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(id)
      .populate("userId", "fullName username")
      .populate("assignedAdmins", "fullName username");

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.log("Error in acceptAssignment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject assignment (admin only)
export const rejectAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { feedback } = req.body;

    // Verify user is admin and assigned to this assignment
    const assignment = await Assignment.findOne({
      _id: id,
      assignedAdmins: adminId,
    });

    if (!assignment) {
      return res.status(404).json({
        error: "Assignment not found or you're not authorized",
      });
    }

    // Require feedback for rejected assignments
    if (!feedback) {
      return res.status(400).json({
        error: "Feedback is required when rejecting an assignment",
      });
    }

    assignment.status = "rejected";
    assignment.feedback = feedback;

    await assignment.save();

    const updatedAssignment = await Assignment.findById(id)
      .populate("userId", "fullName username")
      .populate("assignedAdmins", "fullName username");

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.log("Error in rejectAssignment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
