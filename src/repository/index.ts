import fs from 'fs';
import { Budget } from '../domain/models/budget';
import { Car } from '../domain/models/car';
import { Garage } from '../domain/models/garage';
import { TClient } from '../domain/models/client';

type TRepository = {
  budgets: Budget[];
  cars: Car[];
  garages: Garage[];
  clients: TClient[];
};

export const Repository: TRepository = {
  budgets: JSON.parse(fs.readFileSync('data/budget.json', 'utf-8')),
  cars: JSON.parse(fs.readFileSync('data/car.json', 'utf-8')),
  garages: JSON.parse(fs.readFileSync('data/garage.json', 'utf-8')),
  clients: JSON.parse(fs.readFileSync('data/client.json', 'utf-8')),
};
