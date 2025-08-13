import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MachineType } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllMachineTypes } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-machine-type',
  imports: [
    CommonModule
  ],
  templateUrl: './machine-type.component.html',
  styleUrl: './machine-type.component.scss'
})
export class MachineTypeComponent implements OnInit {
  private store = inject(Store);

  machineTypes$!: Observable<MachineType[]>;

  ngOnInit(): void {

    this.store.dispatch(MachineTypeActions.loadMachineTypes());

    this.machineTypes$ = this.store.select(selectAllMachineTypes);



  this.machineTypes$.subscribe(data => {
    console.log('Machine Types from store:', data);
  });
  }
}