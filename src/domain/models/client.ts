import type { TCar } from './car';

export type TClient = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
};

export type TClientResponse = Omit<TClient, 'id' | 'password'> & {
  cars?: Omit<TCar, 'clientId'>[];
};

export type TNewClient = Omit<TClient, 'id'>;

export type TGetClientParams = {
  cpf: string;
  email: string;
  withCars: boolean;
};
