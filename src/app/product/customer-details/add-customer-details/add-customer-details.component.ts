
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, OnInit, ViewChild, inject } from '@angular/core';
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
import { MatStepper } from '@angular/material/stepper';
import { MatRadioModule} from '@angular/material/radio';
import { Actions, ofType } from '@ngrx/effects';
import {  take } from 'rxjs/operators';
import { CustomerDetails } from '../../../model/customer-details.model';
import * as customerActions from '../../store/product.actions';
import* as Selector from '../../store/product.selectors';
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfigService } from '../../../shared/config.service';
import { MatCheckboxModule } from '@angular/material/checkbox';


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
    MatStepperModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    MatCheckboxModule,
   
  ],
  templateUrl: './add-customer-details.component.html',
  styleUrl: './add-customer-details.component.scss'
})
export class AddCustomerDetailsComponent implements OnInit{
  @ViewChild('stepper') stepper!: MatStepper;

  


  loading: boolean = false;
    selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
selectedFileName: string = '';
  customerdeatilas$! : Observable<CustomerDetails[]>;
  partName: String[] =[]; 
  drawingNoArray: (string | number)[] = []; 


    productForm!: FormGroup;
    processForm!: FormGroup;
    custoemr$! : Observable<Customer[]>;
    rawmaterial$! : Observable<RawMaterial[]>;
    process$! : Observable<Process[]>;
    Cusid?: string;
    showTransportInput = true; 
    packingOptions: string[] = ["none", "domestic", "international"];
    paymenttermsOptions:string[] =["30 Days","45 Days","60 Days","90 Days","Immediate"];
    deliverytermsoption:string[]=["Ex-Works","FOB","CIF"];

    constructor(
      private dialog: MatDialog,
    private fb: FormBuilder,
    private store: Store,
     private actions$: Actions, 
    private dialogRef: MatDialogRef<AddCustomerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productservices : ProductService,
     private toastr : ToastrService,
     private config: ConfigService
  ) {}

  openCustomerPopup() {
  this.dialog.open(AddCustomerDetailsComponent, {
    width: '95vw',
    maxWidth: '1400px',
    height: '95vh',
    panelClass: 'zoho-dialog',
    disableClose: true
  });
}

  ngOnInit(): void {
    this.Cusid = this.data?._id;

    this.productForm = this.fb.group({
      customerName: ['', Validators.required],
      productName: ['', Validators.required],
       partName: ['', [Validators.required, this.duplicatePartNameValidator.bind(this)]],
      drawingNo: ['', this.duplicateDrawingNoValidator.bind(this)],      
      castingWeight: [null, Validators.required],
      shortWeight: [null, Validators.required],
      meltingLoss: [null, Validators.required],
      rawMaterial: [[] , Validators.required],
      grossWeight: [{ value: 0}, Validators.required]
      
    });

    this.processForm = this.fb.group({
      processSelection: this.fb.array([]) ,
      Rejection: [0, Validators.required],
    Packing : ['domestic', Validators.required],
    PaymentTerms:['',Validators.required],
    DeliveryTerms:['',Validators.required],
    InterestRate : [0, Validators.required],
    InspectorCost: [0, Validators.required],
    Freight:[''],
    ModeOfTransport:[''],

    ToolAmbience: [0, Validators.required],
     TransportType: ['cost'],  // 👈 default is "cost"
  TransportCost: [0],
  TransportPercentage: [0],
  overHeadsPercent : [0, Validators.required],
  dieLifeTime : [0, Validators.required],
  // DieMaintenance:[''],
  // Inspection:[''],
  // WIPPartsHandlingTray:[''],
  CMMInspection: [0,Validators.required],
  Insurance: [0],
  SeaPacking: [0],
  Payment90DaysICC: [0],
   includeRejections: [true],
  currency: ['USD'],
  commercialTermsParams: this.fb.array([]),
  transpotationParams: this.fb.array([]),
  rejectionParams: this.fb.array([]),
  otherParams: this.fb.array([])
    })

    this.onPackingChange(this.processForm.get('Packing')?.value);



this.productForm.get('castingWeight')?.valueChanges.subscribe(() => {
  this.calculateGrossWeight();
  this.updateAllProcessCycleTimes();
});

this.productForm.get('meltingLoss')?.valueChanges.subscribe(() => {
  this.calculateGrossWeight();
});

    
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

    this.customerdeatilas$ = this.store.select(Selector.selectAllCustomers);
    this.customerdeatilas$.subscribe(res => {
      const customers: CustomerDetails[] = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];
      this.partName = customers.map((c: CustomerDetails) => c.partName);
      this.drawingNoArray = customers
        .map((c: CustomerDetails) => c.drawingNo)
        .filter((d: CustomerDetails['drawingNo']) => d != null && d !== undefined);
      console.log('partname', this.partName);
      console.log('drawingNo', this.drawingNoArray);
    });
    
