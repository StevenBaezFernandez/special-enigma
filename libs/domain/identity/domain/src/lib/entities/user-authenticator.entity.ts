import { v4 as uuidv4 } from 'uuid';

export class UserAuthenticator {
  id: string = uuidv4();
  credentialID!: Uint8Array;
  publicKey!: Uint8Array;
  counter!: number;
  credentialDeviceType!: string;
  credentialBackedUp!: boolean;
  transports?: string[]; // e.g., 'usb', 'ble', 'nfc', 'internal'

  constructor(
    credentialID: Uint8Array,
    publicKey: Uint8Array,
    counter: number,
    credentialDeviceType: string,
    credentialBackedUp: boolean,
    transports?: string[]
  ) {
    this.credentialID = credentialID;
    this.publicKey = publicKey;
    this.counter = counter;
    this.credentialDeviceType = credentialDeviceType;
    this.credentialBackedUp = credentialBackedUp;
    this.transports = transports;
  }
}
