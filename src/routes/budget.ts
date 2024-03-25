import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import {
  TBudget,
  BudgetStatusEnum,
  TNewBudgetParams,
  TBudgetComplete,
} from '../domain/models/budget';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { budgets, budgetItems, cars } = Repository;

const router: Router = Router();

// Rota para criar um novo Orçamento
router.post<TNewBudgetParams>('/', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const { brand, model, year, ...budgetParam }: TNewBudgetParams = req.body;

  const existInProgress = budgets.findIndex(
    (b) =>
      b.license === budgetParam.license &&
      b.garageId === garageId &&
      b.status !== BudgetStatusEnum.Finished,
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

  const newBudget: TBudget = {
    garageId,
    os: randomUUID(),
    status: BudgetStatusEnum.WaitingBudget,
    ...budgetParam,
  };
  budgets.push(newBudget);
  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));

  res.status(201).json(newBudget);
});

const updateStatus = (res: any, os: string, status: BudgetStatusEnum) => {
  const budgetIndex = budgets.findIndex((b) => b.os === os);

  if (budgetIndex < 0) return res.status(404).json({ message: 'Orçamento não encontrado.' });

  budgets[budgetIndex].status = status;

  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));
  res.status(201).json(true);
};

// Rota para enviar o Orçamento para o status ApprovedBudget
router.patch('/approve/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.ApprovedBudget);
});

// Rota para enviar o Orçamento para o status RunningService
router.patch('/start/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.RunningService);
});

// Rota para enviar o Orçamento devolta para o status WaitingBudget
router.patch('/remake/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.WaitingBudget);
});

// Rota para enviar o Orçamento para o status CarReady
router.patch('/completed/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.CarReady);
});

// Rota para buscar um Orçamento pela OS
router.get('/:os', (req, res) => {
  const osParam = req.params.os;
  const budget: TBudget | undefined = budgets.find((b) => b.os === osParam);

  if (!budget) return res.status(404).json({ message: 'Orçamento não encontrado.' });

  const car = cars.find((c) => c.license === budget.license);

  if (!car) return res.status(404).json({ message: 'Carro do orçamento não encontrado.' });

  const budgetResponse: TBudgetComplete = {
    ...budget,
    car,
    items: budgetItems.filter((i) => i.os === osParam),
  };

  res.json(budgetResponse);
});

// Rota para buscar um Orçamento pela Placa
router.get<{ license: string }>('/', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const budgetsList: TBudget[] = budgets.filter(
    (b) => (!req.query.license || b.license === req.query.license) && b.garageId === garageId,
  );
  if (!budgetsList.length)
    return res.status(404).json({ message: 'Nenhum orçamento não encontrado.' });

  res.json(budgetsList);
});

// Rota para atualizar um Orçamento pela OS
router.put<string, any, any, Omit<TBudget, 'garageId'>>('/:os', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const budget: TBudget | undefined = budgets.find((b) => b.os === req.params.os);
  if (!budget) return res.status(404).json({ message: 'Orçamento não encontrado.' });

  const updatedBudget: TBudget = { ...req.body, garageId };
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
