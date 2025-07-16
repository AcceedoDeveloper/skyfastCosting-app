import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {  Observable, throwError } from "rxjs";
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { AuthResponse, User } from "../model/auth.model";
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn : 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private usersUrl = 'http://localhost:3000/users';

  //resister


  register(credentials : {name : string, email : string, password : string}) : Observable<User>{
    const newUser : User = {
      id : uuidv4(),
      name : credentials.name,
      email : credentials.email.toLowerCase()
    };

    const userToSave = {...newUser, password : credentials.password}

    //chec k is user exist
    return this.http.get<User[]>(`${this.usersUrl}?email=${credentials.email.toLowerCase()}`).pipe(
      switchMap(exisitingUsers => {
        if(exisitingUsers.length > 0){
          return throwError(() => new Error('email already exist in DB.'));
        }

        return this.http.post<User>(this.usersUrl, userToSave).pipe(
          map(() => newUser)
        )
      }),
      catchError(this.handleError)
    );

  }

  //login

  login(credentials : {email : string; password : string}) : Observable<AuthResponse>{
    return this.http.get<any[]>(`${this.usersUrl}?email=${credentials.email.toLowerCase()}&password=${credentials.password}`).pipe(
      map(users => {
        if(users.length > 0){
          const user = users[0];

          const {password, ...userWithoutPassword} = user;

          return {
            user : userWithoutPassword,
            accessToken : `mockToken-${user.id}-${new Date().getTime()}` /// simple mock token
          }

        }else{
          throw new Error('Invalid email or password');
        }
      }),
       catchError(this.handleError)
    )
  }



    private handleError(error: any): Observable<never> {
    console.error('AuthService Error:', error);
    let errorMessage = 'An unknown error occurred during authentication.';
    if (error.message) {
        errorMessage = error.message;
    } else if (error.status) {
        errorMessage = `Server error: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }

}