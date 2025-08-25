import { Component, OnInit, inject } from '@angular/core';
import { Shift} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllShift } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AddShiftComponent} from './add-shift/add-shift.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';



@Component({
  selector: 'app-shift-management',
  imports: [
    FormsModule,
    MatIconModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './shift-management.component.html',
  styleUrl: './shift-management.component.scss'
})
export class ShiftManagementComponent implements OnInit {

  shift$!: Observable<Shift[]>;
   private dialog = inject(MatDialog); 

    constructor(private store : Store){}

  ngOnInit(): void {

      this.shift$ = this.store.select(selectAllShift);
  this.shift$.subscribe(roles => {
    console.log('Roles from store:', roles);
  });

  this.store.dispatch(RoleActions.loadshift());
  }

  
  openAddShift() {
  this.dialog.open(AddShiftComponent, {
        width: '500px',
        height:'500px',
        data: {}         
      });
    }

editShift(shift: Shift) {
  this.dialog.open(AddShiftComponent, {
    width: '500px',
    data: shift   // ✅ pass shift to dialog
  });
}


  deleteShift(id: string) {
    console.log('id', id);
    
   this.store.dispatch(RoleActions.deleteShift({ id}))
  }

}
