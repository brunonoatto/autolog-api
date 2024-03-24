import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { Budget, NewBudgetParams } from '../domain/models/budget';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { budgets, cars } = Repository;

const router: Router = Router();

// Rota para criar um novo Orçamento
router.post<NewBudgetParams>('/', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const { brand, model, year, ...budgetParam }: NewBudgetParams = req.body;

  const existInProgress = budgets.findIndex(
    (b) => b.license === budgetParam.license && b.garageId === garageId && b.status !== 6,
  );

  if (existInProgress >= 0) {
    return res.status(404).json({ message: 'Já existe um orçamento para esse carro na sua loja.' });
  }

  // Cria o carro caso não exista
  const carIndex = cars.findIndex((c) => c.license === budgetParam.license);
  if (carIndex < 0) {
    if (!brand || !model || !year) {
      return res.status(404).json({ message: 'Dados do automóvel incompletos.' });
    }

    cars.push({
      license: budgetParam.license,
      brand,
      model,
      year,
    });
    fs.writeFileSync('data/car.json', JSON.stringify(cars, null, 2));
  }

  const newBudget: Budget = { ...budgetParam, garageId, os: randomUUID() };
  budgets.push(newBudget);
  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));

  res.status(201).json(newBudget);
});

// Rota para buscar um Orçamento pela OS
router.get('/:os', (req, res) => {
  const budget: Budget | undefined = budgets.find((b) => b.os === req.params.os);
  if (!budget) return res.status(404).json({ message: 'Orçamento não encontrado.' });
  res.json(budget);
});

// Rota para atualizar um Orçamento pela OS
router.put<string, any, any, Omit<Budget, 'garageId'>>('/:os', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const budget: Budget | undefined = budgets.find((b) => b.os === req.params.os);
  if (!budget) return res.status(404).json({ message: 'Orçamento não encontrado.' });

  const updatedBudget: Budget = { ...req.body, garageId };
  updatedBudget.os = budget.os;

  const budgetIndex: number = budgets.findIndex((b) => b.os === budget.os);
  budgets[budgetIndex] = updatedBudget;

  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));
  res.json(updatedBudget);
});

// Rota para remover um Orçamento pela OS
// router.delete('/:os', (req, res) => {
//   const budgetIndex: number = budgets.findIndex(b => b.os === req.params.os);
//   if (budgetIndex === -1) return res.status(404).json({ message: 'Orçamento não encontrado.' });

//   budgets.splice(budgetIndex, 1);
//   fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));
//   res.json({ message: 'Orçamento removido com sucesso.' });
// });

export default router;
