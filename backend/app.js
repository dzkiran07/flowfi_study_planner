import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import sessionRouter from "./routes/sessionRoute.js";
import adminRouter from "./routes/adminRoute.js";
import noteRouter from "./routes/noteRoute.js";

const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()
app.use("/auth", userRouter)
app.use("/tasks", taskRouter)
app.use("/sessions", sessionRouter)
app.use("/admin", adminRouter)
app.use("/notes", noteRouter)


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