    this.store.dispatch(customerActions.loadCustomers())
    this.store.dispatch(loadCustomer());
    this.store.dispatch(Action.loadRawMaterials());
    this.store.dispatch(Action.loadProcess());

    this.store.select(selectLastAddedCustomer).subscribe(customer => {
    if (customer) {
      this.Cusid = customer._id;
      // console.log('✅ Customer ID from NgRx:', this.Cusid);
    }
  });

    // Populate form with incoming data if it exists (for edit mode)
    if (this.data) {
      this.Cusid = this.data._id;
      
      // Populate productForm with data
      if (this.data.customerName) {
        this.productForm.patchValue({
          customerName: this.data.customerName,
          productName: this.data.productName,
          partName: this.data.partName,
          drawingNo: this.data.drawingNo,
          castingWeight: this.data.castingWeight,
          shortWeight: this.data.shortWeight,
          meltingLoss: this.data.meltingLoss,
          rawMaterial: this.data.rawMaterial || [],
          grossWeight: this.data.grossWeight
        });
      }

      // Wait for processes$ to load from store, then populate
      if (this.data.processes && this.data.processes.length > 0) {
        this.process$.pipe(take(1)).subscribe(storeProcesses => {
          if (storeProcesses && storeProcesses.length > 0) {
            const processArray = this.processForm.get('processSelection') as FormArray;
            this.data.processes.forEach((proc: any, index: number) => {
              const group = this.fb.group({
                processId: [proc.processId, Validators.required],
                processName: [proc.processName, Validators.required],
                TonnageJaw: [proc.TonnageJaw],
                Hours: [proc.Hours],
                Unit: [proc.Unit],
                cycleTime: [proc.cycleTime],
                cavity: [proc.cavity, Validators.required],
                sqInch: [proc.sqInch, Validators.required],
              });
              processArray.push(group);
              
              console.log('✅ Process loaded at index', index, ':', proc.processName);
              
              // Trigger process change to fully populate all fields from process master
              setTimeout(() => {
                this.onProcessChange(index, proc.processId);
              }, 150);
            });
          }
        });
      }

      

      // Populate other process form fields
      this.processForm.patchValue({
        Rejection: this.data.Rejection || 0,
        Packing: this.data.Packing || 'domestic',
        PaymentTerms: this.data.PaymentTerms || '',
        DeliveryTerms: this.data.DeliveryTerms || '',
        InterestRate: this.data.InterestRate || 0,
        InspectorCost: this.data.InspectorCost || 0,
        Freight: this.data.Freight || '',
        ModeOfTransport: this.data.ModeOfTransport || '',
        ToolAmbience: this.data.ToolAmbience || 0,
        TransportType: this.data.TransportType || 'cost',
        TransportCost: this.data.TransportCost || this.data.packingRate || 0,
        TransportPercentage: this.data.TransportPercentage || this.data.packingPercentage || 0,
        overHeadsPercent: this.data.overHeadsPercent || 0,
        dieLifeTime: this.data.DieLifeTime || 0,
        DieMaintenance: this.data.DieMaintenance || '',
        Inspection: this.data.Inspection || '',
        WIPPartsHandlingTray: this.data.WIPPartsHandlingTray || '',
        CMMInspection: this.data.CMMInspection || 0,
        Insurance: this.data.Insurance || 0,
        SeaPacking: this.data.SeaPacking || 0,
        Payment90DaysICC: this.data.Payment90DaysICC || 0,
        includeRejections: this.data.includeRejections !== undefined ? this.data.includeRejections : true,
        currency: this.data.currency || 'USD'
      });

      // Populate custom params arrays
      if (this.data.commercialTermsParams) {
        Object.entries(this.data.commercialTermsParams).forEach(([label, value]) => {
          const paramArray = this.processForm.get('commercialTermsParams') as FormArray;
          paramArray.push(this.fb.group({ label, value }));
        });
      }

      if (this.data.transpotationParams) {
        Object.entries(this.data.transpotationParams).forEach(([label, value]) => {
          const paramArray = this.processForm.get('transpotationParams') as FormArray;
          paramArray.push(this.fb.group({ label, value }));
        });
      }

      if (this.data.rejectionParams) {
        Object.entries(this.data.rejectionParams).forEach(([label, value]) => {
          const paramArray = this.processForm.get('rejectionParams') as FormArray;
          paramArray.push(this.fb.group({ label, value }));
        });
      }

      if (this.data.otherParams) {
        Object.entries(this.data.otherParams).forEach(([label, value]) => {
          const paramArray = this.processForm.get('otherParams') as FormArray;
          paramArray.push(this.fb.group({ label, value }));
        });
      }
    }

  }

  @HostListener('wheel', ['$event'])
  onNumberInputWheel(event: WheelEvent): void {
    const target = event.target as HTMLInputElement | null;

    if (target?.tagName === 'INPUT' && target.type === 'number' && document.activeElement === target) {
      event.preventDefault();
    }
  }


