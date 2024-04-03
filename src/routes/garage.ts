import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { TGarage, TNewGarage } from '../domain/models/garage';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { garages } = Repository;

const router: Router = Router();

// Rota para criar uma nova Garagem
router.post<{}, {}, TNewGarage>('/', (req, res) => {
  const newGarage: TGarage = {
    ...req.body,
    id: randomUUID(),
  };

  garages.push(newGarage);
  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.status(201).json(newGarage);
});

// Rota para buscar uma Garagem por ID
router.get('/:id', (req, res) => {
  const garage: TGarage | undefined = garages.find((g) => g.id === req.params.id);
  if (!garage) return res.status(404).json({ message: 'Garagem não encontrada.' });
  res.json(garage);
});

// Rota para atualizar uma Garagem por ID
router.put<{}, {}, TGarage>('', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const garage: TGarage | undefined = garages.find((g) => g.id === garageId);
  if (!garage) return res.status(404).json({ message: 'Garagem não encontrada.' });

  const updatedGarage = { ...req.body };
  updatedGarage.id = garage.id;

  const garageIndex: number = garages.findIndex((g) => g.id === garage.id);
  garages[garageIndex] = updatedGarage;

  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.json(updatedGarage);

  res.status(200);
});

export default router;
