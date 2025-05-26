import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

interface MyJWTPayload {
  userId: number;
  iat: number;
}
export interface CustomRequest extends Request {
  user: MyJWTPayload;
}
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.session;
    console.log(token);
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, JWT_SECRET as string) as MyJWTPayload;

    (req as CustomRequest).user = decoded;
    console.log(decoded);
    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