calculateGrossWeight() {
  const casting = Number(this.productForm.get('castingWeight')?.value) || 0;
  const melting = Number(this.productForm.get('meltingLoss')?.value) || 0;

  const gross = casting *(1+(melting/100)) ;

  this.productForm.get('grossWeight')?.setValue(gross, { emitEvent: false });
}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
 this.selectedFileName = this.selectedFile.name; // Bind filename
      // Preview
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  duplicatePartNameValidator(control: any) {
  if (!control.value) return null;
  const enteredPartName = control.value.trim();
  return this.partName.includes(enteredPartName)
    ? { duplicatePartName: true }
    : null;
}

  duplicateDrawingNoValidator(control: any) {
    if (!control.value) return null;
    const enteredDrawingNo = control.value.toString().trim();
    return this.drawingNoArray.includes(enteredDrawingNo) || this.drawingNoArray.includes(Number(enteredDrawingNo))
      ? { duplicateDrawingNo: true }
    : null;
}

 save() {
  const formValue = { ...this.productForm.value };
  if (formValue.rawMaterial.length === 0) {
    delete formValue.rawMaterial;
  }

  console.log('data', formValue);

  if (this.Cusid && this.selectedFile) {
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });

    formData.append('drawingImage', this.selectedFile);

    this.productservices.updateCustomer(this.Cusid, formData).subscribe({
      next: (customer) => {
        console.log('Customer updated from step 1:', customer);
      },
      error: (err) => console.error(err)
    });

  } else if (this.Cusid) {
    this.productservices.updateCustomer(this.Cusid, formValue).subscribe({
      next: (customer) => {
        console.log('Customer updated from step 1:', customer);
      },
      error: (err) => console.error(err)
    });

  } else if (this.selectedFile) {
    // Send FormData directly to service, not via NgRx
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });

    formData.append('drawingImage', this.selectedFile);

    // Call service directly
    this.productservices.createCustomerDetails(formData).subscribe({
      next: (customer) => {
        this.Cusid = customer._id;
        this.toastr.success('Customer created successfully!');
        console.log('✅ Customer created with image:', customer._id);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to create customer');
      }
    });

  } else {
    this.productservices.createCustomerDetails(formValue).subscribe({
      next: (customer) => {
        this.Cusid = customer._id;
        this.toastr.success('Customer created successfully!');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to create customer');
      }
    });
  }

  if (this.processSelection.length === 0) {
    this.addProcessSelection();
  }
}


  close() {
    this.store.dispatch(customerActions.loadCustomers());
    this.dialogRef.close(true);
  }

get processSelection(): FormArray {
  return this.processForm.get('processSelection') as FormArray;
}

get commercialTermsParams(): FormArray {
  return this.processForm.get('commercialTermsParams') as FormArray;
}

get transpotationParams(): FormArray {
  return this.processForm.get('transpotationParams') as FormArray;
}

get rejectionParams(): FormArray {
  return this.processForm.get('rejectionParams') as FormArray;
}

get otherParams(): FormArray {
  return this.processForm.get('otherParams') as FormArray;
}

private createParamGroup(): FormGroup {
  return this.fb.group({
    label: [''],
    value: ['']
  });
}

