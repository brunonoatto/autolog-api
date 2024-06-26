import { TCar } from './car';

export enum BudgetStatusEnum {
  'WaitingBudget' = 1,
  'WaitingBudgetApproval' = 2,
  'ApprovedBudget' = 3,
  'BudgetRejected' = 4,
  'RunningService' = 5,
  'CarReady' = 6,
  'Finished' = 7,
}

export type TBudgetStatus = keyof typeof BudgetStatusEnum;

export type TBudget = {
  os: string;
  garageId: string;
  license: string;
  status: BudgetStatusEnum;
  clientId: string;
  observation?: string;
  createdDate: string;
};

export type TNewBudgetParams = {
  license: string;
  name: string;
  phone: string;
  cpf_cnpj: string;
  observation?: string;
  brand?: string;
  model?: string;
  year?: number;
};

export type TUpdatedBudget = Omit<TBudget, 'garageId'>;

export type TBudgetResponse = {
  os: string;
  garageId: string;
  createdDate: string;
  status: BudgetStatusEnum;
  license: string;
  clientName: string;
  car: Pick<TCar, 'brand' | 'model' | 'year'>;
};

export type TBudgetItem = {
  id: string;
  os: string;
  description: string;
  qtd: number;
  price: number;
};

export type TNewBudgetItem = Omit<TBudgetItem, 'os' | 'id'>;

export type TBudgetComplete = TBudget & { items: TBudgetItem[]; car: TCar };
