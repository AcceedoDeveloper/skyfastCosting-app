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
import { ConfrimDialogComponent} from '../../../shared/confrim-dialog/confrim-dialog.component';



@Component({
  selector: 'app-shift-management',
  imports: [
    FormsModule,
    MatIconModule,
    CommonModule,
    MatDialogModule,
      MatButtonModule
  ],
  templateUrl: './shift-management.component.html',
  styleUrl: './shift-management.component.scss'
})
export class ShiftManagementComponent implements OnInit {

  shift$!: Observable<Shift[]>;
   private dialog = inject(MatDialog); 
  totalHours: number = 0;

    constructor(private store : Store){}

  ngOnInit(): void {

      this.shift$ = this.store.select(selectAllShift);
  this.shift$.subscribe(roles => {
    console.log('Roles from store:', roles);
    // compute total hours sum (derive from start/end when totalHours not present)
    this.totalHours = (roles || []).reduce((acc: number, s: any) => acc + this.getShiftHours(s), 0);
  });

  this.store.dispatch(RoleActions.loadshift());
  }

  
  openAddShift() {
  this.dialog.open(AddShiftComponent, {
       width: '410px',
      maxWidth: '35vw',
      maxHeight: '90vh',
        data: {}   ,
         disableClose:true,      
      });
    }

editShift(shift: Shift) {
  this.dialog.open(AddShiftComponent, {
     width: '410px',
      maxWidth: '35vw',
      maxHeight: '90vh',
    data: shift,   // ✅ pass shift to dialog
    disableClose:true,
  });
}

// Helpers to compute hours for a shift when not provided by API
private parseTimeToMinutes(val: string): number | null {
  if (!val) return null;
  const m = String(val).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'AM' && h === 12) h = 0;
  if (ap === 'PM' && h !== 12) h += 12;
  return h * 60 + min;
}

getShiftHours(shift: any): number {
  if (typeof shift?.totalHours === 'number') return shift.totalHours;
  const start = this.parseTimeToMinutes(shift?.startTime);
  const end = this.parseTimeToMinutes(shift?.endTime);
  if (start == null || end == null) return 0;
  let duration = end - start;
  if (duration < 0) duration += 24 * 60; // overnight
  return Math.round((duration / 60) * 100) / 100;
}

deleteShift(id: string) {
  const dialogRef = this.dialog.open(ConfrimDialogComponent, {
    width: '350px',
    data: {
      title: 'Delete Shift',
      message: 'Are you sure you want to delete this shift?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(RoleActions.deleteShift({ id }));
    } 
  });
}


}
