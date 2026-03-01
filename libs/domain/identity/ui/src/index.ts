import { Observable, of } from 'rxjs';
export * from './lib/lib.routes';
export * from './lib/services/auth.service';

export class UsersService {
    updateProfile(data: any): Observable<any> { return of({}); }
}
