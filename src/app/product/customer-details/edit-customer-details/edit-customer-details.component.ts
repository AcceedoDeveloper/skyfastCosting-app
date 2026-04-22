





import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import * as customerActions from '../../store/product.actions';
import* as Selector from '../../store/product.selectors';
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../shared/config.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatRadioModule,
     MatCheckboxModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './edit-customer-details.component.html',
  styleUrl: './edit-customer-details.component.scss'
})
export class EditCustomerDetailsComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
    customerdeatilas$! : Observable<CustomerDetails[]>;
  rawMaterial$! : Observable<RawMaterial[]>;
  process$!: Observable<Process[]>;
  customerForm: FormGroup;
  revisionNumber = 1; 
  selectedRevisionIndex = 0; // default first revision
  packingOptions: string[] = ["none", "domestic", "international"];
    paymenttermsOptions:string[] =["30 Days","45 Days","60 Days","90 Days","Immediate"];
    deliverytermsoption:string[]=["Ex-Works","FOB","CIF"];

  selectedFile: File | null = null;
previewUrl: string | ArrayBuffer | null = null;
selectedFileName: string | null = null; // tracks uploaded file name
popupOpen: boolean = false; // for popup show/hide
showTransportInput = false;

loading = false;
  get processes(): FormArray {
    return this.customerForm.get('processes') as FormArray;
  }

  get commercialTermsParams(): FormArray {
    return this.customerForm.get('commercialTermsParams') as FormArray;
  }

  get transpotationParams(): FormArray {
    return this.customerForm.get('transpotationParams') as FormArray;
  }

  get rejectionParams(): FormArray {
    return this.customerForm.get('rejectionParams') as FormArray;
  }

  get otherParams(): FormArray {
    return this.customerForm.get('otherParams') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCustomerDetailsComponent>,
    private store : Store,
    @Inject(MAT_DIALOG_DATA) public data: CustomerDetails | null
    , private productservices : ProductService,
    private toastr : ToastrService,
    private config:ConfigService
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
      Rejection: [revision?.Rejection ?? 0],
      InterestRate: [revision?.InterestRate ?? 0],
      InspectorCost: [revision?.InspectorCost ?? 0],
      Freight:[revision?.Freight ?? ''],
      ModeOfTransport:[revision?.ModeOfTransport ?? ''],

      Packing: [revision?.Packing || 'domestic'],

      ToolAmbience: [revision?.ToolAmbience ],
      overHeadsPercent: [revision?.overHeadsPercent ],
      dieLifeTime: [ revision?.DieLifeTime ],
      // DieMaintenance:[revision?.DieMaintenance],
      // Inspection:[revision?.Inspection],
      // WIPPartsHandlingTray:[revision?.WIPPartsHandlingTray],
  PaymentTerms: [revision?.PaymentTerms || ''],
  DeliveryTerms: [revision?.DeliveryTerms || ''],


      CMMInspection: [revision?.CMMInspection],
  Insurance: [revision?.Insurance],
  SeaPacking: [revision?.SeaPacking],
    includeRejections: [revision?.includeRejections ?? false],

  Payment90DaysICC: [revision?.Payment90DaysICC],
  currency: [revision?.currency ],

      castingWeight: [revision?.castingWeight ?? 0],
      grossWeight:[revision?.grossWeight ?? 0],
      cavities: [revision?.cavities ?? 0],
      meltingLoss: [revision?.meltingLoss ?? 0],
      shortWeight: [revision?.shortWeight ?? 0],

      // rawMaterial IDs for mat-select
      rawMaterial: [revision?.rawMaterial?.map((r: any) => r._id) || []],

      packingPercentage: [revision?.packingPercentage ?? null],
      packingRate: [revision?.packingRate ?? null],
      TransportType: ['cost'],  // default is "cost"
      TransportCost: [revision?.packingRate ?? 0],
      TransportPercentage: [revision?.packingPercentage ?? 0],
      commercialTermsParams: this.fb.array([]),
      transpotationParams: this.fb.array([]),
      rejectionParams: this.fb.array([]),
      otherParams: this.fb.array([]),
      processes: this.fb.array([])
    });

    this.loadCustomParams('commercialTermsParams', revision?.commercialTermsParams);
    this.loadCustomParams('transpotationParams', revision?.transpotationParams);
    this.loadCustomParams('rejectionParams', revision?.rejectionParams);
    this.loadCustomParams('otherParams', revision?.otherParams);

    //  Fill processes from revision
    if (revision?.processes?.length) {
      revision.processes.forEach((proc: any) => this.addProcess(proc));
    }
  }


  

  ngOnInit(): void {
    this.onPackingChange(this.customerForm.get('Packing')?.value);

    this.rawMaterial$ = this.store.select(selectAllRawMaterials);

    this.rawMaterial$.subscribe( raw =>{
      console.log('raw data', raw);
    })

    this.store.dispatch(Action.loadRawMaterials());
    this.store.dispatch(Action.loadProcess());

    this.process$ = this.store.select(selectAllProcess);
    this.process$.subscribe(process =>{
      console.log('process', process);
      this.syncProcessSelections(process);
    })

    // Initialize file name from existing data
    console.log('data.drawingImage:', this.data?.drawingImage);
    if (this.data?.drawingImage) {
      this.previewUrl = this.getImageUrl(this.data.drawingImage);
      console.log('previewUrl set to:', this.previewUrl);
    }

this.customerForm.get('castingWeight')?.valueChanges.subscribe(value => {
  const casting = Number(value || 0);

  const shortWeight = casting * 2;

  this.customerForm.patchValue(
    { shortWeight },
    { emitEvent: false }
  );
});
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




  addProcess(proc: any = null) {
    const normalizedProcessId = this.extractProcessId(proc?.processId);
    const group = this.fb.group({
      processId: [normalizedProcessId],
      processName: [proc?.processName || '', Validators.required],
      TonnageJaw: [proc?.TonnageJaw || ''],
      Hours: [proc?.Hours ?? 0],
      Unit: [proc?.Unit || ''],
      cycleTime: [proc?.cycleTime ?? 0],
      cavity: [proc?.cavity ?? 0],
      sqInch: [proc?.sqInch ?? 0],
      cost: [proc?.cost ?? 0],
      calculation: [proc?.calculation ?? 0]
    });

    this.applyProcessUnitValidators(group);

    this.processes.push(group);
  }

  private extractProcessId(processId: any): string {
    if (!processId) {
      return '';
    }

    if (typeof processId === 'string') {
      return processId;
    }

    if (typeof processId === 'object') {
      return String(processId._id || processId.$oid || processId.id || '');
    }

    return String(processId);
  }

  private syncProcessSelections(processes: Process[]): void {
    this.processes.controls.forEach(control => {
      const currentProcessId = this.extractProcessId(control.get('processId')?.value);
      const currentProcessName = String(control.get('processName')?.value || '').trim();

      const matchedProcess = processes.find(process =>
        process._id === currentProcessId ||
        (!!currentProcessName && process.processName === currentProcessName)
      );

      if (matchedProcess?._id) {
        const matchedUnit = String((matchedProcess as any).Unit || '').toLowerCase();
        const patchData: any = {
          processId: matchedProcess._id,
          processName: matchedProcess.processName,
          TonnageJaw: control.get('TonnageJaw')?.value || matchedProcess.TonnageJaw,
          sqInch: this.toFiniteNumber(control.get('sqInch')?.value, this.toFiniteNumber((matchedProcess as any).sqInch, 0)),
          Hours: control.get('Hours')?.value || matchedProcess.Hours,
          Unit: matchedProcess.Unit,
          cycleTime: control.get('cycleTime')?.value || matchedProcess.cycleTime
        };

        if (matchedUnit === 'weight') {
          patchData.cycleTime = this.toFiniteNumber(this.customerForm.get('castingWeight')?.value, 0);
        }

        if (!control.get('cavity')?.value && matchedProcess.processName === 'PDC') {
          patchData.cavity = this.customerForm.get('cavities')?.value || matchedProcess.cavity;
        }

        control.patchValue(patchData, { emitEvent: false });
        this.applyProcessUnitValidators(control as FormGroup);
      }
    });
  }

  private applyProcessUnitValidators(group: FormGroup) {
    const unit = String(group.get('Unit')?.value || '').toLowerCase();
    const cavityControl = group.get('cavity');

    if (!cavityControl) {
      return;
    }

    if (unit === 'cost') {
      cavityControl.clearValidators();
    } else {
      cavityControl.setValidators([Validators.required]);
    }

    cavityControl.updateValueAndValidity({ emitEvent: false });
  }

  private createParamGroup(label = '', value = ''): FormGroup {
    return this.fb.group({
      label: [label],
      value: [value]
    });
  }

  addCustomParam(section: 'commercialTermsParams' | 'transpotationParams' | 'rejectionParams' | 'otherParams') {
    (this.customerForm.get(section) as FormArray).push(this.createParamGroup());
  }

  removeCustomParam(
    section: 'commercialTermsParams' | 'transpotationParams' | 'rejectionParams' | 'otherParams',
    index: number
  ) {
    (this.customerForm.get(section) as FormArray).removeAt(index);
  }

  private loadCustomParams(
    section: 'commercialTermsParams' | 'transpotationParams' | 'rejectionParams' | 'otherParams',
    params: Record<string, any> | undefined
  ) {
    const formArray = this.customerForm.get(section) as FormArray;
    formArray.clear();

    if (!params) {
      return;
    }

    Object.entries(params).forEach(([label, value]) => {
      formArray.push(this.createParamGroup(label, String(value ?? '')));
    });
  }

  removeProcess(index: number) {
    this.processes.removeAt(index);
  }

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedFile = input.files[0];
   this.selectedFileName = this.selectedFile.name; // set file name
    // Preview
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }
}

