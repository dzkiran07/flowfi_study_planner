import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
        default: null
    },
    topic: {
        type: String,
        default: "General"
    },
    duration: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("session", sessionSchema)
