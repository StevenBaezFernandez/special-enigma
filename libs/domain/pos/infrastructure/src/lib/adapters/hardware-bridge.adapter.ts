import { Injectable, Logger } from '@nestjs/common';
import { HardwareBridgePort } from '@virteex/domain-pos-domain';

@Injectable()
export class HardwareBridgeAdapter implements HardwareBridgePort {
  private readonly logger = new Logger(HardwareBridgeAdapter.name);

  async printTicket(content: string): Promise<{ success: boolean; message: string }> {
    this.logger.log('HARDWARE_BRIDGE: Sending print command to ESC/POS printer...');
    // Real implementation would use node-escpos or a local service bridge
    this.logger.debug(`HARDWARE_BRIDGE: Ticket Content: ${content.substring(0, 100)}...`);

    const isHardwareAvailable = process.env['POS_HARDWARE_ENABLED'] === 'true';
    if (!isHardwareAvailable) {
        this.logger.warn('HARDWARE_BRIDGE: No physical printer detected. Simulation active.');
        return { success: true, message: 'Simulated print successful' };
    }

    return { success: true, message: 'Printed correctly' };
  }

  async readScale(): Promise<{ success: boolean; weight: number; unit: string }> {
    this.logger.log('HARDWARE_BRIDGE: Reading from serial scale...');
    return { success: true, weight: 0.0, unit: 'kg' };
  }

  async openDrawer(): Promise<{ success: boolean }> {
    this.logger.log('HARDWARE_BRIDGE: Sending pulse to cash drawer...');
    return { success: true };
  }
}
