import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { TGarage } from '../domain/models/garage';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { garages } = Repository;

const router: Router = Router();

// Rota para listar todas as garages
// router.get('/', (req, res) => {
//   res.json(garages);
// });

// Rota para criar uma nova Garagem
router.post('/', (req, res) => {
  const newGarage: TGarage = req.body;
  newGarage.id = randomUUID();
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
router.put('', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const garage: TGarage | undefined = garages.find((g) => g.id === garageId);
  if (!garage) return res.status(404).json({ message: 'Garagem não encontrada.' });

  const updatedGarage: TGarage = req.body;
  updatedGarage.id = garage.id;

  const garageIndex: number = garages.findIndex((g) => g.id === garage.id);
  garages[garageIndex] = updatedGarage;

  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.json(updatedGarage);
});

// Rota para remover uma Garagem por ID
router.delete('', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const garageIndex: number = garages.findIndex((g) => g.id === garageId);
  if (garageIndex === -1) return res.status(404).json({ message: 'Garagem não encontrada.' });

  garages.splice(garageIndex, 1);
  fs.writeFileSync('data/garage.json', JSON.stringify(garages, null, 2));
  res.json({ message: 'Garagem removida com sucesso.' });
});

export default router;
