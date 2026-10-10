const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Get tasks visible to the logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const filter =
      req.user.role === "manager"
        ? { $or: [{ createdBy: userId }, { assignedTo: userId }] }
        : { assignedTo: userId };

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Could not retrieve tasks" });
  }
});

// Create a task (managers only)
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can create tasks",
      });
    }

    const { title, description, assignedTo, dueDate } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: "Invalid assigned user ID" });
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);

      if (!assignee) {
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user.id,
    });

    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: "created",
      details: assignedTo
        ? "Task created and assigned"
        : "Task created without an assignee",
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Could not create task" });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isManager = req.user.role === "manager";
    const isCreator = task.createdBy.toString() === req.user.id;
    const isAssignee = task.assignedTo?.toString() === req.user.id;

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo?.toString() || null;

    if (isManager && isCreator) {
      const { title, description, status, assignedTo, dueDate } = req.body;

      if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
          return res.status(400).json({ message: "Title cannot be empty" });
        }
        task.title = title.trim();
      }

      if (description !== undefined) task.description = description;

      if (status !== undefined) {
        if (!["todo", "in-progress", "completed"].includes(status)) {
          return res.status(400).json({ message: "Invalid task status" });
        }
        task.status = status;
      }

      if (assignedTo !== undefined) {
        if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
          return res.status(400).json({ message: "Invalid assigned user ID" });
        }

        if (assignedTo) {
          const assignee = await User.findById(assignedTo);
          if (!assignee) {
            return res.status(404).json({ message: "Assigned user not found" });
          }
        }

        task.assignedTo = assignedTo || null;
      }

      if (dueDate !== undefined) {
        if (dueDate && Number.isNaN(Date.parse(dueDate))) {
          return res.status(400).json({ message: "Invalid due date" });
        }
        task.dueDate = dueDate || null;
      }
    } else if (!isManager && isAssignee) {
      if (
        Object.keys(req.body).some((key) => key !== "status") ||
        !["todo", "in-progress", "completed"].includes(req.body.status)
      ) {
        return res.status(403).json({
          message: "You can only update the status of your assigned tasks",
        });
      }

      task.status = req.body.status;
    } else {
      return res.status(403).json({ message: "Permission denied" });
    }

    await task.save();

    const statusChanged = previousStatus !== task.status;
    const assigneeChanged =
      previousAssignee !== (task.assignedTo?.toString() || null);

    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: statusChanged
        ? "status_changed"
        : assigneeChanged
          ? "assigned"
          : "updated",
      details: statusChanged
        ? `Status changed from ${previousStatus} to ${task.status}`
        : assigneeChanged
          ? "Task assignment changed"
          : "Task details updated",
    });

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Could not update task" });
  }
});

// Delete a task (manager who created it only)
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can delete tasks",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete tasks you created",
      });
    }

    // Record the deletion before removing the task.
    await ActivityLog.create({
      task: task._id,
      user: req.user.id,
      action: "deleted",
      details: `Deleted task: ${task.title}`,
    });

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Could not delete task" });
  }
});
// Get activity history for a task
router.get("/:id/activity", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isManager = req.user.role === "manager";
    const isCreator = task.createdBy.toString() === req.user.id;
    const isAssignee = task.assignedTo?.toString() === req.user.id;

    
if (!(isManager && isCreator) && !isAssignee) {
  return res.status(403).json({ message: "Permission denied" });
}


    const ActivityLog = require("../models/ActivityLog");

    const activities = await ActivityLog.find({ task: task._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ activities });
  } catch (error) {
    console.error("Get activity error:", error.message);
    res.status(500).json({ message: "Could not retrieve activity history" });
  }
});

module.exports = router;