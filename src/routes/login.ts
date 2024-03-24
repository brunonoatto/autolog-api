import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { TAccessToken, TLoginParams, TLoginResponse, TUserType } from '../domain/models/login';
import { Repository } from '../repository';

const { garages, clients } = Repository;

const router: Router = Router();

// Rota para login da Garagem
router.post<TLoginParams>('', (req, res) => {
  let id: string = '';
  let name: string = '';
  let type: TUserType = 'garage';

  const loginParams: TLoginParams = req.body as TLoginParams;

  const garage = garages.find(
    (g) => g.email === loginParams.email && g.password === loginParams.password,
  );

  const client = clients.find(
    (c) => c.email === loginParams.email && c.password === loginParams.password,
  );

  if (!garage && !client) return res.status(404).json({ message: 'Email ou senha inválidos.' });

  if (garage) {
    id = garage.id;
    name = garage.name;
    type = 'garage';
  } else if (client) {
    id = client.id;
    name = client.name;
    type = 'client';
  }

  if (!id) return res.status(404).json({ message: 'Erro ao carregar usuário.' });

  const response: TLoginResponse = {
    name,
    type,
    accessToken: jwt.sign({ id, name, type } as TAccessToken, 'secret-key'),
  };

  res.status(201).json(response);
});

export default router;
