export interface IMessageBroker {
  publish(topic: string, payload: unknown): Promise<void>;
}

export const MESSAGE_BROKER = 'MESSAGE_BROKER';
