import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Missing or invalid Authorization header",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // A DB-backed revocation check: bumping a user's tokenVersion (on
    // password change or "log out of all devices") invalidates every token
    // issued before that point, even though the JWT signature itself is
    // still valid until its natural expiry.
    const user = await userModel.findById(decoded.id).select("tokenVersion");
    if (!user || (decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).send({
        message: "Session expired. Please log in again.",
        success: false,
      });
    }

    req.user = decoded; // { id, email, tokenVersion }
    next();
  } catch (err) {
    return res.status(401).send({
      message: "Invalid or expired token",
      success: false,
    });
  }
}

