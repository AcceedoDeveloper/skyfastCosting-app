import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromAuthSelector from '../store/auth.selector';
import * as AuthActions from '../store/auth.action';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-regsister',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './regsister.component.html',
  styleUrl: './regsister.component.scss'
})
export class RegsisterComponent {
   private store = inject(Store);

  isLoading$! : Observable<boolean>;
  error$! : Observable<string | null>

  constructor(){
    this.isLoading$ = this.store.select(fromAuthSelector.selectAuthLoading);
    this.error$ = this.store.select(fromAuthSelector.selectAuthError);
  }

  onSubmit(form : NgForm){
    if(form.invalid){
      return;
    }
    const {name, email, password} = form.value;
    this.store.dispatch(AuthActions.registerUser({credentials : {name, email, password}}));
  }

}
