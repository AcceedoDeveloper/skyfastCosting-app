
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
     private toastr : ToastrService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      customerName: ['', Validators.required],
      productName: ['', Validators.required],
       partName: ['', [Validators.required, this.duplicatePartNameValidator.bind(this)]],
      drawingNo: ['', ],      
      castingWeight: [null, Validators.required],
      shortWeight: [null, Validators.required],
      meltingLoss: [null, Validators.required],
      rawMaterial: [[]],
      
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
      console.log('partname',this.partName);
      
      
      
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
      { code: 'USD', name: 'US Dollar', country: 'United States', symbol: '$' },
      { code: 'EUR', name: 'Euro', country: 'European Union', symbol: '€' },
      { code: 'GBP', name: 'British Pound', country: 'United Kingdom', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', country: 'Japan', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', country: 'Australia', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', country: 'China', symbol: '¥' },
      { code: 'SEK', name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
      { code: 'NZD', name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
      { code: 'MXN', name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
      { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$' },
      { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: 'HK$' },
      { code: 'NOK', name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
      { code: 'TRY', name: 'Turkish Lira', country: 'Turkey', symbol: '₺' },
      { code: 'RUB', name: 'Russian Ruble', country: 'Russia', symbol: '₽' },
      { code: 'INR', name: 'Indian Rupee', country: 'India', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
      { code: 'ZAR', name: 'South African Rand', country: 'South Africa', symbol: 'R' },
      { code: 'KRW', name: 'South Korean Won', country: 'South Korea', symbol: '₩' },
      { code: 'THB', name: 'Thai Baht', country: 'Thailand', symbol: '฿' },
      { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
      { code: 'PHP', name: 'Philippine Peso', country: 'Philippines', symbol: '₱' },
      { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
      { code: 'VND', name: 'Vietnamese Dong', country: 'Vietnam', symbol: '₫' },
      { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', symbol: 'د.إ' },
      { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: '﷼' },
      { code: 'QAR', name: 'Qatari Riyal', country: 'Qatar', symbol: '﷼' },
      { code: 'KWD', name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: 'د.ك' },
      { code: 'BHD', name: 'Bahraini Dinar', country: 'Bahrain', symbol: 'د.ب' },
      { code: 'OMR', name: 'Omani Rial', country: 'Oman', symbol: '﷼' },
      { code: 'JOD', name: 'Jordanian Dinar', country: 'Jordan', symbol: 'د.ا' },
      { code: 'LBP', name: 'Lebanese Pound', country: 'Lebanon', symbol: 'ل.ل' },
      { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt', symbol: '£' },
      { code: 'ILS', name: 'Israeli Shekel', country: 'Israel', symbol: '₪' },
      { code: 'PLN', name: 'Polish Zloty', country: 'Poland', symbol: 'zł' },
      { code: 'CZK', name: 'Czech Koruna', country: 'Czech Republic', symbol: 'Kč' },
      { code: 'HUF', name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
      { code: 'RON', name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
      { code: 'BGN', name: 'Bulgarian Lev', country: 'Bulgaria', symbol: 'лв' },
      { code: 'HRK', name: 'Croatian Kuna', country: 'Croatia', symbol: 'kn' },
      { code: 'RSD', name: 'Serbian Dinar', country: 'Serbia', symbol: 'дин' },
      { code: 'UAH', name: 'Ukrainian Hryvnia', country: 'Ukraine', symbol: '₴' },
      { code: 'DKK', name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
      { code: 'ISK', name: 'Icelandic Krona', country: 'Iceland', symbol: 'kr' },
      { code: 'NPR', name: 'Nepalese Rupee', country: 'Nepal', symbol: '₨' },
      { code: 'PKR', name: 'Pakistani Rupee', country: 'Pakistan', symbol: '₨' },
      { code: 'LKR', name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: '₨' },
      { code: 'BDT', name: 'Bangladeshi Taka', country: 'Bangladesh', symbol: '৳' },
      { code: 'MMK', name: 'Myanmar Kyat', country: 'Myanmar', symbol: 'K' },
      { code: 'KHR', name: 'Cambodian Riel', country: 'Cambodia', symbol: '៛' },
      { code: 'LAK', name: 'Lao Kip', country: 'Laos', symbol: '₭' },
      { code: 'MNT', name: 'Mongolian Tugrik', country: 'Mongolia', symbol: '₮' },
      { code: 'KZT', name: 'Kazakhstani Tenge', country: 'Kazakhstan', symbol: '₸' },
      { code: 'UZS', name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: 'лв' },
      { code: 'KGS', name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', symbol: 'лв' },
      { code: 'TJS', name: 'Tajikistani Somoni', country: 'Tajikistan', symbol: 'SM' },
      { code: 'TMT', name: 'Turkmenistani Manat', country: 'Turkmenistan', symbol: 'T' },
      { code: 'AFN', name: 'Afghan Afghani', country: 'Afghanistan', symbol: '؋' },
      { code: 'IRR', name: 'Iranian Rial', country: 'Iran', symbol: '﷼' },
      { code: 'IQD', name: 'Iraqi Dinar', country: 'Iraq', symbol: 'د.ع' },
      { code: 'SYP', name: 'Syrian Pound', country: 'Syria', symbol: '£' },
      { code: 'YER', name: 'Yemeni Rial', country: 'Yemen', symbol: '﷼' },
      { code: 'AMD', name: 'Armenian Dram', country: 'Armenia', symbol: '֏' },
      { code: 'AZN', name: 'Azerbaijani Manat', country: 'Azerbaijan', symbol: '₼' },
      { code: 'GEL', name: 'Georgian Lari', country: 'Georgia', symbol: '₾' },
      { code: 'MDL', name: 'Moldovan Leu', country: 'Moldova', symbol: 'L' },
      { code: 'BYN', name: 'Belarusian Ruble', country: 'Belarus', symbol: 'Br' },
      { code: 'LTL', name: 'Lithuanian Litas', country: 'Lithuania', symbol: 'Lt' },
      { code: 'LVL', name: 'Latvian Lats', country: 'Latvia', symbol: 'Ls' },
      { code: 'EEK', name: 'Estonian Kroon', country: 'Estonia', symbol: 'kr' },
      { code: 'ALL', name: 'Albanian Lek', country: 'Albania', symbol: 'L' },
      { code: 'MKD', name: 'Macedonian Denar', country: 'North Macedonia', symbol: 'ден' },
      { code: 'BAM', name: 'Bosnia and Herzegovina Convertible Mark', country: 'Bosnia and Herzegovina', symbol: 'КМ' },
      { code: 'MNT', name: 'Montenegrin Euro', country: 'Montenegro', symbol: '€' },
      { code: 'XCD', name: 'East Caribbean Dollar', country: 'Eastern Caribbean', symbol: '$' },
      { code: 'BBD', name: 'Barbadian Dollar', country: 'Barbados', symbol: '$' },
      { code: 'BZD', name: 'Belize Dollar', country: 'Belize', symbol: '$' },
      { code: 'JMD', name: 'Jamaican Dollar', country: 'Jamaica', symbol: '$' },
      { code: 'TTD', name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', symbol: '$' },
      { code: 'BMD', name: 'Bermudian Dollar', country: 'Bermuda', symbol: '$' },
      { code: 'BSD', name: 'Bahamian Dollar', country: 'Bahamas', symbol: '$' },
      { code: 'KYD', name: 'Cayman Islands Dollar', country: 'Cayman Islands', symbol: '$' },
      { code: 'AWG', name: 'Aruban Florin', country: 'Aruba', symbol: 'ƒ' },
      { code: 'ANG', name: 'Netherlands Antillean Guilder', country: 'Netherlands Antilles', symbol: 'ƒ' },
      { code: 'COP', name: 'Colombian Peso', country: 'Colombia', symbol: '$' },
      { code: 'VES', name: 'Venezuelan Bolívar', country: 'Venezuela', symbol: 'Bs' },
      { code: 'PEN', name: 'Peruvian Sol', country: 'Peru', symbol: 'S/' },
      { code: 'BOB', name: 'Bolivian Boliviano', country: 'Bolivia', symbol: 'Bs' },
      { code: 'CLP', name: 'Chilean Peso', country: 'Chile', symbol: '$' },
      { code: 'ARS', name: 'Argentine Peso', country: 'Argentina', symbol: '$' },
      { code: 'UYU', name: 'Uruguayan Peso', country: 'Uruguay', symbol: '$' },
      { code: 'PYG', name: 'Paraguayan Guarani', country: 'Paraguay', symbol: '₲' },
      { code: 'GYD', name: 'Guyanese Dollar', country: 'Guyana', symbol: '$' },
      { code: 'SRD', name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
      { code: 'FKP', name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '£' },
      { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt', symbol: '£' },
      { code: 'LYD', name: 'Libyan Dinar', country: 'Libya', symbol: 'ل.د' },
      { code: 'TND', name: 'Tunisian Dinar', country: 'Tunisia', symbol: 'د.ت' },
      { code: 'DZD', name: 'Algerian Dinar', country: 'Algeria', symbol: 'د.ج' },
      { code: 'MAD', name: 'Moroccan Dirham', country: 'Morocco', symbol: 'د.م.' },
      { code: 'ETB', name: 'Ethiopian Birr', country: 'Ethiopia', symbol: 'Br' },
      { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya', symbol: 'KSh' },
      { code: 'UGX', name: 'Ugandan Shilling', country: 'Uganda', symbol: 'USh' },
      { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania', symbol: 'TSh' },
      { code: 'RWF', name: 'Rwandan Franc', country: 'Rwanda', symbol: 'RF' },
      { code: 'BIF', name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
      { code: 'DJF', name: 'Djiboutian Franc', country: 'Djibouti', symbol: 'Fdj' },
      { code: 'SOS', name: 'Somali Shilling', country: 'Somalia', symbol: 'S' },
      { code: 'ERN', name: 'Eritrean Nakfa', country: 'Eritrea', symbol: 'Nfk' },
      { code: 'SDG', name: 'Sudanese Pound', country: 'Sudan', symbol: 'ج.س.' },
      { code: 'SSP', name: 'South Sudanese Pound', country: 'South Sudan', symbol: '£' },
      { code: 'CDF', name: 'Congolese Franc', country: 'Democratic Republic of Congo', symbol: 'FC' },
      { code: 'AOA', name: 'Angolan Kwanza', country: 'Angola', symbol: 'Kz' },
      { code: 'ZMW', name: 'Zambian Kwacha', country: 'Zambia', symbol: 'ZK' },
      { code: 'MWK', name: 'Malawian Kwacha', country: 'Malawi', symbol: 'MK' },
      { code: 'BWP', name: 'Botswana Pula', country: 'Botswana', symbol: 'P' },
      { code: 'SZL', name: 'Swazi Lilangeni', country: 'Eswatini', symbol: 'L' },
      { code: 'LSL', name: 'Lesotho Loti', country: 'Lesotho', symbol: 'L' },
      { code: 'NAD', name: 'Namibian Dollar', country: 'Namibia', symbol: 'N$' },
      { code: 'MGA', name: 'Malagasy Ariary', country: 'Madagascar', symbol: 'Ar' },
      { code: 'MUR', name: 'Mauritian Rupee', country: 'Mauritius', symbol: '₨' },
      { code: 'SCR', name: 'Seychellois Rupee', country: 'Seychelles', symbol: '₨' },
      { code: 'KMF', name: 'Comorian Franc', country: 'Comoros', symbol: 'CF' },
      { code: 'MVR', name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
      { code: 'NPR', name: 'Nepalese Rupee', country: 'Nepal', symbol: '₨' },
      { code: 'BTN', name: 'Bhutanese Ngultrum', country: 'Bhutan', symbol: 'Nu.' },
      { code: 'MOP', name: 'Macanese Pataca', country: 'Macau', symbol: 'MOP$' },
      { code: 'TWD', name: 'Taiwan New Dollar', country: 'Taiwan', symbol: 'NT$' },
      { code: 'HNL', name: 'Honduran Lempira', country: 'Honduras', symbol: 'L' },
      { code: 'GTQ', name: 'Guatemalan Quetzal', country: 'Guatemala', symbol: 'Q' },
      { code: 'NIO', name: 'Nicaraguan Córdoba', country: 'Nicaragua', symbol: 'C$' },
      { code: 'CRC', name: 'Costa Rican Colón', country: 'Costa Rica', symbol: '₡' },
      { code: 'PAB', name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
      { code: 'DOP', name: 'Dominican Peso', country: 'Dominican Republic', symbol: '$' },
      { code: 'HTG', name: 'Haitian Gourde', country: 'Haiti', symbol: 'G' },
      { code: 'CUP', name: 'Cuban Peso', country: 'Cuba', symbol: '$' },
      { code: 'XOF', name: 'West African CFA Franc', country: 'West Africa', symbol: 'CFA' },
      { code: 'XAF', name: 'Central African CFA Franc', country: 'Central Africa', symbol: 'FCFA' },
      { code: 'XPF', name: 'CFP Franc', country: 'French Pacific Territories', symbol: '₣' }
    ];

// previewUrl: string | ArrayBuffer | null = null;
popupOpen = false;

togglePopup() {
  this.popupOpen = !this.popupOpen;
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