import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { httpRequestInterceptor } from './shared/interceptors/http-request.interceptor';
import { httpTokenRequestInterceptor } from './shared/interceptors/http-token-request.interceptor';
import { httpErrorRequestInterceptor } from './shared/interceptors/http-error-handle.interceptor';
import { DialogService } from 'primeng/dynamicdialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // for scrolling to Top Of pages
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // enable position restoration
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptors([
        httpRequestInterceptor,
        httpTokenRequestInterceptor,
        httpErrorRequestInterceptor,
      ])
    ),
    provideHttpClient(withFetch()),
    MessageService,
    ConfirmationService,
    DialogService,
    provideAnimationsAsync(),
    provideAnimations(), // required animations providers
  ],
};
