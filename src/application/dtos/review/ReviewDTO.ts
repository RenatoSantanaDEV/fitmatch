export interface SubmitReviewDTO {
  sessionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  isPublic?: boolean;
}

export interface ReviewResponseDTO {
  id: string;
  sessionId: string;
  studentId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
  createdAt: Date;
}
