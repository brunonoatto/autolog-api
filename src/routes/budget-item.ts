import { randomUUID } from 'crypto';
import { Router } from 'express';
import fs from 'fs';

import { TBudgetItem } from '../domain/models/budget';
import { Repository } from '../repository';

const { budgetItems } = Repository;

const router: Router = Router();

// Rota para adicionar um item no Orçamento
router.post<{ os: string }, any, Omit<TBudgetItem, 'os' | 'id'>>('/:os', (req, res) => {
  const osParam = req.params.os;

  const hasItemDescription = budgetItems.find(
    (i) => i.os === osParam && i.description === req.body.description,
  );
  if (hasItemDescription)
    return res.status(400).json({ message: 'Já existe um item com esta descrição no orçamento.' });

  const newBudgetItem: TBudgetItem = {
    id: randomUUID(),
    os: osParam,
    ...req.body,
  };
  budgetItems.push(newBudgetItem);
  fs.writeFileSync('data/budgetItems.json', JSON.stringify(budgetItems, null, 2));

  res.status(201).json(newBudgetItem);
});

// Rota para remover um Orçamento pela OS
router.delete('/:id', (req, res) => {
  const itemIndex: number = budgetItems.findIndex((b) => b.id === req.params.id);
  if (itemIndex === -1)
    return res.status(400).json({ message: 'Item do orçamento não encontrado.' });

  budgetItems.splice(itemIndex, 1);
  fs.writeFileSync('data/budgetItems.json', JSON.stringify(budgetItems, null, 2));
  res.json({ message: 'Item do orçamento removido com sucesso.' });
});

export default router;
