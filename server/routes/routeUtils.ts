import type { Request, Response } from "express";

export function requireUser(
  req: Request,
  res: Response,
): Express.UserPayload | null {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }

  return req.user;
}
