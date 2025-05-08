import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({
      message: "No authorization header found"
    });
  }
  const token = authHeader.split(' ')[1]; 
  try{
    const payload = jwt.verify(token,JWT_SECRET)
    //@ts-ignore
    req.id = payload.id;
    next();
  } catch (err) {
    res.status(403).json({
      message: "You are not logged in",
    });
  }
}