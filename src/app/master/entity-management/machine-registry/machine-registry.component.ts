import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Machine, MachineType } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllMachine, selectAllMachineTypes } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';
import {MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { AddMachineComponent} from './add-machine/add-machine.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';



@Component({
  selector: 'app-machine-registry',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
     MatDialogModule 
  ],
  templateUrl: './machine-registry.component.html',
  styleUrl: './machine-registry.component.scss'
})
export class MachineRegistryComponent implements OnInit{

  machine$!: Observable<Machine[]>; 
  macineType$! : Observable<MachineType[]>;

    private store = inject(Store);
     private dialog = inject(MatDialog); 
  ngOnInit(): void {

    this.machine$ = this.store.select(selectAllMachine);
    this.macineType$ = this.store.select(selectAllMachineTypes);

    this.store.dispatch(MachineTypeActions.loadMachine());
    this.store.dispatch(MachineTypeActions.loadMachineTypes());

    this.machine$.subscribe( data =>{
      console.log('Machine', data)
    });
    
      this.macineType$.subscribe( data =>{
      console.log('MAachine Type', data)
    });
  }

   openAddMachineDialog() {
    const dialogRef = this.dialog.open(AddMachineComponent, {
      width: '500px',
      data: {}         
    });
  }

  openEditMachineDialog(machine: Machine) {
  this.dialog.open(AddMachineComponent, {
    width: '500px',
    data: machine   // 👈 pass machine data here
  });
}


}
