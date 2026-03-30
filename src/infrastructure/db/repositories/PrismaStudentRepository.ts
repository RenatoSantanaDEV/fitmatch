import { PrismaClient } from '@prisma/client';
import { IStudentRepository } from '../../../application/ports/output/IStudentRepository';
import { Student } from '../../../domain/entities/Student';
import { StudentMapper } from '../mappers/StudentMapper';

export class PrismaStudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Student | null> {
    const raw = await this.prisma.student.findUnique({ where: { id } });
    return raw ? StudentMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const raw = await this.prisma.student.findUnique({ where: { userId } });
    return raw ? StudentMapper.toDomain(raw) : null;
  }

  async save(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const raw = await this.prisma.student.create({
      data: {
        userId: student.userId,
        fitnessGoals: student.fitnessGoals,
        experienceLevel: student.experienceLevel,
        preferredModality: student.preferredModality,
        preferredSpecializations: student.preferredSpecializations,
        bio: student.bio,
        locationStreet: student.preferredLocation?.street,
        locationCity: student.preferredLocation?.city,
        locationState: student.preferredLocation?.state,
        locationCountry: student.preferredLocation?.country,
        locationPostal: student.preferredLocation?.postalCode,
        locationLat: student.preferredLocation?.latitude,
        locationLng: student.preferredLocation?.longitude,
        budgetMin: student.budgetRange?.min,
        budgetMax: student.budgetRange?.max,
        budgetCurrency: student.budgetRange?.currency,
      },
    });
    return StudentMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Omit<Student, 'id' | 'userId' | 'createdAt'>>): Promise<Student> {
    const raw = await this.prisma.student.update({
      where: { id },
      data: {
        fitnessGoals: data.fitnessGoals,
        experienceLevel: data.experienceLevel,
        preferredModality: data.preferredModality,
        preferredSpecializations: data.preferredSpecializations,
        bio: data.bio,
        locationStreet: data.preferredLocation?.street,
        locationCity: data.preferredLocation?.city,
        locationState: data.preferredLocation?.state,
        locationCountry: data.preferredLocation?.country,
        locationPostal: data.preferredLocation?.postalCode,
        locationLat: data.preferredLocation?.latitude,
        locationLng: data.preferredLocation?.longitude,
        budgetMin: data.budgetRange?.min,
        budgetMax: data.budgetRange?.max,
        budgetCurrency: data.budgetRange?.currency,
      },
    });
    return StudentMapper.toDomain(raw);
  }
}
