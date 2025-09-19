import express from "express";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../middleware.js";
import db from "../db.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const existingUser = db.prepare("SELECT * FROM users WHERE external_id = ?").get(payload.sub);

        if (!existingUser) {
            db.prepare("INSERT INTO users (external_id,email) VALUES (?,?)").run(payload.sub, payload.email);
            createSession(payload.sub, res);
        }
        else {
            createSession(existingUser.id, res);
        }

        return res.json({ message: "Logged in", user: payload });
    } catch (error) {
        console.error("Google login error:", error);
        return res.status(401).json({ error: "Invalid Google token" });
    }
});

router.post("/logout", (req, res) => {
    const sid = req.cookies.sid;
    if (sid) {
        try {
            db.prepare("DELETE FROM sessions WHERE sid = ?").run(sid);
            res.clearCookie("sid");
        }
        catch (err) {
            console.log("Failed to delete session: ", err);
        }
    }
    res.json({ message: "Logged out" });
})

router.get("/check", authMiddleware, (req, res) => {
    res.json({ authenticated: true });
})

router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
})

function createSession(userId, res) {
    const sid = uuidv4();
    const expires = Date.now() + 1000 * 60 * 60 * 24 * 30; //30 days

    db.prepare("INSERT INTO sessions (sid,user_id,expires) VALUES (?,?,?)").run(sid, userId, expires);

    res.cookie("sid", sid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    })
    return sid;
}


export default router;