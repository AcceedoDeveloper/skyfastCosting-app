import { Component, OnInit, Type, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MachineType } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllMachineTypes } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';



@Component({
  selector: 'app-machine-type',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './machine-type.component.html',
  styleUrl: './machine-type.component.scss'
})
export class MachineTypeComponent implements OnInit {
  private store = inject(Store);
   newMachineTypeName: string = '';
  isEditMode: boolean = false;
  editingId: string | null = null;

  machineTypes$!: Observable<MachineType[]>;

  ngOnInit(): void {

    this.store.dispatch(MachineTypeActions.loadMachineTypes());

    this.machineTypes$ = this.store.select(selectAllMachineTypes);



  this.machineTypes$.subscribe(data => {
    console.log('Machine Types from store:', data);
  });
  }

editRole(machineType: MachineType): void {
    this.isEditMode = true;
    this.editingId = machineType._id!;
    this.newMachineTypeName = machineType.name;
  }

  
    cancelEdit() {
      this.isEditMode = false;
      this.editingId = null;
      this.newMachineTypeName = '';
    }

    updateRole(): void {
  if (!this.editingId || this.newMachineTypeName.trim().length === 0) return;

  const updatedMachineType: MachineType = {
    _id: this.editingId,
    name: this.newMachineTypeName,
    lowercaseName: this.newMachineTypeName.toLowerCase(),
    createdAt: '', // not needed for update
    updatedAt: new Date().toISOString(),
    __v: 0
  };

  // Dispatch update action
  this.store.dispatch(
    MachineTypeActions.updateMachineType({
      id: this.editingId,
      machineType: updatedMachineType
    })
  );

  // Reset form state
  this.cancelEdit();
}

addRole(): void {
    if (this.newMachineTypeName.trim().length === 0) return;

    const newMachineType: MachineType = {
      _id: '', // server will generate
      name: this.newMachineTypeName,
      lowercaseName: this.newMachineTypeName.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    };

    // Dispatch add action
    this.store.dispatch(
      MachineTypeActions.addMachineType({ machineType: newMachineType })
    );

    // Reset input
    this.newMachineTypeName = '';
  }


  deleteRole(id : string){
    this.store.dispatch(MachineTypeActions.deleteMachineType({ id}));
  }

}