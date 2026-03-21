import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  isDevMode
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@virteex/shared-util-auth';
import { errorInterceptor } from '@virteex/shared-ui';
import { loadingInterceptor } from '@virteex/shared-util-http';
import { globalErrorInterceptor } from './core/interceptors/global-error.interceptor';
import { APP_CONFIG, AppConfig, getBffUrl, API_URL } from '@virteex/shared-config';
import { environment } from '../environments/environment';
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
      provideAnimations(),
      provideRouter(appRoutes),
      provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor, globalErrorInterceptor])),
      provideStore(
        {},
        {
          metaReducers: [],
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }
      ),
      provideEffects([]),
      provideStoreDevtools({
        maxAge: 25,
        logOnly: !isDevMode(),
        autoPause: true,
        trace: false,
        traceLimit: 75,
      }),
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
        useFactory: (config: AppConfig) => getBffUrl('portal', config.apiUrl),
        deps: [APP_CONFIG]
      }
  ],
};
