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


@Component({
  selector: 'app-raw-material',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './raw-material.component.html',
  styleUrl: './raw-material.component.scss'
})
export class RawMaterialComponent implements OnInit {
  popup : boolean = false;
   rawMaterialForm!: FormGroup;
    editingId: string | null = null;

  rawMaterials$!: Observable<RawMaterial[]>;

  constructor(private store: Store, private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.rawMaterials$ = this.store.select(selectAllRawMaterials);
    this.rawMaterials$.subscribe(rawMaterials => {
      console.log('Raw Materials from store:', rawMaterials);
    }); 

    this.store.dispatch(rawActions.loadRawMaterials());



    this.rawMaterialForm = this.fb.group({
      GradeName: ['', Validators.required],
      RatePerKg: ['', [Validators.required, Validators.min(1)]],
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
    this.store.dispatch(rawActions.deleteRawMaterial({ id }));
  }
}
