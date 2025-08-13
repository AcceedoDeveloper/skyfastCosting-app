import { ActionReducerMap } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';

import { TodoState, todoReducer } from '../post-login/store/todo.reducer';
import { RoleState, roleReducer } from '../master/system-organization/store/system.reducer';
import { AuthState, authReducer, authFeatureKey } from '../auth/store/auth.reducer';
import { MachineTypeState,  machineTypeReducer, machineTypeFeatureKey } from '../master/entity-management/store/entity.reducer';

export interface AppState {
  router: any;  // router state
   [authFeatureKey]: AuthState;
  todos: TodoState;
  roles: RoleState;
   [machineTypeFeatureKey]: MachineTypeState;
}

export const appReducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  [authFeatureKey]: authReducer,
  todos: todoReducer,
  roles: roleReducer,
  [machineTypeFeatureKey]: machineTypeReducer
};
