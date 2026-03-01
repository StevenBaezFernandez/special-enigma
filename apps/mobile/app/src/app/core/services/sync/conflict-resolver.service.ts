import { Injectable, EventEmitter } from '@angular/core';
import { ConflictStrategy } from './sync.types';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConflictResolverService {
  public manualConflict$ = new EventEmitter<{ url: string, payload: unknown, error: unknown }>();

  constructor(private readonly http: HttpClient) {}

  async resolve(strategy: ConflictStrategy, error: any, context: { url: string, payload: unknown, method: string }) {
    console.warn(`Conflict detected for ${context.url} with strategy: ${strategy}`);

    if (strategy === 'clientWins') {
      console.log(`Retrying ${context.url} with force semantics (Client Wins)`);
      // Re-issue request with a special header or query param that the backend understands as "force"
      return await firstValueFrom(this.http.request(context.method, context.url, {
          body: context.payload,
          headers: { 'X-Virteex-Conflict-Resolution': 'force-client' }
      }));
    }

    if (strategy === 'manual') {
      console.log(`Broadcasting manual conflict for user intervention.`);
      this.manualConflict$.emit({ url: context.url, payload: context.payload, error });
      return { conflict: true, manualResolutionRequired: true, error };
    }

    if (strategy === 'serverWins') {
        console.log(`Server wins. Discarding local change for ${context.url}`);
        return { conflict: true, message: 'Server wins: local change discarded.', remoteData: error.remoteData };
    }

    throw error;
  }
}