onSave() {
  if (!this.customerForm.valid) {
    this.customerForm.markAllAsTouched();
    return;
  }

  this.persistCustomer(false);
}

onBasicNext() {
  if (!this.customerForm.valid) {
    this.customerForm.markAllAsTouched();
    return;
  }

  this.persistCustomer(true, () => this.stepper.next());
}

onProcessNext() {
  if (this.processes.length === 0 || this.processes.invalid) {
    this.processes.markAllAsTouched();
    return;
  }

  this.persistCustomer(true, () => this.stepper.next());
}

private persistCustomer(keepDialogOpen: boolean, onSuccess?: () => void) {
  this.loading = true;

  this.rawMaterial$.pipe(take(1)).subscribe(allRawMaterials => {
    const updatedCustomer = this.buildUpdatedCustomer(allRawMaterials);
    const payload = this.buildPayload(updatedCustomer);

    this.productservices.updateCustomer(this.data?._id!, payload).subscribe({
      next: (res) => {
        console.log('Customer updated:', res);
        setTimeout(() => {
          this.toastr.success('Customer updated successfully!');
          this.loading = false;

          if (keepDialogOpen) {
            onSuccess?.();
            return;
          }

          this.dialogRef.close(true);
        }, 1000);
      },
      error: (err) => {
        console.error('Update failed:', err);
        setTimeout(() => {
          this.toastr.error('Failed to update customer');
          this.loading = false;
        }, 1000);
      }
    });
  });
}

