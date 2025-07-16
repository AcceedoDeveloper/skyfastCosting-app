import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Todo } from '../../model/todo.model';
import * as TodoActions from '../store/todo.action';
import * as TodoSelectors from '../store/todo.selector';

@Component({
  selector: 'app-postlogin',
  imports: [CommonModule, FormsModule],
  templateUrl: './postlogin.component.html',
  styleUrl: './postlogin.component.scss'
})
export class PostloginComponent {
   private store = inject(Store);

  todos$: Observable<Todo[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  newTask: string = '';
  editingTodo: Todo | null = null;
  updatedTask: string = '';


  constructor() {
    this.todos$ = this.store.select(TodoSelectors.selectAllTodos);
    this.isLoading$ = this.store.select(TodoSelectors.selectTodosLoading);
    this.error$ = this.store.select(TodoSelectors.selectTodosError);
  }

  ngOnInit(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  addTodo(): void {
    if (!this.newTask.trim()) return;
    this.store.dispatch(TodoActions.addTodo({ task: this.newTask.trim() }));
    this.newTask = ''; // Clear input
  }

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.store.dispatch(TodoActions.updateTodo({ todo: updatedTodo }));
  }

  deleteTodo(todoId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
        this.store.dispatch(TodoActions.deleteTodo({ todoId }));
    }
  }

  startEdit(todo: Todo): void {
    this.editingTodo = { ...todo }; // Clone to avoid mutating state directly
    this.updatedTask = todo.task;
  }

  cancelEdit(): void {
    this.editingTodo = null;
    this.updatedTask = '';
  }

  saveEdit(): void {
    if (this.editingTodo && this.updatedTask.trim()) {
      const todoToUpdate = { ...this.editingTodo, task: this.updatedTask.trim() };
      this.store.dispatch(TodoActions.updateTodo({ todo: todoToUpdate }));
      this.cancelEdit();
    }
  }
   trackById(index: number, item: Todo): string {
    return item.id;
  }

}
