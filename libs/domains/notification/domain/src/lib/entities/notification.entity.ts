export class Notification {
  constructor(
    public readonly id: string,
    public readonly recipient: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly type: 'EMAIL' | 'SMS',
    public readonly status: 'PENDING' | 'SENT' | 'FAILED',
    public readonly sentAt?: Date
  ) {}
}
