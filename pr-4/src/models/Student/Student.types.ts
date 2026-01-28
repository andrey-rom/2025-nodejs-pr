export type StudentId = number;

export interface IStudent {
  id?: StudentId;
  name: string;
  age: number;
  group: number;
}

export interface IStudentUpdate {
  name?: string;
  age?: number;
  group?: number;
}
