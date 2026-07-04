export interface IStudentFavoriteRepository {
  listProfessionalIds(studentId: string): Promise<string[]>;
  toggle(studentId: string, professionalId: string): Promise<{ favorited: boolean }>;
  countReceivedByProfessional(professionalId: string): Promise<number>;
}
