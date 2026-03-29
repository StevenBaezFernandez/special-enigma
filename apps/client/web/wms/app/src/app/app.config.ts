import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { APP_CONFIG, AppConfig, getBffUrl, API_URL } from '@virteex/shared-config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: API_URL,
      useFactory: (config: AppConfig) => getBffUrl('wms', config.apiUrl),
      deps: [APP_CONFIG]
    }
  ],
};
