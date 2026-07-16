import express from "express"
import eventModel from "../models/eventModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const eventRouter = express.Router()

eventRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const events = await eventModel.find({ user: req.user.id }).sort({ date: 1 });

        res.status(200).send({
            events,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch events",
            success: false
        });
    }
});

eventRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, type, color, date, description } = req.body;

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).send({
                message: "Title is required",
                success: false
            });
        }

        if (!date || typeof date !== "string") {
            return res.status(400).send({
                message: "Date is required",
                success: false
            });
        }

        const event = await eventModel.create({
            user: req.user.id,
            title: title.trim(),
            type: type || "Other",
            color: color || null,
            date,
            description: description || ""
        });

        res.status(201).send({
            event,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to create event",
            success: false
        });
    }
});

eventRouter.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const event = await eventModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!event) {
            return res.status(404).send({
                message: "Event not found",
                success: false
            });
        }

        res.status(200).send({
            message: "Event deleted",
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to delete event",
            success: false
        });
    }
});

export default eventRouter
