export type NewBudgetParams = {
  garageId: string;
  license: string;
  status: number;
  name: string;
  phone: string;
  cpf_cnpj: string;
  observation?: string;
  brand?: string;
  model?: string;
  year?: number;
};

export type Budget = {
  os: string;
  garageId: string;
  license: string;
  status: number;
  name: string;
  phone: string;
  cpf_cnpj: string;
  observation?: string;
};
