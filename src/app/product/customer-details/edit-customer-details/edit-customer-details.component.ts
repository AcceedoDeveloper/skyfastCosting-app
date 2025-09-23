import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CustomerDetails } from '../../../model/customer-details.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { Process, RawMaterial} from '../../../model/product.model';
import {selectAllProcess, selectAllRawMaterials } from '../../store/product.selectors';
import * as Action from '../../store/product.actions';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import * as customerActions from '../../store/product.actions';
import* as Selector from '../../store/product.selectors';




@Component({
  selector: 'app-edit-customer-details',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatDialogModule,
    MatStepperModule,
    MatRadioModule
  ],
  templateUrl: './edit-customer-details.component.html',
  styleUrl: './edit-customer-details.component.scss'
})
export class EditCustomerDetailsComponent implements OnInit {
    customerdeatilas$! : Observable<CustomerDetails[]>;
  rawMaterial$! : Observable<RawMaterial[]>;
  process$!: Observable<Process[]>;
  customerForm: FormGroup;
  revisionNumber = 1; 
  selectedRevisionIndex = 0; // default first revision
  packingOptions: string[] = ["none", "domestic", "international"];




  get processes(): FormArray {
    return this.customerForm.get('processes') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCustomerDetailsComponent>,
    private store : Store,
    @Inject(MAT_DIALOG_DATA) public data: CustomerDetails | null
  ) {

    console.log('data', data);
    
  const revision = data?.revisions?.[data.revisions.length - 1];
  
  // if revisions exist, take the last revision number and increment by 1
if (data?.revisions?.length) {
  const lastRevision = data.revisions[data.revisions.length - 1];
  this.revisionNumber = (lastRevision.revisionNumber || 1) ;
} else {
  this.revisionNumber = 1; 
}


  

    this.customerForm = this.fb.group({
      customerName: [data?.customerName.customerName || '', Validators.required],
      productName: [revision?.productName || '', Validators.required],
      partName: [data?.partName || '', Validators.required],
      drawingNo: [data?.drawingNo ?? 0, ],

      // counts (fallback if missing)
      noOfRawMaterials: [revision?.rawMaterial?.length ?? 0],
      noOfProcess: [revision?.processes?.length ?? 0],

      // 👇 map revision values
      rejection: [revision?.Rejection ?? 0],
      interestRate: [revision?.InterestRate ?? 0],
      inspectorCost: [revision?.InspectorCost ?? 0],
      packing: [revision?.Packing || ''],
      toolAmbience: [revision?.ToolAmbience || ''],
      overHeadsPercent: [revision?.overHeadsPercent ],
      DieLifeTime: [ revision?.DieLifeTime ],



      CMMInspection: [revision?.CMMInspection],
  Insurance: [revision?.Insurance],
  SeaPacking: [revision?.SeaPacking],
  Payment90DaysICC: [revision?.Payment90DaysICC],

      castingWeight: [revision?.castingWeight ?? 0],
      cavities: [revision?.cavities ?? 0],
      meltingLoss: [revision?.meltingLoss ?? 0],
      shortWeight: [revision?.shortWeight ?? 0],

      // 👇 rawMaterial IDs for mat-select
      rawMaterial: [revision?.rawMaterial?.map((r: any) => r._id) || []],

      packingPercentage: [revision?.packingPercentage ?? null],
  packingRate: [revision?.packingRate ?? null],

      

      processes: this.fb.array([])
    });

    // ✅ Fill processes from revision
    if (revision?.processes?.length) {
      revision.processes.forEach((proc: any) => this.addProcess(proc));
    }
  }


  

  ngOnInit(): void {
    this.rawMaterial$ = this.store.select(selectAllRawMaterials);

    this.rawMaterial$.subscribe( raw =>{
      console.log('raw data', raw);
    })

    this.store.dispatch(Action.loadRawMaterials());
    this.store.dispatch(Action.loadProcess());

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(process =>{
      console.log('process', process);
      
    })


    
  }




