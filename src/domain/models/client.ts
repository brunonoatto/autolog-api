export type TClient = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  password: string;
};

export type TNewClient = Omit<TClient, 'id'>;
