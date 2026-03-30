export interface Certification {
  readonly id: string;
  readonly professionalId: string;
  readonly name: string;
  readonly issuingBody: string;
  readonly issueDate: Date;
  readonly expiryDate?: Date;
  readonly documentUrl?: string;
  readonly isVerified: boolean;
  readonly createdAt: Date;
}
