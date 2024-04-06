import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isUUIDV4 } from '../../helpers/isUUIDV4';

const isRouteClientWithoutLogon = (request: Request) => {
  const { originalUrl, method } = request;
  const urlSplit = [
    method.toLocaleLowerCase(),
    ...originalUrl.split('/').filter((v) => Boolean(v)),
  ];

  const isUUID3 = isUUIDV4(urlSplit, 3);
  console.log({ method, urlSplit });
  const pathToValid = [
    ['get', 'api', 'budget', isUUIDV4(urlSplit, 2)],
    ['patch', 'api', 'budget', 'approve', isUUID3],
    ['patch', 'api', 'budget', 'remake', isUUID3],
    ['post', 'api', 'client'],
    ['post', 'api', 'garage'],
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
    if (isRouteClientWithoutLogon(req)) {
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
