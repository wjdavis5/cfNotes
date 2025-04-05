import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { QUILL_CONFIG_TOKEN, QuillModule } from 'ngx-quill';
import { apiUrlInterceptor } from './interceptors/api-url.interceptor';
import { csrfInterceptor } from './interceptors/csrf.interceptor';
import { EnvironmentService } from './services/environment.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    // Conditionally add CSRF interceptor based on environment
    {
      provide: 'APP_INITIALIZER',
      useFactory: (envService: EnvironmentService) => {
        // Log API info on startup
        return () => {
          envService.logApiInfo();
        };
      },
      deps: [EnvironmentService],
      multi: true
    },
    // CSRF protection temporarily disabled for debugging
    provideHttpClient(withInterceptors([
      // csrfInterceptor, // Temporarily disabled for debugging
      apiUrlInterceptor
    ])),
    provideAnimations(),
    importProvidersFrom(
      QuillModule.forRoot({
        modules: {
          syntax: false,
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
          ]
        },
        theme: 'snow',
        debug: 'error',
        bounds: 'document.body',
        formats: [
          'bold', 'italic', 'underline', 'strike',
          'blockquote', 'code-block',
          'header', 'list', 'indent',
          'link', 'image'
        ]
      })
    )
  ]
};
