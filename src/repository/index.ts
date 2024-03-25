import fs from 'fs';
import type { TBudget, TBudgetItem } from '../domain/models/budget';
import type { TCar } from '../domain/models/car';
import type { TGarage } from '../domain/models/garage';
import type { TClient } from '../domain/models/client';

type TRepository = {
  budgets: TBudget[];
  budgetItems: TBudgetItem[];
  cars: TCar[];
  garages: TGarage[];
  clients: TClient[];
};

export const Repository: TRepository = {
  budgets: JSON.parse(fs.readFileSync('data/budget.json', 'utf-8')),
  budgetItems: JSON.parse(fs.readFileSync('data/budgetItems.json', 'utf-8')),
  cars: JSON.parse(fs.readFileSync('data/car.json', 'utf-8')),
  garages: JSON.parse(fs.readFileSync('data/garage.json', 'utf-8')),
  clients: JSON.parse(fs.readFileSync('data/client.json', 'utf-8')),
};
