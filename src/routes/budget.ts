import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import {
  TBudget,
  BudgetStatusEnum,
  TNewBudgetParams,
  TBudgetComplete,
  TBudgetResponse,
} from '../domain/models/budget';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';
import { TCar } from '../domain/models/car';
import { TClient } from '../domain/models/client';

const { garages, budgets, budgetItems, cars, clients } = Repository;

const router: Router = Router();

// Rota para criar um novo Orçamento
router.post<any, any, any, TNewBudgetParams>('/', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(401).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const { brand, model, year, ...budgetParam } = req.body;

  const existInProgress = budgets.findIndex(
    (b) =>
      b.license === budgetParam.license &&
      b.garageId === garageId &&
      b.status !== BudgetStatusEnum.Finished,
  );

  if (existInProgress >= 0) {
    return res
      .status(400)
      .json({ message: 'Já existe um orçamento em andamento para esse carro na sua loja.' });
  }

  // Cria Cliente sem login caso o cpf não esteja cadastrado
  let client = clients.find((c) => c.cpf === budgetParam.cpf_cnpj);
  if (!client) {
    client = {
      id: randomUUID(),
      name: budgetParam.name,
      cpf: budgetParam.cpf_cnpj,
      phone: budgetParam.phone,
      email: '',
      password: '',
    } as TClient;

    clients.push(client);
    fs.writeFileSync('data/client.json', JSON.stringify(clients, null, 2));
  }

  // Cria o carro caso não exista
  const carIndex = cars.findIndex((c) => c.license === budgetParam.license);
  if (carIndex < 0) {
    if (!brand || !model || !year || !budgetParam.license) {
      return res.status(400).json({ message: 'Dados do automóvel incompletos.' });
    }

    cars.push({
      clientId: client.id,
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
    clientId: client.id,
    license: budgetParam.license,
    createdDate: new Date().toISOString(),
  };

  budgets.push(newBudget);
  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));

  res.status(201).json(newBudget);
});

// Rota para buscar um Orçamento pela OS
router.get('/:os', (req, res) => {
  const osParam = req.params.os;

  const budget: TBudget | undefined = budgets.find((b) => b.os === osParam);
  if (!budget) return res.status(400).json({ message: 'Orçamento não encontrado.' });

  const car = cars.find((c) => c.license === budget.license);
  if (!car) return res.status(400).json({ message: 'Automóvel do orçamento não encontrado.' });

  const budgetResponse: TBudgetComplete = {
    ...budget,
    car,
    items: budgetItems.filter((i) => i.os === osParam),
  };

  res.json(budgetResponse);
});

// Rota para buscar um Orçamento pela Placa, sempre filtrando pelo accessToken do usuário caso esteja logado
router.get<{}, {}, {}, { license: string }>('/', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  // TODO: essa rota pode ser acessada sem login, melhorar isso
  // if (!accessTokenData)
  //   return res.status(401).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData?.type === 'garage' ? accessTokenData?.id : null;
  const clientId = accessTokenData?.type === 'client' ? accessTokenData?.id : null;

  const budgetsList: TBudget[] = budgets.filter(
    (b) =>
      (!req.query.license || b.license === req.query.license) &&
      (!clientId || b.clientId === clientId) &&
      (!garageId || b.garageId === garageId),
  );
  if (!budgetsList.length) return res.status(400).json({ message: 'Nenhum orçamento encontrado.' });

  const licensesToFilter = [...new Set(budgetsList.map((b) => b.license))];
  const carsList = cars.filter((c) => licensesToFilter.includes(c.license));

  const responseData = budgetsList.map((budget) => {
    const car: TCar | undefined = carsList.find((c) => c.license === budget.license);

    if (!car) {
      throw Error('Automóvel de um orçamento não encontrado!');
    }

    const { os, garageId, status, license, createdDate } = budget;
    const { brand, model, year } = car;
    const { name: clientName = '' } = clients.find((c) => c.id === budget.clientId) || {};

    return {
      os,
      garageId,
      createdDate,
      status,
      license,
      clientName,
      car: { brand, model, year },
    } as TBudgetResponse;
  });

  res.json(responseData);
});

// Rota para atualizar um Orçamento pela OS
router.put<{ os: string }, {}, Omit<TBudget, 'garageId'>>('/:os', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const budget: TBudget | undefined = budgets.find((b) => b.os === req.params.os);
  if (!budget) return res.status(400).json({ message: 'Orçamento não encontrado.' });

  const updatedBudget: TBudget = { ...req.body, garageId };
  updatedBudget.os = budget.os;

  const budgetIndex: number = budgets.findIndex((b) => b.os === budget.os);
  budgets[budgetIndex] = updatedBudget;

  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));
  res.json(updatedBudget);
});

const updateStatus = (res: any, os: string, status: BudgetStatusEnum) => {
  const budgetIndex = budgets.findIndex((b) => b.os === os);

  if (budgetIndex < 0) return res.status(400).json({ message: 'Orçamento não encontrado.' });

  budgets[budgetIndex].status = status;

  fs.writeFileSync('data/budget.json', JSON.stringify(budgets, null, 2));
  res.status(201).json(true);
};

// Rota para enviar o Orçamento para o status ApprovedBudget
router.patch('/approve/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.ApprovedBudget);
});

// Rota para enviar o Orçamento para o status WaitingBudgetApproval
router.patch('/send-for-approve/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.WaitingBudgetApproval);
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

// Rota para enviar o Orçamento para o status CarReady
router.patch('/finish/:os', (req, res) => {
  updateStatus(res, req.params.os, BudgetStatusEnum.Finished);
});

// Rota que retorna a url para o whatsapp
router.get('/whats/:os', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(401).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.type === 'garage' ? accessTokenData.id : null;

  const { os } = req.params;

  const garage = garages.find((b) => b.id === garageId);

  if (!garage) return res.status(400).json({ message: 'Garage não encontrada.' });

  const budget = budgets.find((b) => b.os === os && garageId === garageId);

  if (!budget) return res.status(400).json({ message: 'Nenhum orçamento encontrado.' });

  const client = clients.find((c) => c.id === budget.clientId);

  if (!client) return res.status(400).json({ message: 'Cliente não encontrado.' });

  const link = client.email
    ? `http://127.0.0.1:5173/cliente/orcamento/${os}`
    : `http://127.0.0.1:5173/orcamento/${os}`;

  const msg = `Olá ${client.name}, aqui é da mecênica ${garage.name}.\n\nSeu orçamento está pronto, basta clicar no link abaixo para revisar e aprovar.\nIniciaremos o serviço mediante aprovação do orçamento.\n\nLink: ${link}`;
  const whatsAppLink = `https://web.whatsapp.com/send/?phone=55${client.phone}&text=${encodeURI(
    msg,
  )}&type=phone_number&app_absent=0`;

  res.json({ link: whatsAppLink });
});

export default router;
