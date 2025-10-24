
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
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../shared/config.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

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
    LoadingSpinnerComponent,
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

  selectedFile: File | null = null;
previewUrl: string | ArrayBuffer | null = null;
selectedFileName: string | null = null; // tracks uploaded file name
popupOpen: boolean = false; // for popup show/hide
showTransportInput = false;

loading = false;
  get processes(): FormArray {
    return this.customerForm.get('processes') as FormArray;
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

      Packing: [revision?.Packing || ''],
      ToolAmbience: [revision?.ToolAmbience ],
      overHeadsPercent: [revision?.overHeadsPercent ],
      dieLifeTime: [ revision?.DieLifeTime ],



      CMMInspection: [revision?.CMMInspection],
  Insurance: [revision?.Insurance],
  SeaPacking: [revision?.SeaPacking],
  Payment90DaysICC: [revision?.Payment90DaysICC],
  currency: [revision?.currency ],

      castingWeight: [revision?.castingWeight ?? 0],
      cavities: [revision?.cavities ?? 0],
      meltingLoss: [revision?.meltingLoss ?? 0],
      shortWeight: [revision?.shortWeight ?? 0],

      // 👇 rawMaterial IDs for mat-select
      rawMaterial: [revision?.rawMaterial?.map((r: any) => r._id) || []],

      packingPercentage: [revision?.packingPercentage ?? null],
      packingRate: [revision?.packingRate ?? null],
      TransportType: ['cost'],  // 👈 default is "cost"
      TransportCost: [revision?.packingRate ?? 0],
      TransportPercentage: [revision?.packingPercentage ?? 0],

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

    // Initialize file name from existing data
    console.log('data.drawingImage:', this.data?.drawingImage);
    if (this.data?.drawingImage) {
       const api  = this.config.getCostingUrl('');
      // this.selectedFileName = 'Existing Image';
      // Convert relative path to full URL using the correct base URL
      this.previewUrl = this.data.drawingImage.startsWith('http') 
        ? this.data.drawingImage 
        : api+`${this.data.drawingImage}`;
      console.log('previewUrl set to:', this.previewUrl);
    }
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

// onSave() {
//   if (this.customerForm.valid) {
//     const formValue = this.customerForm.value;

//     let selectedRawMaterials: any[] = [];
//     this.rawMaterial$.pipe(take(1)).subscribe(allRawMaterials => {
//       selectedRawMaterials = (formValue.rawMaterial || []).map((id: string) => {
//         const found = allRawMaterials.find(r => r._id === id);
//         return found ? found.GradeName : id; // ✅ store only grade names
//       });
//     });

//     const updatedCustomer = {
//       productName: formValue.productName,
//       cavities: formValue.cavities,
//       castingWeight: formValue.castingWeight,
//       shortWeight: formValue.shortWeight,
//       meltingLoss: formValue.meltingLoss,

//       // 👇 Map with correct casing
//       Rejection: formValue.rejection,
//       Packing: formValue.packing,
//       InterestRate: formValue.interestRate,
//       InspectorCost: formValue.inspectorCost,
//       ToolAmbience: formValue.toolAmbience,
//       overHeadsPercent: formValue.overHeadsPercent,
//       DieLifeTime: formValue.DieLifeTime,

//       packingPercentage: formValue.packingPercentage,
//   packingRate: formValue.packingRate,


//    ...(formValue.packing === 'international' && {
//     CMMInspection: formValue.CMMInspection,
//     Insurance: formValue.Insurance,
//     SeaPacking: formValue.SeaPacking,
//     Payment90DaysICC: formValue.Payment90DaysICC
//   }),

//       customerName: typeof this.data?.customerName === 'string' 

//         : this.data?.customerName?.customerName || '',

//       rawMaterial: selectedRawMaterials,
//       processes: formValue.processes.map((p: any) => ({
//         processName: p.processName,
//         TonnageJaw: p.TonnageJaw,
//         Hours: p.Hours,
//         cycleTime: p.cycleTime,
//         cavity: p.cavity
//       })),

//       revisionNumber: this.revisionNumber
//     };

//     console.log('📦 Final Payload (Correct):', updatedCustomer);

//     this.store.dispatch(
//       Action.updateCustomer({
//         id: this.data?._id!,
//         customer: updatedCustomer
//       })
//     );

//     this.store.dispatch(Action.loadCustomers());


//   }
//    this.dialogRef.close();
//        this.store.dispatch(Action.loadCustomers());

// }

onSave() {
  if (this.customerForm.valid) {
    this.loading = true; // Start spinner
    const formValue = this.customerForm.value;

    // ✅ Build rawMaterial names
    let selectedRawMaterials: any[] = [];
    this.rawMaterial$.pipe(take(1)).subscribe(allRawMaterials => {
      selectedRawMaterials = (formValue.rawMaterial || []).map((id: string) => {
        const found = allRawMaterials.find(r => r._id === id);
        return found ? found.GradeName : id;
      });
    });

    // ✅ Construct full customer object
    const updatedCustomer: any = {
      productName: formValue.productName,
      cavities: formValue.cavities,
      castingWeight: formValue.castingWeight,
      shortWeight: formValue.shortWeight,
      meltingLoss: formValue.meltingLoss,
      Rejection: formValue.Rejection,
      Packing: formValue.Packing,
      InterestRate: formValue.InterestRate,
      InspectorCost: formValue.InspectorCost,
      Freight: formValue.Freight,
      ModeOfTransport: formValue.ModeOfTransport,
      ToolAmbience: formValue.ToolAmbience,
      overHeadsPercent: formValue.overHeadsPercent,
      DieLifeTime: formValue.dieLifeTime,
      packingPercentage: formValue.TransportPercentage,
      packingRate: formValue.TransportCost,
      ...(formValue.Packing === 'international' && {
        CMMInspection: formValue.CMMInspection,
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
      processes: (formValue.processes || []).map((p: any) => ({
        processName: p.processName,
        TonnageJaw: p.TonnageJaw,
        Hours: p.Hours,
        cycleTime: p.cycleTime,
        cavity: p.cavity
      })),
      revisionNumber: this.revisionNumber
    };

    console.log('data', updatedCustomer);

    // ✅ Decide between FormData and JSON
    let payload: any;
    if (this.selectedFile) {
      const formData = new FormData();
      Object.entries(updatedCustomer).forEach(([key, value]) => {
        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value)); // serialize arrays/objects
        } else {
          formData.append(key, value as any);
        }
      });
      formData.append('drawingImage', this.selectedFile);
      payload = formData;
    } else {
      payload = updatedCustomer;
    }

    // ✅ Call service directly
    this.productservices.updateCustomer(this.data?._id!, payload).subscribe({
      next: (res) => {
        console.log('✅ Customer updated:', res);
        // Add delay of 2 seconds before stopping spinner and closing dialog
        setTimeout(() => {
          this.toastr.success('Customer updated successfully!');
          this.dialogRef.close(true);
          this.loading = false; // Stop spinner
        }, 1000); // 2000ms = 2 seconds
      },
      error: (err) => {
        console.error('❌ Update failed:', err);
        // Add delay of 2 seconds before stopping spinner and showing error
        setTimeout(() => {
          this.toastr.error('Failed to update customer');
          this.loading = false; // Stop spinner
        }, 1000); // 2000ms = 2 seconds
      }
    });
  }
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

  return +(hours / (3600 / cycleTime)/ cavity).toFixed(4); // rounded to 4 decimals
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

  close() {
    this.dialogRef.close();
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




}