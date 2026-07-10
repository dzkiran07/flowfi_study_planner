import express from "express"
import taskModel from "../models/taskModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const taskRouter = express.Router()

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const STATUSES = ["pending", "in-progress", "completed"];

taskRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await taskModel.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).send({
            tasks,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch tasks",
            success: false
        });
    }
});

taskRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, topic, priority, status, deadlineDate, deadlineTime } = req.body;

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).send({
                message: "Title is required",
                success: false
            });
        }

        if (priority && !PRIORITIES.includes(priority)) {
            return res.status(400).send({
                message: "Invalid priority",
                success: false
            });
        }

        if (status && !STATUSES.includes(status)) {
            return res.status(400).send({
                message: "Invalid status",
                success: false
            });
        }

        const task = await taskModel.create({
            user: req.user.id,
            title: title.trim(),
            description: description || "",
            topic: topic || "General",
            priority: priority || "MEDIUM",
            status: status || "pending",
            deadlineDate: deadlineDate || null,
            deadlineTime: deadlineTime || null
        });

        res.status(201).send({
            task,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to create task",
            success: false
        });
    }
});

taskRouter.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, topic, priority, status, deadlineDate, deadlineTime } = req.body;

        const task = await taskModel.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).send({
                message: "Task not found",
                success: false
            });
        }

        if (priority && !PRIORITIES.includes(priority)) {
            return res.status(400).send({
                message: "Invalid priority",
                success: false
            });
        }

        if (status && !STATUSES.includes(status)) {
            return res.status(400).send({
                message: "Invalid status",
                success: false
            });
        }

        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description;
        if (topic !== undefined) task.topic = topic;
        if (priority !== undefined) task.priority = priority;
        if (deadlineDate !== undefined) task.deadlineDate = deadlineDate;
        if (deadlineTime !== undefined) task.deadlineTime = deadlineTime;

        if (status !== undefined && status !== task.status) {
            task.status = status;
            task.completedAt = status === "completed" ? new Date() : null;
        }

        await task.save();

        res.status(200).send({
            task,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to update task",
            success: false
        });
    }
});

taskRouter.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await taskModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).send({
                message: "Task not found",
                success: false
            });
        }

        res.status(200).send({
            message: "Task deleted",
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to delete task",
            success: false
        });
    }
});

export default taskRouter
