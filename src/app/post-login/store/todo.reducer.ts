import { createReducer, on } from "@ngrx/store";
import { TodosState } from "../../model/todo.model";
import * as TodoActions from '../store/todo.action';

export const todosfeatureKey = 'todos';

export const initialTodoState : TodosState = {
  items : [],
  loading : false,
  error : null
};

export const todosReducer = createReducer(
  initialTodoState,

  on(TodoActions.loadTodos, (state)=> ({
    ...state,
    loading : true,
    error : null
  })),

  on(TodoActions.loadTodosSuccess, (state, {todos}) => ({
    ...state,
    items : todos,
    loading : false
  })),

    on(TodoActions.loadTodosFailure, (state, {error}) => ({
    ...state,
    error : error.message || 'Failed to load messages',
    loading : false
  })),

  //add todos
  on(TodoActions.addTodo, (state) => ({
    ...state,
    loading: true,
    error : null
  })),

  on(TodoActions.addTodoSuccess, (state, {todo}) => ({
    ...state,
    loading: false,
    items : [...state.items, todo],
  })),


    on(TodoActions.addTodoFailure, (state, {error}) => ({
    ...state,
    error : error.message || 'Failed to add todo',
    loading : false
  })),

  //update todos
  on(TodoActions.updateTodo, (state) => ({
    ...state,
    loading: true,
    error : null
  })),

  on(TodoActions.updateTodoSuccess, (state, {todo}) => ({
    ...state,
    loading: false,
    items : state.items.map(item => item.id === todo.id ? todo : item),
  })),


    on(TodoActions.updateTodoFailure, (state, {error}) => ({
    ...state,
    error : error.message || 'Failed to update todo',
    loading : false
  })),

    on(TodoActions.deleteTodo, (state) => ({
    ...state,
    loading: true,
    error : null
  })),

  on(TodoActions.deleteTodoSuccess, (state, {todoId}) => ({
    ...state,
    loading: false,
    items : state.items.filter(item => item.id !== todoId)
  })),


    on(TodoActions.deleteTodoFailure, (state, {error}) => ({
    ...state,
    error : error.message || 'Failed to delete todo',
    loading : false
  })),



  //delete todos
)