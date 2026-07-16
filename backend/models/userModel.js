import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    // Bumped whenever every outstanding token for this account should be
    // invalidated (password change, "log out of all devices") — checked
    // against the value baked into each JWT at issue time.
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default   mongoose.model("user",userSchema)