addCustomParam(section: 'commercialTermsParams' | 'transpotationParams' | 'rejectionParams' | 'otherParams') {
  (this.processForm.get(section) as FormArray).push(this.createParamGroup());
}

removeCustomParam(
  section: 'commercialTermsParams' | 'transpotationParams' | 'rejectionParams' | 'otherParams',
  index: number
) {
  (this.processForm.get(section) as FormArray).removeAt(index);
}


addProcessSelection() {
  const group = this.fb.group({
    processId: [null, Validators.required],   
    processName: ['', Validators.required],
    TonnageJaw: [''],
    Hours: [''],
    Unit: [''],
    cycleTime: [''],
    cavity: [null, Validators.required],
    sqInch: [0, Validators.required],
  });
  this.processSelection.push(group);
  this.updateProcessCycleTime(this.processSelection.length - 1);
}



removeProcessSelection(index: number) {
  this.processSelection.removeAt(index);
}


onProcessChange(index: number, processId: string) {
  this.process$.pipe(take(1)).subscribe(processes => {
    const selectedProcess = processes.find(p => p._id === processId);
    if (selectedProcess) {
      const patchData: any = {
        processId: selectedProcess._id,
        processName: selectedProcess.processName,
        TonnageJaw: selectedProcess.TonnageJaw,
        sqInch: this.toFiniteNumber(selectedProcess.sqInch, 0),
        Hours: selectedProcess.Hours,
        Unit: selectedProcess.Unit,
        cycleTime: selectedProcess.cycleTime
      };

      const unit = String(selectedProcess.Unit || '').toLowerCase();
      if (unit === 'weight' ) {
        patchData.cycleTime = this.productForm.get('castingWeight')?.value || 0;
      }

      // 🔹 If processName is PDC, auto-fill cavity from productForm
      if (selectedProcess.processName === 'PDC') {
        patchData.cavity = this.productForm.get('cavities')?.value || null;
      }

      this.processSelection.at(index).patchValue(patchData);
    }
  });
}

private updateAllProcessCycleTimes() {
  this.processSelection.controls.forEach((_, index) => this.updateProcessCycleTime(index));
}

private updateProcessCycleTime(index: number) {
  const group = this.processSelection.at(index) as FormGroup;
  const unit = String(group.get('Unit')?.value || '').toLowerCase();

  if (unit === 'weight' ) {
    const castingWeight = this.productForm.get('castingWeight')?.value || 0;
    group.get('cycleTime')?.setValue(castingWeight, { emitEvent: false });
  }
}






onSave() {
  this.loading = true;
  const result = this.buildCustomerPayload();

  console.log('Final JSON (Full):', result);
  console.log('data id', this.Cusid);

  let payload: any;
  if (this.selectedFile) {
    const formData = new FormData();
    Object.entries(result).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });
    formData.append('drawingImage', this.selectedFile);

    this.productservices.updateCustomer(this.Cusid!, formData).subscribe({
      next: (res) => {
        console.log('✅ Customer updated:', res);
      
        setTimeout(() => {
          this.toastr.success('Customer Added successfully!');
          this.loading = false;
          this.dialogRef.close(true);
        }, 1000); 
      },
      error: (err) => {
        console.error('❌ Update failed:', err);
   
        setTimeout(() => {
          this.toastr.error('Failed to Add customer');
          this.loading = false;
        }, 1000);
      }
    });
  } else {
   
    setTimeout(() => {
      this.store.dispatch(Action.updateCustomer({ id: this.Cusid!, customer: result }));
      this.toastr.success('Customer Added successfully!');
      this.loading = false;
      this.dialogRef.close(true);
    }, 1000); 
  }

  // Remove this line as dialogRef.close() is handled inside the setTimeout blocks
  // this.dialogRef.close();
}

onProcessNext() {
  if (!this.Cusid) {
    this.toastr.error('Please complete step 1 and wait for the product to be created.');
    return;
  }

  if (!(this.processSelection.length > 0 && this.processSelection.valid)) {
    this.processSelection.markAllAsTouched();
    return;
  }

  this.loading = true;
  const result = this.buildCustomerPayload();

  this.productservices.updateCustomer(this.Cusid, result).subscribe({
    next: () => {
      this.loading = false;
      this.toastr.success('Process details saved successfully.');
      this.stepper.next();
    },
    error: (err) => {
      console.error('Process step save failed:', err);
      this.loading = false;
      this.toastr.error('Failed to save process details.');
    }
  });
}

