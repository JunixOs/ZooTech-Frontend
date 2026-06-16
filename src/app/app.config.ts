import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { mockTriajeInterceptor } from '@core/interceptors/mock-triaje.interceptor';
import { environment } from '@env/environment';

// Module *Leche*

import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheService } from '@modules/leche/infraestructure/services/leche.service';

const interceptors = [errorInterceptor];
if (environment.useMock) {
  interceptors.push(mockTriajeInterceptor);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors(interceptors)),
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    {
      provide: LecheRepository,
      useClass: LecheService
    },
  ],
};
