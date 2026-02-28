import { BillOfMaterials } from '../entities/bill-of-materials.entity';

export const BILL_OF_MATERIALS_REPOSITORY = 'BillOfMaterialsRepository';

export interface BillOfMaterialsRepository {
  findById(id: string): Promise<BillOfMaterials | null>;
  findByProductSku(productSku: string): Promise<BillOfMaterials | null>;
  save(bom: BillOfMaterials): Promise<void>;
  findAll(): Promise<BillOfMaterials[]>;
}
