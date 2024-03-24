import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader: string | undefined = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de acesso não informado.' });
  }

  const token: string = authHeader.split(' ')[1];

  try {
    jwt.verify(token, 'secret-key');
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token de acesso inválido.' });
  }
}
