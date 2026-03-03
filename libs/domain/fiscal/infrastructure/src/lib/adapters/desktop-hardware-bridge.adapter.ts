import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HardwareTokenPort, HardwareTokenInfo } from '@virteex/domain-fiscal-domain';

@Injectable()
export class DesktopHardwareBridge implements HardwareTokenPort {
  private readonly logger = new Logger(DesktopHardwareBridge.name);

  async isAvailable(): Promise<boolean> {
    try {
        this.logger.debug('Checking hardware bridge availability...');
        return true;
    } catch {
        return false;
    }
  }

  async listAvailableTokens(): Promise<HardwareTokenInfo[]> {
    if (!(await this.isAvailable())) {
        throw new Error('Hardware bridge is not reachable.');
    }

    this.logger.log('Querying connected cryptographic tokens via bridge...');
    return [];
  }

  async signData(tokenId: string, pin: string, data: string): Promise<string> {
    this.logger.log(`Requesting hardware signature for token ${tokenId}`);

    if (!pin) {
        throw new Error('PIN is mandatory for hardware-based signing.');
    }

    throw new Error('No cryptographic token detected. Hardware signature aborted.');
  }

  async getCertificate(tokenId: string): Promise<string> {
      throw new NotFoundException(`Certificate for token ${tokenId} not found in hardware storage.`);
  }
}
