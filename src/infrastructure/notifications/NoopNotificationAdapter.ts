import { INotificationPort } from '../../application/ports/output/INotificationPort';

export class NoopNotificationAdapter implements INotificationPort {
  async sendMatchNotification(professionalId: string, studentName: string): Promise<void> {
    console.log(`[Notification] Match for professional ${professionalId} with student ${studentName}`);
  }

  async sendSessionBookingConfirmation(sessionId: string, recipientUserId: string): Promise<void> {
    console.log(`[Notification] Session ${sessionId} confirmed for user ${recipientUserId}`);
  }

  async sendSessionCancellation(sessionId: string, recipientUserId: string, reason?: string): Promise<void> {
    console.log(`[Notification] Session ${sessionId} cancelled for user ${recipientUserId}. Reason: ${reason}`);
  }
}
