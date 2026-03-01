
export class TaxLine {
    id!: string;

    taxName!: string;

    rate!: string;

    amount!: string;

  constructor(taxName: string, rate: string, amount: string) {
    this.taxName = taxName;
    this.rate = rate;
    this.amount = amount;
  }
}
