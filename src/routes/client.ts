import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { Repository } from '../repository';
import { TClient, TGetClientParams, TNewClient } from '../domain/models/client';

const { clients } = Repository;

const router: Router = Router();

// Rota para criar um novo Orçamento
router.post<TNewClient>('/', (req, res) => {
  const { name, cpf, email, password }: TNewClient = req.body;

  const existEmail = clients.findIndex((b) => b.email === email);

  if (existEmail >= 0) {
    return res.status(400).json({ message: 'Já existe um cliente cadastrado com esse e-mail.' });
  }

  const newClient: TClient = { id: randomUUID(), name, cpf, email, password, licenses: [] };
  clients.push(newClient);
  fs.writeFileSync('data/client.json', JSON.stringify(clients, null, 2));

  res.status(201).json(true);
});

// Rota para buscar dados do cliente por cpf
router.get<any, any, any, any, TGetClientParams>('/', (req, res) => {
  const { cpf, email } = req.query;
  const client: TClient | undefined = clients.find(
    (b) => (!cpf || b.cpf === cpf) && (!email || b.email === email),
  );

  if (!client) return res.status(400).json({ message: 'Cliente não encontrado.' });

  const { id, password, ...clientData } = client;

  res.json(clientData);
});

export default router;
