import { Router } from 'express';
import fs from 'fs';

import { TCar } from '../domain/models/car';
import { Repository } from '../repository';

const { cars } = Repository;

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

// Rota para buscar uma Carro por ID
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

export default router;
