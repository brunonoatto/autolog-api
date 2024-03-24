import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { Repository } from '../repository';
import { TClient, TNewClient } from '../domain/models/client';

const { clients } = Repository;

const router: Router = Router();

// Rota para criar um novo Orçamento
router.post<TNewClient>('/', (req, res) => {
  const { name, cpf, email, password }: TNewClient = req.body;

  const existEmail = clients.findIndex((b) => b.email === email);

  if (existEmail >= 0) {
    return res.status(404).json({ message: 'Já existe um cliente cadastrado com esse e-mail.' });
  }

  const newBudget: TClient = { id: randomUUID(), name, cpf, email, password };
  clients.push(newBudget);
  fs.writeFileSync('data/client.json', JSON.stringify(clients, null, 2));

  res.status(201).json(true);
});
