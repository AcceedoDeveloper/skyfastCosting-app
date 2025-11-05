

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
import { MatRadioModule} from '@angular/material/radio';
import { Actions, ofType } from '@ngrx/effects';
import {  take } from 'rxjs/operators';
import { CustomerDetails } from '../../../model/customer-details.model';
import * as customerActions from '../../store/product.actions';
import* as Selector from '../../store/product.selectors';
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { selectLastAddedCustomer } from '../../store/product.selectors';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfigService } from '../../../shared/config.service';


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
  ],
  templateUrl: './add-customer-details.component.html',
  styleUrl: './add-customer-details.component.scss'
})
export class AddCustomerDetailsComponent implements OnInit{


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
    showTransportInput = false; 
    packingOptions: string[] = ["none", "domestic", "international"];

    constructor(
    private fb: FormBuilder,
    private store: Store,
     private actions$: Actions, 
    private dialogRef: MatDialogRef<AddCustomerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productservices : ProductService,
     private toastr : ToastrService,
     private config: ConfigService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      customerName: ['', Validators.required],
      productName: ['', Validators.required],
       partName: ['', [Validators.required, this.duplicatePartNameValidator.bind(this)]],
      drawingNo: ['', this.duplicateDrawingNoValidator.bind(this)],      
      castingWeight: [null, Validators.required],
      shortWeight: [null, Validators.required],
      meltingLoss: [null, Validators.required],
      rawMaterial: [[] , Validators.required],
      
    });

    this.processForm = this.fb.group({
      processSelection: this.fb.array([]) ,
      Rejection: [0, Validators.required],
    Packing : [null, Validators.required],
    InterestRate : [0, Validators.required],
    InspectorCost: [0, Validators.required],
    Freight:[],
    ModeOfTransport:[],

    ToolAmbience: [0, Validators.required],
     TransportType: ['cost'],  // 👈 default is "cost"
  TransportCost: [0],
  TransportPercentage: [0],
  overHeadsPercent : [0, Validators.required],
  dieLifeTime : [0, Validators.required],
  CMMInspection: [0],
  Insurance: [0],
  SeaPacking: [0],
  Payment90DaysICC: [0],
  currency: ['USD']   
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

    this.customerdeatilas$ = this.store.select(Selector.selectAllCustomers);
    this.customerdeatilas$.subscribe(res =>{
      this.partName = res.map(c => c.partName);
      this.drawingNoArray = res.map(c => c.drawingNo).filter(d => d != null && d !== undefined);
      console.log('partname',this.partName);
      console.log('drawingNo',this.drawingNoArray);
      
      
      
      
    })
    
    this.store.dispatch(customerActions.loadCustomers())
    this.store.dispatch(loadCustomer());
    this.store.dispatch(Action.loadRawMaterials());
    this.store.dispatch(Action.loadProcess());

    this.store.select(selectLastAddedCustomer).subscribe(customer => {
    if (customer) {
      this.Cusid = customer._id;
      console.log('✅ Customer ID from NgRx:', this.Cusid);
    }
  });

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

  if (this.selectedFile) {
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
        console.log('✅ Customer created with image:', customer._id);
      },
      error: (err) => console.error(err)
    });

  } else {
    // No image → safe to dispatch via NgRx
    this.store.dispatch(Action.AddCustomerDetailsComponent({ customer: formValue }));
  }

  this.addProcessSelection();
}


  close() {
    this.dialogRef.close();
  }

  get processSelection(): FormArray {
  return this.processForm.get('processSelection') as FormArray;
}


addProcessSelection() {
  const group = this.fb.group({
      processId: [null, Validators.required],   
    processName: ['', Validators.required],
    TonnageJaw: [''],
    Hours: [''],
    cycleTime: [''],
    cavity: [null, Validators.required],
    
  });
  this.processSelection.push(group);
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
        Hours: selectedProcess.Hours,
        cycleTime: selectedProcess.cycleTime
      };

      // 🔹 If processName is PDC, auto-fill cavity from productForm
      if (selectedProcess.processName === 'PDC') {
        patchData.cavity = this.productForm.get('cavities')?.value || null;
      }

      this.processSelection.at(index).patchValue(patchData);
    }
  });
}






onProcessNext() {
  console.log('Full Process Selection:', this.processForm.value.processSelection);
}

onSave() {
  this.loading = true;

  const processSelections = this.processForm.value.processSelection.map((p: any) => ({
    processId: p.processId,
    processName: p.processName,
    TonnageJaw: p.TonnageJaw,
    Hours: p.Hours,
    cycleTime: p.cycleTime,
    cavity: p.cavity
  }));

  const result = {
    ...this.productForm.value,
    processes: processSelections,
    Rejection: this.processForm.value.Rejection,
    Packing: this.processForm.value.Packing,
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
    TransportPercentage: this.processForm.value.TransportPercentage,
    TransportCost: this.processForm.value.TransportCost,
    CMMInspection: this.processForm.value.CMMInspection,
    Insurance: this.processForm.value.Insurance,
    SeaPacking: this.processForm.value.SeaPacking,
    Payment90DaysICC: this.processForm.value.Payment90DaysICC,
    currency: this.processForm.value.currency,
  };

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
      // this.toastr.success('Customer Added successfully!');
      this.loading = false;
      this.dialogRef.close(true);
    }, 1000); 
  }

  // Remove this line as dialogRef.close() is handled inside the setTimeout blocks
  // this.dialogRef.close();
}

calculateProcessValue(proc: any): number {
  if (!proc) return 0;

  const hours = Number(proc.Hours) || 0;
  const cycleTime = Number(proc.cycleTime) || 1; // avoid divide by zero
  const cavity = Number(proc.cavity) || 1;

  return +(hours /( 3600 / cycleTime) / cavity).toFixed(4); // rounded to 4 decimals
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




