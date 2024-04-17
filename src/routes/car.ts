import { Router } from 'express';
import fs from 'fs';

import { TCar } from '../domain/models/car';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { budgets, cars, clients } = Repository;

const router: Router = Router();

// Rota para criar um novo Carro
router.post<{}, {}, TCar>('/', (req, res) => {
  const newCar = { ...req.body };

  const existLicense = cars.find((g) => g.license === newCar.license);
  if (existLicense)
    return res.status(400).json({ message: 'A Placa informada já existe no cadastro.' });

  cars.push(newCar);
  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));

  res.status(201).json(newCar);
});

// Rota para buscar os carros do cliente logado
router.get<{ clientId?: string }, any, any, { transfereds?: boolean }>(
  '/client/:clientId',
  (req, res) => {
    const accessTokenData = getAccessTokenData(req);
    if (!accessTokenData)
      return res.status(401).json({ message: 'Token não encontrado na Request.' });
    const clientId = accessTokenData.type === 'client' ? accessTokenData.id : null;

    const { clientId: clientIdParam } = req.params;
    const { transfereds: transferedsQuery } = req.query;

    if (!clientId || !clientIdParam) {
      return res.status(400).json({ message: 'Cliente não encontrado.' });
    }

    const clientIdValue = clientId || clientIdParam;

    const licensesFilter: string[] = [];
    if (transferedsQuery) {
      licensesFilter.push(
        ...budgets.filter((b) => b.clientId === clientIdValue).map((b) => b.license),
      );
    }

    const response =
      cars
        .filter((c) => c.clientId === clientIdValue || licensesFilter.includes(c.license))
        .map((c) => ({
          license: c.license,
          brand: c.brand,
          model: c.model,
          year: c.year,
          isTransfered: c.clientId !== clientIdValue,
        })) || [];
    console.log({ response });
    res.json(response);
  },
);

// Rota para buscar um Carro por ID
router.get('/:license', (req, res) => {
  const car: TCar | undefined = cars.find((g) => g.license === req.params.license);

  if (!car) return res.status(400).json({ message: 'Veículo não encontrado.' });

  res.json(car);
});

// Rota para atualizar uma Carro por ID
router.put<{ license: string }, {}, TCar>('/:license', (req, res) => {
  const car: TCar | undefined = cars.find((g) => g.license === req.params.license);
  if (!car) return res.status(400).json({ message: 'Veículo não encontrado.' });

  const carIndex: number = cars.findIndex((g) => g.license === car.license);
  cars[carIndex] = req.body;

  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.json(req.body);
});

// Rota para remover uma Carro por ID
router.delete('/:license', (req, res) => {
  const carIndex: number = cars.findIndex((g) => g.license === req.params.license);
  if (carIndex < 0) return res.status(400).json({ message: 'Veículo não encontrado.' });

  cars.splice(carIndex, 1);
  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.json({ message: 'Carro removido com sucesso.' });
});

// Rota para Transferir um carro para um novo Cliente
router.patch('/:license/transfer/:cpfToTrasnfer', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(401).json({ message: 'Token não encontrado na Request.' });
  const clientId = accessTokenData.id;

  const { license: licenseParam, cpfToTrasnfer } = req.params;

  const carToTrasnfer = cars.find((c) => c.license === licenseParam);

  if (!carToTrasnfer) {
    return res.status(400).json({ message: 'Veículo não encontrado.' });
  }

  if (carToTrasnfer.clientId !== clientId) {
    return res.status(400).json({ message: 'Veículo não pertence ao Cliente logado.' });
  }

  const newClient = clients.find((c) => c.cpf === cpfToTrasnfer);

  if (!newClient) {
    return res.status(400).json({ message: 'CPF enviado para transferência não está cadastrado.' });
  }

  const carIndex = cars.findIndex((c) => c.license === carToTrasnfer.license);
  cars[carIndex].clientId = newClient.id;

  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.status(201).json(true);
});

export default router;
