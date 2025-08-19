import { Component , OnInit, inject, Inject } from '@angular/core';
import { Machine, MachineType } from '../../../../model/machine.model';
import * as MachineTypeActions from '../../store/entity.action';
import { selectAllMachine, selectAllMachineTypes } from '../../store/entity.selectors';
import { CommonModule } from '@angular/common';
import {MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-machine',
  imports: [
      CommonModule,
    MatIconModule,
    MatButtonModule,
     MatDialogModule ,
     ReactiveFormsModule
  ],
  templateUrl: './add-machine.component.html',
  styleUrl: './add-machine.component.scss'
})
export class AddMachineComponent implements OnInit{
    macineType$! : Observable<MachineType[]>;
      machineForm!: FormGroup;

     private store = inject(Store);
      private fb = inject(FormBuilder);
      private matdialog = inject(MatDialog);
      private dialogRef = inject(MatDialogRef<AddMachineComponent>)

        constructor(@Inject(MAT_DIALOG_DATA) public data: Machine | null) {}

        

     ngOnInit(): void {
        this.macineType$ = this.store.select(selectAllMachineTypes);

         this.machineForm = this.fb.group({
      machineNumber: ['', Validators.required],
      machineName: ['', Validators.required],
      machineType: ['', Validators.required]
    });

     if (this.data) {
      this.machineForm.patchValue(this.data);
    }
        

        this.macineType$.subscribe(data =>{
          console.log('data', data);
          
        })

     }
      onSubmit() {
    if (this.machineForm.valid) {
      const machineData = this.machineForm.value;

      if (this.data?._id) {
        console.log('edied data', machineData);
        
      } else {
        this.store.dispatch(MachineTypeActions.addMachine({ machine: machineData }));
      }

      this.dialogRef.close();
    }
  }

}
