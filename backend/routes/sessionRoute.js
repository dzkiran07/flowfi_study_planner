import express from "express"
import sessionModel from "../models/sessionModel.js";
import taskModel from "../models/taskModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const sessionRouter = express.Router()

sessionRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const sessions = await sessionModel.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).send({
            sessions,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch sessions",
            success: false
        });
    }
});

sessionRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const { taskId, topic, duration } = req.body;

        if (typeof duration !== "number" || duration <= 0) {
            return res.status(400).send({
                message: "Duration must be a positive number of minutes",
                success: false
            });
        }

        // Only link the session to a task the caller actually owns.
        let linkedTaskId = null;
        if (taskId) {
            const task = await taskModel.findOne({ _id: taskId, user: req.user.id }).select("_id");
            if (task) linkedTaskId = task._id;
        }

        const session = await sessionModel.create({
            user: req.user.id,
            task: linkedTaskId,
            topic: topic || "General",
            duration
        });

        res.status(201).send({
            session,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to log session",
            success: false
        });
    }
});

export default sessionRouter
