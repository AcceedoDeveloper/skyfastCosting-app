import { createAction, props } from "@ngrx/store";
import { Todo } from "../../model/todo.model";

//loading
export const loadTodos = createAction(
  '[To do page] load to dods'
);

export const loadTodosSuccess = createAction(
  '[To do API] to do list success',
  props<{todos : Todo[]}>()
);

export const loadTodosFailure = createAction(
  '[To do Api] to do failed',
    props<{error : any}>()
);

export const addTodo = createAction('[To-Do Page] Add To-Do', props<{ task: string }>());
export const addTodoSuccess = createAction('[To-Do API] Add To-Do Success', props<{ todo: Todo }>());
export const addTodoFailure = createAction('[To-Do API] Add To-Do Failure', props<{ error: any }>());

export const updateTodo = createAction('[To-Do Page] Update To-Do', props<{ todo: Partial<Todo> & { id: string } }>());
export const updateTodoSuccess = createAction('[To-Do API] Update To-Do Success', props<{ todo: Todo }>());
export const updateTodoFailure = createAction('[To-Do API] Update To-Do Failure', props<{ error: any }>());

export const deleteTodo = createAction('[To-Do Page] Delete To-Do', props<{ todoId: string }>());
export const deleteTodoSuccess = createAction('[To-Do API] Delete To-Do Success', props<{ todoId: string }>());
export const deleteTodoFailure = createAction('[To-Do API] Delete To-Do Failure', props<{ error: any }>());