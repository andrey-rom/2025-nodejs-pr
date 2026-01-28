export type RoleId = number;

export interface IRole {
  id?: RoleId;
  name: string;
  description?: string;
}

export enum RoleNames {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}
