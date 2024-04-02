export type TClient = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  password: string;
  licenses: string[];
};

export type TNewClient = Omit<TClient, 'id'>;

export type TGetClientParams = {
  cpf: string;
  email: string;
};
