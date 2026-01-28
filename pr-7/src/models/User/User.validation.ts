import Joi from "joi";
import { IUserRegistration, IUserLogin } from "./User.types";

export const UserRegistrationSchema = Joi.object<IUserRegistration>({
  name: Joi.string().min(1).max(100).required(),
  surname: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
  roleId: Joi.number().integer().optional(),
});

export const UserLoginSchema = Joi.object<IUserLogin>({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(255).required(),
});
