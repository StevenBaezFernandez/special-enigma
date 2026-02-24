import { Injectable, Inject } from '@nestjs/common';
import { CreateSupplierDto } from '@virteex/contracts-purchasing-contracts';
import { Supplier, ISupplierRepository, SUPPLIER_REPOSITORY, SupplierType } from '@virteex/domain-purchasing-domain';

@Injectable()
export class CreateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly supplierRepo: ISupplierRepository
  ) {}

  async execute(dto: CreateSupplierDto, tenantId: string): Promise<Supplier> {
    const existing = await this.supplierRepo.findByTaxId(tenantId, dto.taxId);
    if (existing) {
      throw new Error(`Supplier with Tax ID ${dto.taxId} already exists.`);
    }

    // Cast to Domain Enum if necessary, or assume validation passes
    const type = dto.type as unknown as SupplierType;

    const supplier = new Supplier(tenantId, dto.name, dto.taxId, type);
    supplier.email = dto.email;
    supplier.phoneNumber = dto.phoneNumber;
    supplier.address = dto.address;

    await this.supplierRepo.save(supplier);
    return supplier;
  }
}
