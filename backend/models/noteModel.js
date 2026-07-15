import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
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
    content: {
        type: String,
        default: ""
    },
    tag: {
        type: String,
        default: "Default"
    }
}, { timestamps: true });

export default mongoose.model("note", noteSchema)
