import Joi from "joi";
import { IStudent } from "./Student.types";

export const StudentValidationSchema = Joi.object<IStudent>({
  id: Joi.string().max(50).optional(),
  name: Joi.string().min(1).max(100).required(),
  age: Joi.number().integer().min(16).max(100).required(),
  group: Joi.number().integer().min(1).max(10).required(),
});

export const StudentUpdateValidationSchema = Joi.object<Partial<IStudent>>({
  name: Joi.string().min(1).max(100).optional(),
  age: Joi.number().integer().min(16).max(100).optional(),
  group: Joi.number().integer().min(1).max(10).optional(),
}).min(1);
