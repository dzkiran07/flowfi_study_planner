import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import userRouter from "./Routes/userRoute.js";

const app = express()

dotenv.config()
app.use(express.json())
app.use("/auth", userRouter)


const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT, async () => {
            console.log("server is running at port", process.env.PORT)
        })
    } catch (err) {
        console.log("Database connection failed.")
        process.exit(1)
    }
}

startServer()