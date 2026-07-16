import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
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
    // "Exam" | "Assignment" | "Other" | a user-defined custom type name.
    type: {
        type: String,
        default: "Other"
    },
    // Custom hex color, only meaningful for non-built-in types.
    color: {
        type: String,
        default: null
    },
    
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("event", eventSchema)
