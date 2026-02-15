export class MissingTaxTableException extends Error {
  constructor(year: number, type: string) {
    super(`No tax tables found for year ${year} and type ${type}`);
    this.name = 'MissingTaxTableException';
  }
}
