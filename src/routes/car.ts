import { Router } from 'express';
import fs from 'fs';

import { Car } from '../domain/models/car';
import { Repository } from '../repository';

const { cars } = Repository;

const router: Router = Router();

// Rota para listar todos os carros
// router.get('/', (req, res) => {
//   res.json(cars);
// });

// Rota para criar uma nova Carro
router.post<Car>('/', (req, res) => {
  const newCar: Car = req.body;

  const existLicense = cars.find((g) => g.license === req.params.license);
  if (existLicense) return res.status(404).json({ message: 'Placa já existe' });

  cars.push(newCar);
  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.status(201).json(newCar);
});

// Rota para buscar uma Carro por ID
router.get('/:license', (req, res) => {
  const car: Car | undefined = cars.find((g) => g.license === req.params.license);

  // if (!car) return res.status(404).json({ message: 'Carro não encontrado' });

  res.json(car);
});

// Rota para atualizar uma Carro por ID
router.put<Car>('/:license', (req, res) => {
  const car: Car | undefined = cars.find((g) => g.license === req.params.license);
  if (!car) return res.status(404).json({ message: 'Carro não encontrado' });

  const updatedCar: Car = req.body;
  updatedCar.license = car.license;

  const carIndex: number = cars.findIndex((g) => g.license === car.license);
  cars[carIndex] = updatedCar;

  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.json(updatedCar);
});

// Rota para remover uma Carro por ID
router.delete('/:license', (req, res) => {
  const carIndex: number = cars.findIndex((g) => g.license === req.params.license);
  if (carIndex === -1) return res.status(404).json({ message: 'Carro não encontrado' });

  cars.splice(carIndex, 1);
  fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  res.json({ message: 'Carro removido com sucesso' });
});

export default router;
