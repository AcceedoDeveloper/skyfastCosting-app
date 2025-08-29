import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as processActions from '../store/product.actions';
import { selectAllProcess } from '../store/product.selectors';
import { Process } from '../../model/product.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { AddProcessComponent } from './add-process/add-process.component';



@Component({
  selector: 'app-process',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit {

  process$!: Observable<Process[]>;
  
  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog) {
  }

  ngOnInit(): void {

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(process => {
      console.log('Process from store:', process);
    }
    ); 

    this.store.dispatch(processActions.loadProcess());
  }


  openAddDialog() {
    const dialogRef = this.dialog.open(AddProcessComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(processActions.addProcess({ process: result }));
      }
    });
  }

  openEditDialog(process: Process) {
    const dialogRef = this.dialog.open(AddProcessComponent, {
      width: '500px',
      data: { process }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          processActions.updateProcess({ id: process._id, process: result })
        );
      }
    });
  }

  onDelete(id: string) {

    this.store.dispatch(processActions.deleteProcess({ id }));

  }

}
