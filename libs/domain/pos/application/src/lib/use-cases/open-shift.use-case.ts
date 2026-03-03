import { Inject, Injectable } from '@nestjs/common';
import { PosRepository } from '@virteex/domain-pos-domain';
import { PosShift } from '@virteex/domain-pos-domain';

@Injectable()
export class OpenShiftUseCase {
  constructor(
    @Inject('PosRepository') private readonly posRepository: PosRepository
  ) {}

  async execute(tenantId: string, terminalId: string, userId: string, openingBalance: string): Promise<PosShift> {
    const existing = await this.posRepository.findActiveShift(tenantId, terminalId);
    if (existing) {
        throw new Error('There is already an active shift for this terminal.');
    }

    const shift = new PosShift(tenantId, terminalId, userId, openingBalance);
    await this.posRepository.saveShift(shift);
    return shift;
  }
}
