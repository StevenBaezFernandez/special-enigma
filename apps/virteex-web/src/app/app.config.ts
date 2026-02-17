import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor, errorInterceptor } from '@virteex/shared-util-auth';
import { loadingInterceptor } from '@virteex/shared-util-http';
import { APP_CONFIG, AppConfig } from '@virteex/shared-config';
import { environment } from '../environments/environment';
import { API_URL } from '@virteex/shared-config';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(appRoutes),
      provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
      importProvidersFrom(
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ),
      { provide: APP_CONFIG, useValue: environment },
      {
        provide: API_URL,
        useFactory: (config: AppConfig) => config.apiUrl,
        deps: [APP_CONFIG]
      }
  ],
};
