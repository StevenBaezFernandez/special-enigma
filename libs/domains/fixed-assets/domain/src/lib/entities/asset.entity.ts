import { v4 } from 'uuid';
import { AssetStatus } from '../enums/asset-status.enum';
import { DepreciationMethod } from '../enums/depreciation-method.enum';
import type { Depreciation } from './depreciation.entity';

export class Asset {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly purchaseDate: Date;
  readonly purchaseCost: number;
  readonly residualValue: number;
  readonly usefulLifeMonths: number;
  readonly createdAt: Date;
  private _name: string;
  private _status: AssetStatus;
  private _depreciationMethod: DepreciationMethod;
  private readonly _depreciations: Depreciation[];
  private _updatedAt: Date;

  constructor(params: {
    tenantId: string;
    name: string;
    code: string;
    purchaseDate: Date;
    purchaseCost: number;
    residualValue: number;
    usefulLifeMonths: number;
    id?: string;
    status?: AssetStatus;
    depreciationMethod?: DepreciationMethod;
    depreciations?: Depreciation[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id ?? v4();
    this.tenantId = params.tenantId;
    this._name = params.name;
    this.code = params.code;
    this.purchaseDate = params.purchaseDate;
    this.purchaseCost = params.purchaseCost;
    this.residualValue = params.residualValue;
    this.usefulLifeMonths = params.usefulLifeMonths;
    this._status = params.status ?? AssetStatus.ACTIVE;
    this._depreciationMethod = params.depreciationMethod ?? DepreciationMethod.STRAIGHT_LINE;
    this._depreciations = params.depreciations ?? [];
    this.createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  get name(): string { return this._name; }
  get status(): AssetStatus { return this._status; }
  get depreciationMethod(): DepreciationMethod { return this._depreciationMethod; }
  get depreciations(): readonly Depreciation[] { return this._depreciations; }
  get updatedAt(): Date { return this._updatedAt; }
}
