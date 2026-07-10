import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    topic: {
        type: String,
        default: "General"
    },
    priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
        default: "MEDIUM"
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    },
    completedAt: {
        type: Date,
        default: null
    },
    deadlineDate: {
        type: String,
        default: null
    },
    deadlineTime: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("task", taskSchema)
