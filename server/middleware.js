import db from "./db.js";

export default function authMiddleware(req, res, next) {
    const sid = req.cookies.sid;
    if (!sid) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const user = db.prepare(
            `SELECT s.*, u.email FROM sessions s
            JOIN users u ON u.id = s.user_id 
            WHERE sid = ? AND expires > ?`)
            .get(sid, Date.now());

        if (!user) {
            return res.status(401).json({ error: "Session expired" });
        }

        req.user = { id: user.user_id, email: user.email };
        next();
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: "DB error" });
    }

}
