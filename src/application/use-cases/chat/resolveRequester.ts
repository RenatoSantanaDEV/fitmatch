import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';

export interface RequesterIdentity {
  userId: string;
  studentId: string | null;
  professionalId: string | null;
}

export async function resolveRequester(
  userId: string,
  studentRepo: IStudentRepository,
  professionalRepo: IProfessionalRepository,
): Promise<RequesterIdentity> {
  const [student, professional] = await Promise.all([
    studentRepo.findByUserId(userId),
    professionalRepo.findByUserId(userId),
  ]);
  return {
    userId,
    studentId: student?.id ?? null,
    professionalId: professional?.id ?? null,
  };
}
