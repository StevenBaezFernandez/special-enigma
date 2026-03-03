export interface HardwareBridgePort {
  printTicket(content: string): Promise<{ success: boolean; message: string }>;
  readScale(): Promise<{ success: boolean; weight: number; unit: string }>;
  openDrawer(): Promise<{ success: boolean }>;
}

export const HARDWARE_BRIDGE_PORT = 'HARDWARE_BRIDGE_PORT';
