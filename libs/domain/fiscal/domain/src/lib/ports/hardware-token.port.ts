export interface HardwareTokenInfo {
    id: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

export interface HardwareTokenPort {
    isAvailable(): Promise<boolean>;
    listAvailableTokens(): Promise<HardwareTokenInfo[]>;
    signData(tokenId: string, pin: string, data: string): Promise<string>;
    getCertificate(tokenId: string): Promise<string>;
}

export const HARDWARE_TOKEN_PORT = Symbol('HARDWARE_TOKEN_PORT');
