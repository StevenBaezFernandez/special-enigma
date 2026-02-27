export class StockDataInconsistencyError extends Error {
  constructor(stockId: string) {
    super(`Data inconsistency for stock ${stockId}: stock quantity exists but batches are missing or insufficient.`);
    this.name = 'StockDataInconsistencyError';
  }
}
