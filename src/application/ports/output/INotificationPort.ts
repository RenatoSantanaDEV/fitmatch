export interface INotificationPort {
  sendMatchNotification(professionalId: string, studentName: string): Promise<void>;
  sendSessionBookingConfirmation(sessionId: string, recipientUserId: string): Promise<void>;
  sendSessionCancellation(sessionId: string, recipientUserId: string, reason?: string): Promise<void>;
}
