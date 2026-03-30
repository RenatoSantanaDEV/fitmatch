import { Student } from '../../../domain/entities/Student';

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  save(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student>;
  update(id: string, data: Partial<Omit<Student, 'id' | 'userId' | 'createdAt'>>): Promise<Student>;
}
