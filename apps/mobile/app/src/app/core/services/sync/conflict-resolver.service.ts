import { Injectable } from '@angular/core';
import { ConflictStrategy } from './sync.types';

@Injectable({ providedIn: 'root' })
export class ConflictResolverService {
  resolve(strategy: ConflictStrategy, error: unknown) {
    if (strategy === 'clientWins') {
      return { conflict: true, message: 'Conflict detected; retry with force semantics is not yet supported.' };
    }

    if (strategy === 'manual') {
      return { conflict: true, manualResolutionRequired: true, error };
    }

    throw error;
  }
}
