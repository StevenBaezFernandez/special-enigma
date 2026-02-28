import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DatabaseService } from '../database.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DownSyncService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly database: DatabaseService
  ) {}

  async syncWarehouses(): Promise<void> {
    const warehouses = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/inventory/warehouses`));
    if (Array.isArray(warehouses) && warehouses.length > 0) {
      await this.database.upsertWarehouses(warehouses);
    }
  }
}