private buildCustomerPayload() {
  const processSelections = this.processForm.value.processSelection.map((p: any) =>
    this.buildProcessPayload(p)
  );

  const commercialTermsParams = this.buildParamsMap(this.commercialTermsParams);
  const transpotationParams = this.buildParamsMap(this.transpotationParams);
  const rejectionParams = this.buildParamsMap(this.rejectionParams);
  const otherParams = this.buildParamsMap(this.otherParams);

  return {
    ...this.productForm.value,
    processes: processSelections,
    Rejection: this.processForm.value.Rejection,
    Packing: this.processForm.value.Packing,
    PaymentTerms:this.processForm.value.PaymentTerms,
    DeliveryTerms:this.processForm.value.DeliveryTerms,

    InterestRate: this.processForm.value.InterestRate,
    InspectorCost: this.processForm.value.InspectorCost,
    ToolAmbience: this.processForm.value.ToolAmbience,
    packingRate: this.processForm.value.TransportCost,
    Freight: this.processForm.value.Freight,
    ModeOfTransport: this.processForm.value.ModeOfTransport,
    packingPercentage: this.processForm.value.TransportPercentage,
    revisionNumber: 1,
    overHeadsPercent: this.processForm.value.overHeadsPercent,
   
    DieLifeTime: this.processForm.value.dieLifeTime,
    // DieMaintenance:this.processForm.value.DieMaintenance,
    // Inspection:this.processForm.value.Inspection,
    // WIPPartsHandlingTray:this.processForm.value.WIPPartsHandlingTray,
    includeRejections: this.processForm.value.includeRejections ?? true,
    TransportPercentage: this.processForm.value.TransportPercentage,
    TransportCost: this.processForm.value.TransportCost,
    CMMInspection: this.processForm.value.CMMInspection,
    Insurance: this.processForm.value.Insurance,
    SeaPacking: this.processForm.value.SeaPacking,
    Payment90DaysICC: this.processForm.value.Payment90DaysICC,
    currency: this.processForm.value.currency,
    commercialTermsParams,
    transpotationParams,
    rejectionParams,
    otherParams,
  };
}

private buildParamsMap(paramArray: FormArray): Record<string, string> {
  const params: Record<string, string> = {};

  paramArray.controls.forEach(control => {
    const label = String(control.get('label')?.value || '').trim();
    const value = String(control.get('value')?.value || '').trim();

    if (label && value) {
      params[label] = value;
    }
  });

  return params;
}

