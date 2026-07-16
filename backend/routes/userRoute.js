import express from "express"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";
import sessionModel from "../models/sessionModel.js";
import noteModel from "../models/noteModel.js";
import eventModel from "../models/eventModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

dotenv.config();

const userRouter = express.Router()

function isValidEmail(email) {
    return typeof email === "string" && email.includes("@gmail.com");
}

// Used wherever we're verifying an EXISTING password (login, confirming
// before a destructive action) — a presence check only. Validating password
// *strength* here would reject real accounts whose password predates a
// policy tightening, locking them out of their own account.
function hasPassword(password) {
    return typeof password === "string" && password.length > 0;
}

// Used only when SETTING a new password (signup, change-password, admin
// create-user) — this is where a strength policy actually belongs.
function isStrongPassword(password) {
    if (typeof password !== "string") return false;
    const trimmed = password.trim();
    return trimmed.length >= 8 && /[a-zA-Z]/.test(trimmed) && /[0-9]/.test(trimmed);
}

// Sensitive, low-frequency endpoints get a per-IP rate limit so credential
// stuffing / brute-force attempts can't hammer them indefinitely. Kept
// generous enough that a real user mistyping their password a few times
// never notices.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again in a few minutes.", success: false },
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many signup attempts. Please try again later.", success: false },
});

const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in a few minutes.", success: false },
});

function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, tokenVersion: user.tokenVersion || 0 },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

userRouter.post("/signup", signupLimiter, async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
            return res.status(400).send({
                message: "Full name is required",
                success: false
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).send({
                message: "Invalid email format",
                success: false
            });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).send({
                message: "Password must be at least 8 characters and include a letter and a number",
                success: false
            });
        }

        const userExist = await userModel.findOne({ email });

        if (userExist) {
            return res.status(409).send({
                message: "User already exists",
                success: false
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);


        const result = await userModel.create({
            fullName,
            email,
            password: hashed
        });

        const token = signToken(result);

        res.status(201).send({
            message: "Signup successful",
            result,
            token,
            success: true
        });

    } catch (err) {
        console.log(err);

        res.status(500).send({
            message: "Signup failed",
            success: false
        });
    }
});

userRouter.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).send({
                message: "Invalid email format",
                success: false
            });
        }

        if (!hasPassword(password)) {
            return res.status(400).send({
                message: "Password is required",
                success: false
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).send({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({
                message: "Invalid email or password",
                success: false
            });
        }

        const token = signToken(user);

        res.status(200).send({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            },
            token,
            success: true
        });

    } catch (err) {
        console.log(err);

        res.status(500).send({
            message: "Login failed",
            success: false
        });
    }
});

userRouter.get("/me", authMiddleware, async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id).select("fullName email course bio role");

        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }

        res.status(200).send({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                course: user.course,
                bio: user.bio,
                role: user.role,
            },
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch user",
            success: false,
        });
    }
});

userRouter.patch("/me", authMiddleware, async (req, res) => {
    try {
        const { id } = req.user;
        const { fullName, email, course, bio } = req.body;

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }

        if (fullName !== undefined) {
            if (typeof fullName !== "string" || fullName.trim().length < 2) {
                return res.status(400).send({
                    message: "Full name is required",
                    success: false,
                });
            }
            user.fullName = fullName.trim();
        }

        if (email !== undefined) {
            if (!isValidEmail(email)) {
                return res.status(400).send({
                    message: "Invalid email format",
                    success: false,
                });
            }
            const emailTaken = await userModel.findOne({ email, _id: { $ne: id } });
            if (emailTaken) {
                return res.status(409).send({
                    message: "Email is already in use",
                    success: false,
                });
            }
            user.email = email;
        }

        if (course !== undefined) user.course = course;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.status(200).send({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                course: user.course,
                bio: user.bio,
                role: user.role,
            },
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to update profile",
            success: false,
        });
    }
});

userRouter.patch("/change-password", authMiddleware, sensitiveActionLimiter, async (req, res) => {
    try {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!hasPassword(currentPassword)) {
            return res.status(400).send({
                message: "Current password is required",
                success: false,
            });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).send({
                message: "New password must be at least 8 characters and include a letter and a number",
                success: false,
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).send({
                message: "Current password is incorrect",
                success: false,
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        // Invalidate every other token issued before this point (a stolen
        // or logged-in-elsewhere session can't keep using the old password's
        // credibility) while still handing this request's caller a fresh,
        // valid token so they aren't logged out by their own change.
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        res.status(200).send({
            message: "Password changed",
            token: signToken(user),
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to change password",
            success: false,
        });
    }
});

userRouter.post("/logout-all", authMiddleware, async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }

        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        res.status(200).send({
            message: "Logged out of all devices",
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to log out of all devices",
            success: false,
        });
    }
});

userRouter.post("/clear-data", authMiddleware, sensitiveActionLimiter, async (req, res) => {
    try {
        const { id } = req.user;
        const { password } = req.body;

        if (!hasPassword(password)) {
            return res.status(400).send({
                message: "Password is required",
                success: false,
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({
                message: "Incorrect password",
                success: false,
            });
        }

        await Promise.all([
            taskModel.deleteMany({ user: id }),
            sessionModel.deleteMany({ user: id }),
            noteModel.deleteMany({ user: id }),
            eventModel.deleteMany({ user: id }),
        ]);

        res.status(200).send({
            message: "All data cleared",
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to clear data",
            success: false,
        });
    }
});

export default userRouter
