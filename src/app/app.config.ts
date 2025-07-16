import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ActionReducer, provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';


import * as fromAuth from './auth/store/auth.reducer';
import * as fromTodos from './post-login/store/todo.reducer';
import { AuthEffects } from './auth/store/auth.effects';
import { TodoEffects } from './post-login/store/todo.effects';



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


export const appConfig: ApplicationConfig = {
 providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore( {router : routerReducer}, {metaReducers}),
    provideState(fromAuth.authFeatureKey, fromAuth.authReducer),
    provideState(fromTodos.todosfeatureKey, fromTodos.todosReducer),
    provideEffects([AuthEffects, TodoEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore(),
  ],
};
