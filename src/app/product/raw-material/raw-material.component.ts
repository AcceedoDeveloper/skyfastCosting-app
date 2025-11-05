import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import * as rawActions from '../store/product.actions';
import { selectAllRawMaterials } from '../store/product.selectors';
import { RawMaterial } from '../../model/product.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { ConfrimDialogComponent} from '../../shared/confrim-dialog/confrim-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RawMaterialPaginatorIntl } from '../../shared/raw-material-paginator-intl.service';

@Component({
  selector: 'app-raw-material',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: RawMaterialPaginatorIntl }
  ],
  templateUrl: './raw-material.component.html',
  styleUrl: './raw-material.component.scss'
})
export class RawMaterialComponent implements OnInit, OnDestroy {
  popup : boolean = false;
   rawMaterialForm!: FormGroup;
    editingId: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private isSaving = false;

  rawMaterials$!: Observable<RawMaterial[]>;
  
  // Pagination properties
  paginatedRawMaterials: RawMaterial[] = [];
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 0;
  totalItems = 0;

  constructor(private store: Store, private fb: FormBuilder, private dialog : MatDialog, private actions$: Actions) {
  }

  ngOnInit(): void {

    this.rawMaterials$ = this.store.select(selectAllRawMaterials);
    this.rawMaterials$.subscribe(rawMaterials => {
      console.log('Raw Materials from store:', rawMaterials);
      this.totalItems = rawMaterials.length;
      this.updatePaginatedData(rawMaterials);
    }); 

    this.store.dispatch(rawActions.loadRawMaterials());

    this.rawMaterialForm = this.fb.group({
      GradeName: ['', Validators.required],
      RatePerKg: ['', [Validators.required, Validators.min(0.01)]],
    });

    // Listen to success actions
    this.actions$.pipe(
      ofType(rawActions.addRawMaterialSuccess, rawActions.updateRawMaterialSuccess),
      takeUntil(this.destroy$),
      filter(() => this.isSaving)
    ).subscribe(() => {
      this.isSaving = false;
      this.errorMessage = null;
      this.close();
      this.rawMaterialForm.reset();
    });

    // Listen to failure actions
    this.actions$.pipe(
      ofType(rawActions.apiFailure),
      takeUntil(this.destroy$),
      filter(() => this.isSaving)
    ).subscribe((action) => {
      this.isSaving = false;
      // Extract error message from backend response
      const error = action.error;
      let message = 'An error occurred. Please try again.';
      
      // Try different error message formats from backend
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.error?.error) {
        message = error.error.error;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error?.error && typeof error.error === 'string') {
        message = error.error;
      }
      
      this.errorMessage = message;
    });
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Update paginated data based on current page and page size
  updatePaginatedData(allRawMaterials: RawMaterial[]): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRawMaterials = allRawMaterials.slice(startIndex, endIndex);
  }

  // Handle page change event
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    this.rawMaterials$.subscribe(rawMaterials => {
      this.updatePaginatedData(rawMaterials);
    });
  }


  onSubmit() {
    if (this.rawMaterialForm.valid) {
      this.errorMessage = null;
      this.isSaving = true;
      const data = this.rawMaterialForm.value;

      if (this.editingId) {
        // Edit mode
        this.store.dispatch(rawActions.updateRawMaterial({ id: this.editingId, rawMaterial: data }));
      } else {
        // Add mode
        this.store.dispatch(rawActions.addRawMaterial({ rawMaterial: data }));
      }
      // Don't close popup here - wait for success/failure action
    }
  }

 // ✅ open Add popup
  addrawmaterial() {
    this.editingId = null;
    this.errorMessage = null;
    this.rawMaterialForm.reset();
    this.popup = true;
  }
   edit(rawMaterial: RawMaterial) {
    this.editingId = rawMaterial._id;
    this.errorMessage = null;
    this.rawMaterialForm.patchValue({
      GradeName: rawMaterial.GradeName,
      RatePerKg: rawMaterial.RatePerKg
    });
    this.popup = true;
  }

  close() {
    this.popup = false;
    this.editingId = null;
  }

 delete(id: string) {
  const dialogRef = this.dialog.open(ConfrimDialogComponent, {
    width: '350px',
    data: {
      title: 'Delete Raw Material',
      message: 'Are you sure you want to delete this raw material?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(rawActions.deleteRawMaterial({ id }));
    } 
  });
}

}
