
import { SupplierType } from '../enums/supplier-type.enum';


export class Supplier {

  id!: string;


    tenantId!: string;


    name!: string;

    taxId!: string;


  type!: SupplierType;

    email?: string;

    phoneNumber?: string;

    address?: string;


    createdAt: Date = new Date();

  constructor(tenantId: string, name: string, taxId: string, type: SupplierType) {
    this.tenantId = tenantId;
    this.name = name;
    this.taxId = taxId;
    this.type = type;
  }
}
