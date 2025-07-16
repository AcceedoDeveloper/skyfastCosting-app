import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, switchMap, throwError } from "rxjs";
import { Todo } from "../model/todo.model";
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root'
})

export class TodoService {
 private http = inject(HttpClient);

 private todosurl = 'http://localhost:3000/todos';

 //getTodos
 getTodos(userId: string): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.todosurl}?userId=${userId}`).pipe(
      catchError(this.handleError)
    );
  }


 //addTodo
 addTodo(task : string, userId : string) : Observable<Todo>{
  const newTodo : Todo = {
    id : uuidv4(),
    userId,
    task,
    completed : false,
    createdAt : new Date().toISOString()
  };

  return this.http.post<Todo>(this.todosurl, newTodo).pipe(
    catchError(this.handleError)
  );
 }

 //updateTodo
 updateTodo(todoUpdate : Partial<Todo> & {id : string}, userId : string) : Observable<Todo>{
  return this.http.get<Todo>(`${this.todosurl}/${todoUpdate.id}`).pipe(
    map(todo => {
      if(todo.userId !== userId){
        //
        throw new Error('Unaouthrized to update this Todo')
      }
      return todo;
    }),

    switchMap(() => this.http.patch<Todo>(`${this.todosurl}/${todoUpdate.id}`, todoUpdate)),
    catchError(this.handleError)
  );
 }
 //deleteTodo

    deleteTodo(todoId: string, userId: string): Observable<{}> {
     return this.http.get<Todo>(`${this.todosurl}/${todoId}`).pipe(
        map(todo => {
            if (todo.userId !== userId) {
                throw new Error('Unauthorized to delete this todo.');
            }
            return todo;
        }),
        switchMap(() => this.http.delete<{}>(`${this.todosurl}/${todoId}`)),
        catchError(this.handleError)
    );
  }

   private handleError(error: any): Observable<never> {
    console.error('TodoService Error:', error);
    return throwError(() => new Error(error.message || 'Todo service error'));
  }
}