private buildUpdatedCustomer(allRawMaterials: RawMaterial[]) {
  const formValue = this.customerForm.value;

  const selectedRawMaterials = (formValue.rawMaterial || []).map((id: string) => {
    const found = allRawMaterials.find(r => r._id === id);
    return found ? found.GradeName : id;
  });

  return {
    productName: formValue.productName,
    cavities: formValue.cavities,
    castingWeight: formValue.castingWeight,
    grossWeight: formValue.grossWeight,
    shortWeight: formValue.shortWeight,
    meltingLoss: formValue.meltingLoss,
    Rejection: formValue.Rejection,
    Packing: formValue.Packing,
    InterestRate: formValue.InterestRate,
    InspectorCost: formValue.InspectorCost,
    Freight: formValue.Freight,
    ModeOfTransport: formValue.ModeOfTransport,
    CMMInspection: formValue.CMMInspection,
    ToolAmbience: formValue.ToolAmbience,
    overHeadsPercent: formValue.overHeadsPercent,
    // DieMaintenance:formValue.DieMaintenance,
    // Inspection:formValue.Inspection,
    DieLifeTime: formValue.dieLifeTime,
    PaymentTerms:formValue.PaymentTerms,
    DeliveryTerms:formValue.DeliveryTerms,
    // WIPPartsHandlingTray:formValue.WIPPartsHandlingTray,

        includeRejections: formValue.includeRejections,

    packingPercentage: formValue.TransportPercentage,
    packingRate: formValue.TransportCost,
    ...(formValue.Packing === 'international' && {
      Insurance: formValue.Insurance,
      SeaPacking: formValue.SeaPacking,
      Payment90DaysICC: formValue.Payment90DaysICC,
      currency: formValue.currency,
      TransportPercentage: formValue.TransportPercentage,
      TransportCost: formValue.TransportCost
    }),
    customerName: typeof this.data?.customerName === 'string'
      ? this.data.customerName
      : this.data?.customerName?.customerName || '',
    rawMaterial: selectedRawMaterials,
    processes: (formValue.processes || []).map((p: any) => this.buildProcessPayload(p)),
    commercialTermsParams: this.buildParamsMap(this.commercialTermsParams),
    transpotationParams: this.buildParamsMap(this.transpotationParams),
    rejectionParams: this.buildParamsMap(this.rejectionParams),
    otherParams: this.buildParamsMap(this.otherParams),
    revisionNumber: this.revisionNumber
  };
}