  addProcess(proc: any = null) {
    this.processes.push(
      this.fb.group({
        processId: [proc?.processId || ''],
        processName: [proc?.processName || '', Validators.required],
        TonnageJaw: [proc?.TonnageJaw || ''],
        Hours: [proc?.Hours ?? 0],
        cycleTime: [proc?.cycleTime ?? 0],
        cavity: [proc?.cavity ?? 0],
        cost: [proc?.cost ?? 0],
        calculation: [proc?.calculation ?? 0]
      })
    );
  }

  removeProcess(index: number) {
    this.processes.removeAt(index);
  }

onSave() {
  if (this.customerForm.valid) {
    const formValue = this.customerForm.value;

    let selectedRawMaterials: any[] = [];
    this.rawMaterial$.pipe(take(1)).subscribe(allRawMaterials => {
      selectedRawMaterials = (formValue.rawMaterial || []).map((id: string) => {
        const found = allRawMaterials.find(r => r._id === id);
        return found ? found.GradeName : id; // ✅ store only grade names
      });
    });

    const updatedCustomer = {
      productName: formValue.productName,
      cavities: formValue.cavities,
      castingWeight: formValue.castingWeight,
      shortWeight: formValue.shortWeight,
      meltingLoss: formValue.meltingLoss,

      // 👇 Map with correct casing
      Rejection: formValue.rejection,
      Packing: formValue.packing,
      InterestRate: formValue.interestRate,
      InspectorCost: formValue.inspectorCost,
      ToolAmbience: formValue.toolAmbience,
      overHeadsPercent: formValue.overHeadsPercent,
      DieLifeTime: formValue.DieLifeTime,

      packingPercentage: formValue.packingPercentage,
  packingRate: formValue.packingRate,


   ...(formValue.packing === 'international' && {
    CMMInspection: formValue.CMMInspection,
    Insurance: formValue.Insurance,
    SeaPacking: formValue.SeaPacking,
    Payment90DaysICC: formValue.Payment90DaysICC
  }),

      customerName: typeof this.data?.customerName === 'string' 
        ? this.data.customerName 
        : this.data?.customerName?.customerName || '',

      rawMaterial: selectedRawMaterials,
      processes: formValue.processes.map((p: any) => ({
        processName: p.processName,
        TonnageJaw: p.TonnageJaw,
        Hours: p.Hours,
        cycleTime: p.cycleTime,
        cavity: p.cavity
      })),

      revisionNumber: this.revisionNumber
    };

    console.log('📦 Final Payload (Correct):', updatedCustomer);

    this.store.dispatch(
      Action.updateCustomer({
        id: this.data?._id!,
        customer: updatedCustomer
      })
    );

    this.store.dispatch(Action.loadCustomers());


  }
   this.dialogRef.close();
       this.store.dispatch(Action.loadCustomers());

}

incrementRevision() {
  this.revisionNumber++;
  console.log('🔄 Revision incremented:', this.revisionNumber);
  this.onSave();
}


  onCancel() {
    this.dialogRef.close();
  }

  calculateProcessValue(proc: any): number {
  if (!proc) return 0;

  const hours = Number(proc.Hours) || 0;
  const cycleTime = Number(proc.cycleTime) || 1; // prevent divide by 0
  const cavity = Number(proc.cavity) || 1;

  return +(hours / 3600 / cycleTime / cavity).toFixed(4); // rounded to 4 decimals
}



onProcessSelected(processId: string, index: number) {
  this.process$.pipe(take(1)).subscribe(allProcesses => {
    const selectedProc = allProcesses.find(p => p._id === processId);

    if (selectedProc) {
      const processGroup = this.processes.at(index);

      const patchData: any = {
        processName: selectedProc.processName,
        TonnageJaw: selectedProc.TonnageJaw,
        Hours: selectedProc.Hours,
        cycleTime: selectedProc.cycleTime,
        cost: selectedProc.cost,
        calculation: selectedProc.calculation
      };

      // 🔹 If processName is PDC → auto-fill cavity from customerForm
      if (selectedProc.processName === 'PDC') {
        patchData.cavity = this.customerForm.get('cavities')?.value || 0;
      } else {
        patchData.cavity = selectedProc.cavity; // fallback
      }

      processGroup.patchValue(patchData);
    }
  });
}



}