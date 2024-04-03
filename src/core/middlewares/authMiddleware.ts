import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isUUIDV4 } from '../../helpers/isUUIDV4';

const isRouteClientWithoutLogon = (originalUrl: string = '') => {
  const urlSplit = originalUrl.split('/').filter((v) => Boolean(v));

  const isUUID3 = isUUIDV4(urlSplit, 3);

  const pathToValid = [
    ['api', 'budget', isUUIDV4(urlSplit, 2)],
    ['api', 'budget', 'approve', isUUID3],
    ['api', 'budget', 'remake', isUUID3],
  ];

  return pathToValid.some((path) => {
    return urlSplit.every((url, index) =>
      typeof path[index] === 'string' ? url === path[index] : path[index],
    );
  });
};

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader: string | undefined = req.headers['authorization'];

  if (!authHeader) {
    if (isRouteClientWithoutLogon(req?.originalUrl)) {
      next();
      return;
    }

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
