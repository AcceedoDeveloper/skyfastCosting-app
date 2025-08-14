import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Machine } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllMachine } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-registry',
  imports: [
    CommonModule
  ],
  templateUrl: './machine-registry.component.html',
  styleUrl: './machine-registry.component.scss'
})
export class MachineRegistryComponent implements OnInit{

  machine$!: Observable<Machine[]>; 

    private store = inject(Store);
  ngOnInit(): void {

    this.machine$ = this.store.select(selectAllMachine);

    this.store.dispatch(MachineTypeActions.loadMachine());

    this.machine$.subscribe( data =>{
      console.log('data', data)
    }
    )
    
  }

}
