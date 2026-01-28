export type UserId = string;

export interface IUser {
  id?: UserId;
  name: string;
  surname: string;
  email: string;
  password: string;
  roleId: number;
}

export interface IUserResponse {
  id: UserId;
  name: string;
  surname: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRegistration {
  name: string;
  surname: string;
  email: string;
  password: string;
  roleId?: number;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUserResponse;
}
