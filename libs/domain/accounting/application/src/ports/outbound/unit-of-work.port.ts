export interface IUnitOfWork {
  transactional<T>(fn: () => Promise<T>): Promise<T>;
}

export const I_UNIT_OF_WORK = 'I_UNIT_OF_WORK';
