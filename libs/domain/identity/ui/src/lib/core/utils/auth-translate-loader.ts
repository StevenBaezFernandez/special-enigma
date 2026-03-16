import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class AuthTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string
  ) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/auth/${this.prefix}-${lang}.json`);
  }
}

export function createAuthTranslateLoader(http: HttpClient, prefix: string) {
  return new AuthTranslateLoader(http, prefix);
}
