export interface DatabasePort {
  getSchemaGenerator()  : any;
  getMigrator()  : any;
  forkEntityManager()  : any;
}

export const DATABASE_PORT = Symbol('DATABASE_PORT');
