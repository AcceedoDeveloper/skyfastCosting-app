import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TodosState } from "../../model/todo.model";
import * as fromTodos from './todo.reducer';

export const selectTodosState = createFeatureSelector<TodosState>(fromTodos.todosfeatureKey);


export const selectAllTodos = createSelector(
  selectTodosState,
  (state) => state.items
);

export const selectTodosLoading = createSelector(
  selectTodosState,
  (state) => state.loading
);

export const selectTodosError = createSelector(
  selectTodosState,
  (state) => state.error
);


//items
//loading
//error