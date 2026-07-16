import express from "express"
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";
import sessionModel from "../models/sessionModel.js";
import noteModel from "../models/noteModel.js";
import eventModel from "../models/eventModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const adminRouter = express.Router()

function isValidEmail(email) {
    return typeof email === "string" && email.includes("@gmail.com");
}

// New accounts (including ones an admin creates by hand) go through the
// same strength policy as self-service signup — 6-char passwords created
// here would otherwise be a weaker back door than /auth/signup allows.
function isValidPassword(password) {
    if (typeof password !== "string") return false;
    const trimmed = password.trim();
    return trimmed.length >= 8 && /[a-zA-Z]/.test(trimmed) && /[0-9]/.test(trimmed);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

adminRouter.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const weekAgo = new Date(Date.now() - WEEK_MS);

        const [totalUsers, totalTasks, totalSessions, signupsThisWeek, durationAgg, statusAgg, recentUsers] = await Promise.all([
            userModel.countDocuments(),
            taskModel.countDocuments(),
            sessionModel.countDocuments(),
            userModel.countDocuments({ createdAt: { $gte: weekAgo } }),
            sessionModel.aggregate([{ $group: { _id: null, totalMinutes: { $sum: "$duration" } } }]),
            taskModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            userModel.find().select("fullName email createdAt").sort({ createdAt: -1 }).limit(8),
        ]);

        const totalStudyMinutes = durationAgg[0]?.totalMinutes || 0;
        const statusCounts = { pending: 0, "in-progress": 0, completed: 0 };
        for (const s of statusAgg) {
            if (s._id in statusCounts) statusCounts[s._id] = s.count;
        }

        res.status(200).send({
            stats: {
                totalUsers,
                totalTasks,
                totalSessions,
                signupsThisWeek,
                totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
                taskStatusCounts: statusCounts,
                recentSignups: recentUsers.map((u) => ({
                    id: u._id,
                    fullName: u.fullName,
                    email: u.email,
                    createdAt: u.createdAt,
                })),
            },
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch stats",
            success: false,
        });
    }
});

adminRouter.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await userModel.find().select("fullName email role createdAt").sort({ createdAt: -1 });

        const [taskCounts, sessionAgg] = await Promise.all([
            taskModel.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]),
            sessionModel.aggregate([{ $group: { _id: "$user", count: { $sum: 1 }, totalMinutes: { $sum: "$duration" } } }]),
        ]);
        const taskCountByUser = new Map(taskCounts.map((t) => [String(t._id), t.count]));
        const sessionCountByUser = new Map(sessionAgg.map((s) => [String(s._id), s.count]));
        const studyMinutesByUser = new Map(sessionAgg.map((s) => [String(s._id), s.totalMinutes || 0]));

        res.status(200).send({
            users: users.map((u) => ({
                id: u._id,
                fullName: u.fullName,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt,
                taskCount: taskCountByUser.get(String(u._id)) || 0,
                sessionCount: sessionCountByUser.get(String(u._id)) || 0,
                totalStudyMinutes: studyMinutesByUser.get(String(u._id)) || 0,
            })),
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to fetch users",
            success: false,
        });
    }
});

adminRouter.post("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
            return res.status(400).send({
                message: "Full name is required",
                success: false,
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).send({
                message: "Invalid email format",
                success: false,
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({
                message: "Password must be at least 8 characters and include a letter and a number",
                success: false,
            });
        }

        if (role !== undefined && !["user", "admin"].includes(role)) {
            return res.status(400).send({
                message: "Invalid role",
                success: false,
            });
        }

        const userExist = await userModel.findOne({ email });
        if (userExist) {
            return res.status(409).send({
                message: "User already exists",
                success: false,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const created = await userModel.create({
            fullName: fullName.trim(),
            email,
            password: hashed,
            role: role || "user",
        });

        res.status(201).send({
            user: {
                id: created._id,
                fullName: created.fullName,
                email: created.email,
                role: created.role,
                createdAt: created.createdAt,
                taskCount: 0,
                sessionCount: 0,
                totalStudyMinutes: 0,
            },
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to create user",
            success: false,
        });
    }
});

adminRouter.patch("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, role } = req.body;

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

        if (role !== undefined) {
            if (!["user", "admin"].includes(role)) {
                return res.status(400).send({
                    message: "Invalid role",
                    success: false,
                });
            }
            if (String(id) === String(req.user.id) && role !== "admin") {
                return res.status(400).send({
                    message: "You can't remove your own admin role",
                    success: false,
                });
            }
            user.role = role;
        }

        await user.save();

        res.status(200).send({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to update user",
            success: false,
        });
    }
});

adminRouter.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (String(id) === String(req.user.id)) {
            return res.status(400).send({
                message: "You can't delete your own account",
                success: false,
            });
        }

        const user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).send({
                message: "User not found",
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
            message: "User deleted",
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to delete user",
            success: false,
        });
    }
});

export default adminRouter
