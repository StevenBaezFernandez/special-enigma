import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { APP_CONFIG, AppConfig, getBffUrl, API_URL } from '@virteex/shared-config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(),
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: API_URL,
      useFactory: (config: AppConfig) => getBffUrl('pos', config.apiUrl),
      deps: [APP_CONFIG]
    }
  ],
};
