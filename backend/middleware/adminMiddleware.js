import userModel from "../models/userModel.js";

// Chains after authMiddleware (req.user.id already set from the JWT).
// Looks the role up in the DB rather than trusting the JWT payload, so a
// role change takes effect immediately without forcing a re-login.
export async function adminMiddleware(req, res, next) {
    try {
        const user = await userModel.findById(req.user.id).select("role");

        if (!user || user.role !== "admin") {
            return res.status(403).send({
                message: "Admin access required",
                success: false,
            });
        }

        next();
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Failed to verify admin access",
            success: false,
        });
    }
}
