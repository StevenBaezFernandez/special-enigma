export interface FiscalStamp {
  uuid: string;
  selloSAT: string;
  selloCFD: string;
  fechaTimbrado: string;
  xml: string;
}

export interface PacProvider {
  stamp(xml: string): Promise<FiscalStamp>;
  cancel(uuid: string, rfc: string): Promise<boolean>;
}

export const PAC_PROVIDER = 'PAC_PROVIDER';
