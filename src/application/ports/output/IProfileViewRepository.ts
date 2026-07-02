export interface RecordViewInput {
  professionalId: string;
  viewerUserId: string;
}

export interface IProfileViewRepository {
  /** Idempotent — returns `recorded: false` if this viewer already viewed this profile today. */
  recordView(input: RecordViewInput): Promise<{ recorded: boolean }>;
  countTotal(professionalId: string): Promise<number>;
  countInRange(professionalId: string, from: Date, to: Date): Promise<number>;
  /** Total views across all professionals in a date range — used for platform-average comparisons. */
  countAllInRange(from: Date, to: Date): Promise<number>;
}
