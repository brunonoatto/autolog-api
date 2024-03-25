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

export type TBudget = {
  os: string;
  garageId: string;
  license: string;
  status: BudgetStatusEnum;
  name: string;
  phone: string;
  cpf_cnpj: string;
  observation?: string;
};

export type TBudgetItem = {
  id: string;
  os: string;
  description: string;
  qtd: number;
  price: number;
};

export type TBudgetComplete = TBudget & { items: TBudgetItem[]; car: TCar };
