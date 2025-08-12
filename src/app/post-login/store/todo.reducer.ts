import { createReducer, on } from '@ngrx/store';
import * as TodoActions from './todo.action';
import { Todo } from '../../model/todo.model';


export const todoFeatureKey = 'todos'; 

export interface TodoState {
  todos: Todo[];
  error: any;
}

export const initialState: TodoState = {
  todos: [],
  error: null
};

export const todoReducer = createReducer(
  initialState,

  // Load Todos
  on(TodoActions.loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos
  })),
  on(TodoActions.loadTodosFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Add Todo
  on(TodoActions.addTodoSuccess, (state, { todo }) => ({
    ...state,
    todos: [...state.todos, todo]
  })),
  on(TodoActions.addTodoFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Update Todo
 on(TodoActions.updateTodoSuccess, (state, { todo }) => ({
  ...state,
  todos: state.todos.map(t =>
    t.id === todo.id ? todo : t
  )
})),
  on(TodoActions.updateTodoFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Delete Todo
 on(TodoActions.deleteTodoSuccess, (state, { todoId }) => ({
  ...state,
  todos: state.todos.filter(todo => todo.id !== todoId)
})),

  on(TodoActions.deleteTodoFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
