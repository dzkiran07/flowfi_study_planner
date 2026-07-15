import express from "express"
import noteModel from "../models/noteModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const noteRouter = express.Router()

noteRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const notes = await noteModel.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).send({
            notes,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch notes",
            success: false
        });
    }
});

noteRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content, tag } = req.body;

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).send({
                message: "Title is required",
                success: false
            });
        }

        const note = await noteModel.create({
            user: req.user.id,
            title: title.trim(),
            content: content || "",
            tag: tag || "Default"
        });

        res.status(201).send({
            note,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to create note",
            success: false
        });
    }
});

noteRouter.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content, tag } = req.body;

        const note = await noteModel.findOne({ _id: req.params.id, user: req.user.id });

        if (!note) {
            return res.status(404).send({
                message: "Note not found",
                success: false
            });
        }

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length === 0) {
                return res.status(400).send({
                    message: "Title is required",
                    success: false
                });
            }
            note.title = title.trim();
        }
        if (content !== undefined) note.content = content;
        if (tag !== undefined) note.tag = tag;

        await note.save();

        res.status(200).send({
            note,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to update note",
            success: false
        });
    }
});

noteRouter.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const note = await noteModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!note) {
            return res.status(404).send({
                message: "Note not found",
                success: false
            });
        }

        res.status(200).send({
            message: "Note deleted",
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to delete note",
            success: false
        });
    }
});

export default noteRouter
