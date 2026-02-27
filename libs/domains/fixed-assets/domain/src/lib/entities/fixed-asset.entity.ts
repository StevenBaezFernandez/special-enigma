import { v4 } from 'uuid';
import Decimal from 'decimal.js';
import { AssetStatus } from '../enums/asset-status.enum';

export class FixedAsset {
  readonly id: string;
  readonly tenantId: string;
  readonly acquisitionDate: Date;
  private _name: string;
  private _acquisitionCost: string;
  private _depreciationRate: number;
  private _status: AssetStatus;

  constructor(params: {
    tenantId: string;
    name: string;
    acquisitionCost: string;
    depreciationRate: number;
    id?: string;
    acquisitionDate?: Date;
    status?: AssetStatus;
  }) {
    this.id = params.id ?? v4();
    this.tenantId = params.tenantId;
    this.acquisitionDate = params.acquisitionDate ?? new Date();
    this._name = params.name;
    this._acquisitionCost = params.acquisitionCost;
    this._depreciationRate = params.depreciationRate;
    this._status = params.status ?? AssetStatus.ACTIVE;
  }

  get name(): string {
    return this._name;
  }

  get acquisitionCost(): string {
    return this._acquisitionCost;
  }

  get depreciationRate(): number {
    return this._depreciationRate;
  }

  get status(): AssetStatus {
    return this._status;
  }

  calculateMonthlyDepreciation(): Decimal {
    const cost = new Decimal(this._acquisitionCost);
    const annualDepreciation = cost.mul(this._depreciationRate).div(100);
    return annualDepreciation.div(12);
  }

  getBookValue(monthsElapsed: number): Decimal {
    const cost = new Decimal(this._acquisitionCost);
    const depreciation = this.calculateMonthlyDepreciation().mul(monthsElapsed);
    const bookValue = cost.minus(depreciation);
    return bookValue.isNegative() ? new Decimal(0) : bookValue;
  }
}
