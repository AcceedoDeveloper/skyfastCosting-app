import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { TodoService } from "../../services/todo.services";
import { Store } from "@ngrx/store";
import * as TodoActions from '../store/todo.action';
import { catchError, exhaustMap, filter, map, of, withLatestFrom } from "rxjs";
import * as AuthSelectors from '../../auth/store/auth.selector';

@Injectable()
export class TodoEffects {
  private actions$ = inject(Actions);
  private todoService = inject(TodoService);
  private store = inject(Store);

  //loadtoods
  laodTodos$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TodoActions.loadTodos),
    withLatestFrom(this.store.select(AuthSelectors.selectUserId)),

    filter(([action, userId]) => userId != null),
    exhaustMap(([action, userId]) =>
      this.todoService.getTodos(userId!).pipe(
        map(todos =>
          TodoActions.loadTodosSuccess({todos})
        ),
        catchError(error => of(TodoActions.loadTodosFailure({error})))
      )
    )
  ));
  //update

    updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodo),
      withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => userId != null),
      exhaustMap(([action, userId]) =>
        this.todoService.updateTodo(action.todo, userId!).pipe(
          map(todo => TodoActions.updateTodoSuccess({ todo })),
          catchError(error => of(TodoActions.updateTodoFailure({ error })))
        )
      )
    )
  );

  //add
  addTodos$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TodoActions.addTodo),
    withLatestFrom(this.store.select(AuthSelectors.selectUserId)),

    filter(([action, userId]) => userId != null),
    exhaustMap(([action, userId]) =>
      this.todoService.addTodo(action.task, userId!).pipe(
        map(todo =>
          TodoActions.addTodoSuccess({todo})
        ),
        catchError(error => of(TodoActions.addTodoFailure({error})))
      )
    )
  ))
  //delete
   deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodo),
      withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => userId != null),
      exhaustMap(([action, userId]) =>
        this.todoService.deleteTodo(action.todoId, userId!).pipe(
          map(() => TodoActions.deleteTodoSuccess({ todoId: action.todoId })),
          catchError(error => of(TodoActions.deleteTodoFailure({ error })))
        )
      )
    )
  );

}