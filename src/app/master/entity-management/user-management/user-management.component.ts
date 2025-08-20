import { Component, OnInit, Type, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllUser } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';  // 👈 ADD THIS
import { MatTableModule } from '@angular/material/table';    
import { AddUserComponent} from './add-user/add-user.component';    
import { MatDialog, MatDialogModule } from '@angular/material/dialog';




@Component({
  selector: 'app-user-management',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
     MatTableModule,
    MatDialogModule 

  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent  implements OnInit {
  user$! : Observable<User[]>;
 
  users: User[] = [];
  paginatedUsers: User[] = [];
  pageSize = 5;
  pageIndex = 0;


  
private store = inject(Store);
private dialog = inject(MatDialog);



  ngOnInit(): void {
    this.user$ = this.store.select(selectAllUser);
   

    this.user$.subscribe(data => {
      this.users = data;
      console.log('data', data);
      
      this.updatePaginatedUsers();
    });

    this.store.dispatch(MachineTypeActions.loadUsers());
  }

  updatePaginatedUsers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

openAddUserPopup() {
 this.dialog.open(AddUserComponent, {
    width: '500px',
    data: null  
  });

 
}


openEditUserPopup(user: User) {
 this.dialog.open(AddUserComponent, {
    width: '500px',
    data: user   
  });
}


deleteUser(user: User) {
  if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
    this.store.dispatch(MachineTypeActions.deleteUser({ id: user._id }));
  }
}

}
