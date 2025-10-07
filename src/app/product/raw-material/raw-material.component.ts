import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
export class RawMaterialComponent implements OnInit {
  popup : boolean = false;
   rawMaterialForm!: FormGroup;
    editingId: string | null = null;

  rawMaterials$!: Observable<RawMaterial[]>;
  
  // Pagination properties
  paginatedRawMaterials: RawMaterial[] = [];
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 0;
  totalItems = 0;

  constructor(private store: Store, private fb: FormBuilder, private dialog : MatDialog) {
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
      const data = this.rawMaterialForm.value;

      if (this.editingId) {
        // Edit mode
        this.store.dispatch(rawActions.updateRawMaterial({ id: this.editingId, rawMaterial: data }));
      } else {
        // Add mode
        this.store.dispatch(rawActions.addRawMaterial({ rawMaterial: data }));
      }

      this.close();
      this.rawMaterialForm.reset();
    }
  }

 // ✅ open Add popup
  addrawmaterial() {
    this.editingId = null;
    this.rawMaterialForm.reset();
    this.popup = true;
  }
   edit(rawMaterial: RawMaterial) {
    this.editingId = rawMaterial._id;
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
