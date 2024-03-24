export type TLoginParams = {
  email: string;
  password: string;
};

export type TUserType = 'garage' | 'client';

export type TLoginResponse = {
  name: string;
  type: TUserType;
  accessToken: string;
};

export type TAccessToken = {
  id: string;
  name: string;
  type: TUserType;
};
