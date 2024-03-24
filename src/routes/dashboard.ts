// TODO: acho q isso deve ir para o Budget
import { Router } from 'express';

import type { TDashboardItem } from '../domain/models/dashboard';
import { Repository } from '../repository';
import getAccessTokenData from '../helpers/getAccessTokenData';

const { budgets, cars } = Repository;

const router: Router = Router();

// Rota para listar os Orçamentos de uma Garagem
// TODO: add o nome da pessoa e telefone
router.get('', (req, res) => {
  const accessTokenData = getAccessTokenData(req);
  if (!accessTokenData)
    return res.status(404).json({ message: 'Token não encontrado na Request.' });
  const garageId = accessTokenData.id;

  const result = budgets.reduce((acc, b) => {
    if (b.garageId !== garageId) return acc;

    const car = cars.find((c) => c.license === b.license);
    if (car) {
      acc.push({
        os: b.os,
        status: b.status,
        ...car,
      });
    }

    return acc;
  }, [] as TDashboardItem[]);

  res.json(result);
});

export default router;
