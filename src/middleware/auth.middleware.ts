import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { verify } from "jsonwebtoken";

const revokeTokens: Set<string> = new Set();

export const addRevokeToken = (token: string) => {
  revokeTokens.add(token);
};

export const isTokenRevoked = (token: string): boolean => {
  return revokeTokens.has(token);
};

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (isTokenRevoked(token)) {
    return res.status(403).json({ message: "Forbidden - Token revoked" });
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden - Invalid Token" });
  }
};
