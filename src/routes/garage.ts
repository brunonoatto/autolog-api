import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { Garage } from '../domain/models/garage';
import { Login } from '../domain/models/login';
import { Repository } from '../repository';

const { garages } = Repository;

const router: Router = Router();

// Rota para listar todas as garages
// router.get('/', (req, res) => {
//   res.json(garages);
// });

// Rota para criar uma nova Garagem
router.post('/', (req, res) => {
  const newGarage: Garage = req.body;
  newGarage.id = randomUUID();
  garages.push(newGarage);
  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.status(201).json(newGarage);
});

// Rota para login da Garagem
router.post<Login>('/login', (req, res) => {
  const loginParams: Login = req.body;
  const garage = garages.find(
    (g) => g.email === loginParams.email && g.password === loginParams.password,
  );

  if (!garage) return res.status(404).json({ message: 'Email ou senha inválidos' });

  res.status(201).json(garage);
});

// Rota para buscar uma Garagem por ID
router.get('/:id', (req, res) => {
  const garage: Garage | undefined = garages.find((g) => g.id === req.params.id);
  if (!garage) return res.status(404).json({ message: 'Garagem não encontrada' });
  res.json(garage);
});

// Rota para atualizar uma Garagem por ID
router.put('/:id', (req, res) => {
  const garage: Garage | undefined = garages.find((g) => g.id === req.params.id);
  if (!garage) return res.status(404).json({ message: 'Garagem não encontrada' });

  const updatedGarage: Garage = req.body;
  updatedGarage.id = garage.id;

  const garageIndex: number = garages.findIndex((g) => g.id === garage.id);
  garages[garageIndex] = updatedGarage;

  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.json(updatedGarage);
});

// Rota para remover uma Garagem por ID
router.delete('/:id', (req, res) => {
  const garageIndex: number = garages.findIndex((g) => g.id === req.params.id);
  if (garageIndex === -1) return res.status(404).json({ message: 'Garagem não encontrada' });

  garages.splice(garageIndex, 1);
  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.json({ message: 'Garagem removida com sucesso' });
});

export default router;
