export type GradeId = number;

export interface IGrade {
  id?: GradeId;
  studentId: number;
  subjectId: number;
  grade: number;
  evaluatedAt?: Date;
}
