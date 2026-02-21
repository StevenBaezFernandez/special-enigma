import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { v4 as uuidv4 } from 'uuid';

jeepSqlite(window);

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  public isReady = signal<boolean>(false);

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.init(); // Auto-init on load or call explicitly? Better call explicitly in app init.
    // For now, call in constructor to ensure it starts, or let SyncService call it.
  }

  async init() {
    if (this.isReady()) return;

    try {
      if (Capacitor.getPlatform() === 'web') {
        const jeepEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepEl);
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
      }

      this.db = await this.sqlite.createConnection(
        'virteex_offline_db',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();

      // Define Schema
      const schema = `
        CREATE TABLE IF NOT EXISTS warehouses (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT,
          location TEXT,
          updated_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT,
          price REAL,
          updated_at INTEGER
        );
      `;

      await this.db.execute(schema);
      this.isReady.set(true);
      console.log('Database initialized successfully');

    } catch (e) {
      console.error('Database initialization failed', e);
    }
  }

  async upsertWarehouses(warehouses: any[]) {
      if (!this.db) {
          console.warn('DB not ready for upsert');
          return;
      }

      const statement = `INSERT OR REPLACE INTO warehouses (id, code, name, location, updated_at) VALUES (?, ?, ?, ?, ?)`;

      const set = warehouses.map(w => [
          w.id || uuidv4(),
          w.code || '',
          w.name || '',
          w.location || '',
          Date.now()
      ]);

      if (set.length === 0) return;

      try {
          const changes = await this.db.executeSet([
              { statement, values: set }
          ]);
          console.log('Upserted warehouses:', changes);
      } catch (e) {
          console.error('Failed to upsert warehouses', e);
          throw e;
      }
  }

  async getWarehouses(): Promise<any[]> {
      if (!this.db) {
          // Fallback or wait?
          if (!this.isReady()) {
              console.warn('DB not ready, returning empty array');
          }
          return [];
      }

      try {
          const result = await this.db.query('SELECT * FROM warehouses ORDER BY name ASC');
          return result.values || [];
      } catch (e) {
          console.error('Failed to query warehouses', e);
          return [];
      }
  }
}