private toFiniteNumber(value: any, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

private buildProcessPayload(process: any) {
  const normalizedProcess = {
    ...process,
    sqInch: this.toFiniteNumber(process?.sqInch, 0),
    Hours: this.toFiniteNumber(process?.Hours, 0),
    cycleTime: this.toFiniteNumber(process?.cycleTime, 0),
    cavity: this.toFiniteNumber(process?.cavity, 0)
  };

  return {
    processId: normalizedProcess.processId,
    processName: normalizedProcess.processName,
    TonnageJaw: normalizedProcess.TonnageJaw,
    sqInch: normalizedProcess.sqInch,
    Hours: normalizedProcess.Hours,
    cost: this.calculateProcessValue(normalizedProcess),
    cycleTime: normalizedProcess.cycleTime,
    cavity: normalizedProcess.cavity
  };
}

calculateProcessValue(proc: any): number {
  if (!proc) return 0;

  const unit = String(proc.Unit || '').toLowerCase();
  const hours = this.toFiniteNumber(proc.Hours, 0);
  const cycleTime = this.toFiniteNumber(proc.cycleTime, 1);
  const cavity = this.toFiniteNumber(proc.cavity, 1);
  const castingWeight = this.toFiniteNumber(this.productForm.get('castingWeight')?.value, 0);
  const sqInch = this.toFiniteNumber(proc.sqInch, 0);

  if (unit === 'weight') {
    return +(castingWeight * hours).toFixed(4);
  }

  if (unit === 'square inch') {
    return +(sqInch * hours).toFixed(4);
  }

  const value = hours / (3600 / cycleTime) / cavity;
  return Number.isFinite(value) ? +value.toFixed(4) : 0;
}

getProcessFormulaTitle(proc: any): string {
  const unit = String(proc?.Unit || '').toLowerCase();

  if (unit === 'weight') {
    return 'Formula: Casting Weight * Machine / per hr';
  }

  if (unit === 'square inch') {
    return 'Formula: sqInch * Machine / per hr';
  }

  return 'Formula: (Machine / per hr / (3600 / CycleTime) / Cavity)';
}

getProcessFormulaBreakdown(proc: any): string {
  const unit = String(proc?.Unit || '').toLowerCase();
  const castingWeight = this.toFiniteNumber(this.productForm.get('castingWeight')?.value, 0);
  const hours = this.toFiniteNumber(proc?.Hours, 0);
  const cycleTime = this.toFiniteNumber(proc?.cycleTime, 0);
  const cavity = this.toFiniteNumber(proc?.cavity, 0);
  const sqInch = this.toFiniteNumber(proc?.sqInch, 0);

  if (unit === 'weight') {
    return `= (${castingWeight} * ${hours})`;
  }

  if (unit === 'square inch') {
    return `= (${sqInch} * ${hours})`;
  }

  return `= (${hours} / (3600 / ${cycleTime}) / ${cavity})`;
}








  onPackingChange(selected: string) {
  this.showTransportInput = selected === 'domestic' || selected === 'international';

  if (!this.showTransportInput) {
    this.processForm.patchValue({
      TransportCost: null,
      TransportPercentage: null,
      TransportType: 'cost'
    });
    
  }
  
}

currencies = [
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', symbol: 'A$' },
  { code: 'BGN', name: 'Bulgarian Lev', country: 'Bulgaria', symbol: 'лв' },
  { code: 'BRL', name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
      { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', symbol: 'C$' },
      { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', country: 'China', symbol: '¥' },
  { code: 'CZK', name: 'Czech Koruna', country: 'Czech Republic', symbol: 'Kč' },
  { code: 'DKK', name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
  { code: 'EUR', name: 'Euro', country: 'European Union', symbol: '€' },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', symbol: '£' },
      { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: 'HK$' },
  { code: 'HRK', name: 'Croatian Kuna', country: 'Croatia', symbol: 'kn' },
  { code: 'HUF', name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli Shekel', country: 'Israel', symbol: '₪' },
      { code: 'INR', name: 'Indian Rupee', country: 'India', symbol: '₹' },
  { code: 'ISK', name: 'Icelandic Krona', country: 'Iceland', symbol: 'kr' },
  { code: 'JPY', name: 'Japanese Yen', country: 'Japan', symbol: '¥' },
      { code: 'KRW', name: 'South Korean Won', country: 'South Korea', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
      { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
  { code: 'NOK', name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
      { code: 'PHP', name: 'Philippine Peso', country: 'Philippines', symbol: '₱' },
      { code: 'PLN', name: 'Polish Zloty', country: 'Poland', symbol: 'zł' },
      { code: 'RON', name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
  { code: 'RUB', name: 'Russian Ruble', country: 'Russia', symbol: '₽' },
  { code: 'SEK', name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', country: 'Thailand', symbol: '฿' },
  { code: 'TRY', name: 'Turkish Lira', country: 'Turkey', symbol: '₺' },
  { code: 'USD', name: 'United States Dollar', country: 'United States', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', country: 'South Africa', symbol: 'R' }
];








// previewUrl: string | ArrayBuffer | null = null;
popupOpen = false;

togglePopup() {
  this.popupOpen = !this.popupOpen;
}

/**
 * Normalizes image path - adds /uploads/ prefix if missing
 * Handles both full paths (/uploads/filename.jpg) and filenames (filename.jpg)
 */
getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  const api = this.config.getCostingUrl('');
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If path doesn't start with /, it's just a filename - add /uploads/ prefix
  let normalizedPath = imagePath;
  if (!imagePath.startsWith('/')) {
    normalizedPath = `/uploads/${imagePath}`;
  } else if (!imagePath.startsWith('/uploads/')) {
    // If it starts with / but not /uploads/, add /uploads/
    normalizedPath = `/uploads${imagePath}`;
  }
  
  return api + normalizedPath;
}

// onFileSelected(event: Event) {
//   const input = event.target as HTMLInputElement;
//   if (input.files && input.files[0]) {
//     this.selectedFile = input.files[0];
//     this.selectedFileName = this.selectedFile.name;

//     const reader = new FileReader();
//     reader.onload = () => this.previewUrl = reader.result;
//     reader.readAsDataURL(this.selectedFile);
//   }
// }





}
