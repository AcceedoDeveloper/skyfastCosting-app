import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  APP_INITIALIZER,
   importProvidersFrom 
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ActionReducer, provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';


import * as fromAuth from './auth/store/auth.reducer';
import * as fromTodos from './post-login/store/todo.reducer';
import * as fromSystem from './master/system-organization/store/system.reducer';
import { AuthEffects } from './auth/store/auth.effects';
import { TodoEffects } from './post-login/store/todo.effects';
import { RoleEffects} from './master/system-organization/store/system.effects';
import { ConfigService} from './shared/config.service';
import {appReducers } from './store/app.state';


import { localStorageSync } from 'ngrx-store-localstorage';

import { provideHttpClient } from '@angular/common/http';


//AUth State

const authStateKeyToSync = [fromAuth.authFeatureKey] ///auth state


function authLocalStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: authStateKeyToSync,
    rehydrate: true,
    storage: window.localStorage,
    removeOnUndefined: true
  })(reducer);
}

const metaReducers = [authLocalStorageSyncReducer];

export function initializeApp(configService: ConfigService) {
  return () => configService.load();
}


export const appConfig: ApplicationConfig = {
 providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
     provideStore(appReducers, { metaReducers }),
   


    provideEffects([AuthEffects, TodoEffects, RoleEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore(),
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
     provideAnimations(),
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      })
    )
  ],
};
