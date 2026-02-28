import { Injectable, Inject } from '@nestjs/common';
import { RiskEvaluatorService, GEO_IP_PORT, GeoIpPort, ContextAnalysis } from '@virteex/domain-identity-domain';

export interface CheckSecurityContextCommand {
  urlCountry: string;
  ip: string;
}

@Injectable()
export class CheckSecurityContextUseCase {
  constructor(
    private readonly riskEvaluatorService: RiskEvaluatorService,
    @Inject(GEO_IP_PORT) private readonly geoIpPort: GeoIpPort
  ) {}

  async execute(command: CheckSecurityContextCommand): Promise<ContextAnalysis> {
    const { urlCountry, ip } = command;
    const geo = await this.geoIpPort.lookup(ip);
    const ipCountry = geo ? geo.country : null;
    return this.riskEvaluatorService.analyzeContext(urlCountry, ipCountry);
  }
}
