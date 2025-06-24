import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string; email: string };
      
      // Add admin info to request
      req.admin = {
        id: decoded.id,
        email: decoded.email
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
}; 