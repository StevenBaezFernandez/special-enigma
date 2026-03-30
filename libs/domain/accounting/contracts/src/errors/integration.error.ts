export class IntegrationError extends Error {
  constructor(module: string, message: string) {
    super(`Integration error in ${module}: ${message}`);
    this.name = 'IntegrationError';
  }
}
