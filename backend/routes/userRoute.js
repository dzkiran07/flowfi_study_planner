import express from "express"
import dotenv from "dotenv"
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const userRouter = express.Router()

userRouter.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

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

        const token = jwt.sign({ id: result._id, email: result.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

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

userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

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

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).send({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
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

export default userRouter