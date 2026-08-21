import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || '') as { id: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
