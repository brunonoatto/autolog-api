import { Request } from 'express';
import jwt from 'jsonwebtoken';

import type { TAccessToken } from '../domain/models/login';

export default function getAccessTokenData(req: Request<any>): TAccessToken | null {
  const authHeader: string | undefined = req.headers['authorization'];

  if (!authHeader) return null;

  const token: string = authHeader.split(' ')[1];

  const autorizationData = jwt.verify(token, 'secret-key') as TAccessToken;

  return autorizationData;
}