private buildPayload(updatedCustomer: any) {
  if (!this.selectedFile) {
    return updatedCustomer;
  }

  const formData = new FormData();
  Object.entries(updatedCustomer).forEach(([key, value]) => {
    if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value as any);
    }
  });
  formData.append('drawingImage', this.selectedFile);
  return formData;
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
    processId: this.extractProcessId(process?.processId),
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




incrementRevision() {
  this.revisionNumber++;
  console.log(' Revision incremented:', this.revisionNumber);
  this.onSave();
}


  onCancel() {
    this.dialogRef.close();
  }

calculateProcessValue(proc: any): number {
  if (!proc) return 0;

  const unit = String(proc.Unit || '').toLowerCase();
  const hours = this.toFiniteNumber(proc.Hours, 0);
  const cycleTime = this.toFiniteNumber(proc.cycleTime, 1);
  const cavity = this.toFiniteNumber(proc.cavity, 1);
  const castingWeight = this.toFiniteNumber(this.customerForm.get('castingWeight')?.value, 0);
  const sqInch = this.toFiniteNumber(proc.sqInch, 0);

  if (unit === 'weight') {
    return +(castingWeight * hours).toFixed(4);
  }

  if (unit === 'square inch') {
    return +(sqInch * hours).toFixed(4);
  }

  if (unit === 'cost') {
    return +hours.toFixed(4);
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

  if (unit === 'cost') {
    return 'Formula: Machine / per hr';
  }

  return 'Formula: (Machine / per hr / (3600 / CycleTime) / Cavity)';
}

getProcessFormulaBreakdown(proc: any): string {
  const unit = String(proc?.Unit || '').toLowerCase();
  const castingWeight = this.toFiniteNumber(this.customerForm.get('castingWeight')?.value, 0);
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

  if (unit === 'cost') {
    return `= (${hours})`;
  }

  return `= (${hours} / (3600 / ${cycleTime}) / ${cavity})`;
}

isCostUnit(proc: any): boolean {
  return String(proc?.Unit || '').toLowerCase() === 'cost';
}

isSquareInchUnit(proc: any): boolean {
  return String(proc?.Unit || '').toLowerCase() === 'square inch';
}



onProcessSelected(processId: string, index: number) {
  this.process$.pipe(take(1)).subscribe(allProcesses => {
    const selectedProc = allProcesses.find(p => p._id === processId);

    if (selectedProc) {
      const processGroup = this.processes.at(index);
      const selectedUnit = String(selectedProc.Unit || '').toLowerCase();

      const patchData: any = {
        processName: selectedProc.processName,
        TonnageJaw: selectedProc.TonnageJaw,
        sqInch: this.toFiniteNumber(selectedProc.sqInch, 0),
        Hours: selectedProc.Hours,
        Unit: selectedProc.Unit,
        cycleTime: selectedProc.cycleTime,
        cost: selectedProc.cost,
        calculation: selectedProc.calculation
      };

      if (selectedUnit === 'weight') {
        patchData.cycleTime = this.toFiniteNumber(this.customerForm.get('castingWeight')?.value, 0);
      }

      // 🔹 If processName is PDC → auto-fill cavity from customerForm
      if (selectedProc.processName === 'PDC') {
        patchData.cavity = this.customerForm.get('cavities')?.value || 0;
      } else {
        patchData.cavity = selectedProc.cavity; // fallback
      }

      processGroup.patchValue(patchData);
      this.applyProcessUnitValidators(processGroup as FormGroup);
    }
  });
}

  close() {
    this.store.dispatch(customerActions.loadCustomers());
    this.dialogRef.close(true);
  }


  togglePopup() {
  this.popupOpen = !this.popupOpen;
}

onPackingChange(selected: string) {
  this.showTransportInput = selected === 'domestic' || selected === 'international';

  if (!this.showTransportInput) {
    this.customerForm.patchValue({
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






}
