import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Module *Leche*

import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheService } from '@modules/leche/infraestructure/services/leche.service';
// Module "Sanidad"
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { TriajeService } from '@modules/sanidad/infrastructure/services/triaje.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    provideCharts(withDefaultRegisterables()),
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
      useClass: LecheService,
    },
    {
      provide: TriajeRepository,
      useClass: TriajeService,
    },
  ],
};
