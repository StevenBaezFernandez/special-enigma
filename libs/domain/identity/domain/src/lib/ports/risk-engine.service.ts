export abstract class RiskEngineService {
  abstract calculateRisk(context: { ip: string; country?: string; userAgent?: string; email?: string }): Promise<number>;
}
