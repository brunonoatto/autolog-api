import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { Repository } from '../repository';
import { TClient, TGetClientParams, TNewClient } from '../domain/models/client';

const { clients } = Repository;

const router: Router = Router();

// Rota para criar um novo Cliente
router.post<{}, {}, TNewClient>('/', (req, res) => {
  const { name, cpf, phone, email, password } = req.body;

  const existEmail = clients.findIndex((b) => b.email === email);
  if (existEmail >= 0) {
    return res.status(400).json({ message: 'Já existe um cliente cadastrado com esse e-mail.' });
  }

  const existCPF = clients.findIndex((b) => b.cpf === cpf);
  if (existCPF >= 0) {
    return res.status(400).json({ message: 'Já existe um cliente cadastrado com esse CPF.' });
  }

  const newClient: TClient = { id: randomUUID(), name, cpf, phone, email, password };
  clients.push(newClient);
  fs.writeFileSync('data/client.json', JSON.stringify(clients, null, 2));

  res.status(201).json(true);
});

// Rota para buscar dados do cliente por cpf uo e-mail
router.get<{}, {}, {}, TGetClientParams>('/', (req, res) => {
  const { cpf, email } = req.query;

  const client: TClient | undefined = clients.find(
    (b) => (!cpf || b.cpf === cpf) && (!email || b.email === email),
  );

  if (!client) return res.status(400).json({ message: 'Cliente não encontrado.' });

  const { id, password, ...clientData } = client;

  res.status(200).json(clientData);
});

export default router;
