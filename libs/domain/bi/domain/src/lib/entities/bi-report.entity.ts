


import { v4 } from 'uuid';

export class BiReport {

  id: string = v4();

  tenantId!: string;


    name!: string;

    type!: string;

    data!: any;

    generatedAt: Date = new Date();

  constructor(tenantId: string, name: string, type: string, data: any) {
    this.tenantId = tenantId;
    this.name = name;
    this.type = type;
    this.data = data;
    this.generatedAt = new Date();
  }
}
