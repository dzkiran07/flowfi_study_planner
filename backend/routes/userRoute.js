import express from "express"
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

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

        res.status(201).send({
            message: "Signup successful",
            result,
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

export default userRouter