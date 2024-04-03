import { Request, Router } from 'express';
import jwt from 'jsonwebtoken';

import { TAccessToken, TLoginParams, TLoginResponse, TUserType } from '../domain/models/login';
import { Repository } from '../repository';

const { garages, clients } = Repository;

const router: Router = Router();

// Rota para login da Garagem e Usuário
router.post<{}, {}, TLoginParams>('', (req, res) => {
  let id: string = '';
  let name: string = '';
  let type: TUserType = 'garage';

  const { body } = req;

  const garage = garages.find((g) => g.email === body.email && g.password === body.password);
  if (garage) {
    id = garage.id;
    name = garage.name;
    type = 'garage';
  } else {
    const client = clients.find((c) => c.email === body.email && c.password === body.password);

    if (client) {
      id = client.id;
      name = client.name;
      type = 'client';
    } else {
      return res.status(404).json({ message: 'Email ou senha inválidos.' });
    }
  }

  const accessToken: TAccessToken = { id, name, type };

  const response: TLoginResponse = {
    name,
    type,
    accessToken: jwt.sign(accessToken, 'secret-key'),
  };

  res.status(201).json(response);
});

export default router;
