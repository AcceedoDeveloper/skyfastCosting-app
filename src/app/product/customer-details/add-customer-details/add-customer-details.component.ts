import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { loadCustomer} from '../../../master/entity-management/store/entity.action';
import { selectAllCustomers} from '../../../master/entity-management/store/entity.selectors';
import { Customer } from '../../../model/machine.model';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import * as Action from '../../store/product.actions';
import { Process, RawMaterial} from '../../../model/product.model';
import {selectAllProcess, selectAllRawMaterials } from '../../store/product.selectors';
import { MatStepperModule } from '@angular/material/stepper';
import { Actions, ofType } from '@ngrx/effects';
import {  take } from 'rxjs/operators';


@Component({
  selector: 'app-add-customer-details',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatStepperModule
  ],
  templateUrl: './add-customer-details.component.html',
  styleUrl: './add-customer-details.component.scss'
})
export class AddCustomerDetailsComponent implements OnInit{

    productForm!: FormGroup;
    processForm!: FormGroup;
    custoemr$! : Observable<Customer[]>;
    rawmaterial$! : Observable<RawMaterial[]>;
    process$! : Observable<Process[]>;
    Cusid?: string;

    constructor(
    private fb: FormBuilder,
    private store: Store,
     private actions$: Actions, 
    private dialogRef: MatDialogRef<AddCustomerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      customerName: ['', Validators.required],
      productName: ['', Validators.required],
      partName: ['', Validators.required],
      cavities: [null, Validators.required],
      castingWeight: [null, Validators.required],
      shortWeight: [null, Validators.required],
      meltingLoss: [null, Validators.required],
      rawMaterial: [[]],
      
    });

    this.processForm = this.fb.group({
      processSelection: this.fb.array([]) ,
      Rejection: [null, Validators.required],
    Packing : [null, Validators.required],
    InterestRate : [null, Validators.required],
    InspectorCost: [null, Validators.required],
    ToolAmbience: [null, Validators.required]     
    })

    
    this.custoemr$ = this.store.select(selectAllCustomers);
    this.custoemr$.subscribe(customers => {
      console.log('Customers from store:', customers);
    });

    this.rawmaterial$ = this.store.select(selectAllRawMaterials);
    this.rawmaterial$.subscribe(rawMaterials => {
      console.log('Raw Materials from store:', rawMaterials);
    });

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(processes => {
      console.log('Processes from store:', processes);
    });
    
    this.store.dispatch(loadCustomer());
    this.store.dispatch(Action.loadRawMaterials());
    this.store.dispatch(Action.loadProcess());

  }

  

  save() {
    const formValue = { ...this.productForm.value };
    if (formValue.rawMaterial.length === 0) {
      delete formValue.rawMaterial;
    }
   
          this.store.dispatch(Action.AddCustomerDetailsComponent({ customer: formValue }));
          this.actions$
    .pipe(
      ofType(Action.addCustomerSuccess),
      take(1) 
    )
    .subscribe(({ customer }) => {
      this.Cusid = customer._id;
      console.log('✅ Newly created customer ID:', customer._id);
    });

          this.addProcessSelection();

  }

  close() {
    this.dialogRef.close();
  }

  get processSelection(): FormArray {
  return this.processForm.get('processSelection') as FormArray;
}

// Add a new process selection
addProcessSelection() {
  const group = this.fb.group({
    processId: ['', Validators.required],  // dropdown
    details: [null],
    cavity: [null, Validators.required],   
    cost: [null, Validators.required],
     
  });
  this.processSelection.push(group);
}

// Remove process selection
removeProcessSelection(index: number) {
  this.processSelection.removeAt(index);
}

// On process select, fill details
onProcessChange(index: number, process: any) {
  this.processSelection.at(index).patchValue({ details: process });
}


onProcessNext() {
  console.log('Full Process Selection:', this.processForm.value.processSelection);
}

onSave() {

  const processSelections = this.processForm.value.processSelection.map((p: any) => ({
    processName: p.details?.processName || '',
    TonnageJaw: p.details?.TonnageJaw || '',
    Hours: p.details?.Hours || 0,
    cycleTime: p.details?.cycleTime || 0,
    cost: p.cost,
    cavity: p.cavity
  }));


  const result = {
    processes: processSelections,
    Rejection: this.processForm.value.Rejection,
    Packing: this.processForm.value.Packing,
    InterestRate: this.processForm.value.InterestRate,
    InspectorCost: this.processForm.value.InspectorCost,
    ToolAmbience: this.processForm.value.ToolAmbience
  };


  console.log('Final JSON:', result);

  this.store.dispatch(Action.updateCustomer({ id:  this.Cusid!, customer : result}));

  this.store.dispatch(Action.loadCustomers());

  this.dialogRef.close();


}



}
