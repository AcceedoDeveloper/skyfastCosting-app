import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { VersionService } from '../../../../services/version.service';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-create-version-dialog',
   imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-version-dialog.component.html',
  styleUrl: './create-version-dialog.component.scss'
})
export class CreateVersionDialogComponent implements OnInit {
  versionForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateVersionDialogComponent>,
    private versionService: VersionService,
    private toastr: ToastrService
  ) {
    this.versionForm = this.fb.group({
      heading: ['', Validators.required],
      sections: this.fb.array([this.createSection()])
    });
  }

  ngOnInit(): void {}

  get sections(): FormArray {
    return this.versionForm.get('sections') as FormArray;
  }

  createSection(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  onaddsection(): void {
    this.sections.push(this.createSection());
  }

  removesection(index: number): void {
    if (this.sections.length > 1) {
      this.sections.removeAt(index);
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const group = this.sections.at(index) as FormGroup;
      group.patchValue({ image: file });
      group.get('image')?.updateValueAndValidity();
    }
  }

  getFileName(index: number): string {
    const group = this.sections.at(index) as FormGroup;
    const file = group.get('image')?.value;
    return file ? file.name : 'No file chosen';
  }

  onSubmit(): void {
    if (this.versionForm.invalid) {
      this.versionForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.versionForm.value;
    console.log('formValue',formValue);
    
    const fd = new FormData();
    fd.append('heading', formValue.heading.trim());

    // Build images + metadata: send files under a single 'images' field and send metadata JSON as 'imagesData'
    const imagesMeta: Array<{ label: string; image: string }> = [];
    // Use a plain for-loop so we can return early on validation failure
    for (let i = 0; i < this.sections.length; i++) {
      const g = this.sections.at(i) as FormGroup;
      const label = g.get('label')?.value;
      const file = g.get('image')?.value;

      // If a file is present, label must be provided
      if (file && (!label || !label.toString().trim())) {
        g.get('label')?.setErrors({ required: true });
        this.toastr.warning('Labels are required for all images');
        this.isSubmitting = false;
        return; // stop submission
      }

      if (file) {
        fd.append('images', file, file.name); // backend commonly expects 'images' (no [] suffix)
        imagesMeta.push({ label: label?.toString().trim() || '', image: file.name });
      }
    }

    fd.append('imagesData', JSON.stringify(imagesMeta));
    // Append labels once per image (use only 'labels[]' to avoid doubling)
    imagesMeta.forEach((m) => {
      fd.append('labels[]', m.label);
    });

    // Debug: log FormData keys to console for troubleshooting
    // Use a runtime-safe approach: try entries(), otherwise fall back to a known-key list and use getAll/get
    try {
      const e = (fd as any).entries;
      if (typeof e === 'function') {
        for (const pair of (fd as any).entries()) {
          const [k, v] = pair as [string, any];
          if (v instanceof File) console.log('FormData:', k, v.name);
          else console.log('FormData:', k, v);
        }
      } else {
        // Fallback: check a list of common keys we append
        const keys = ['heading', 'images', 'newImages', 'replaceImages', 'imagesData', 'labels[]', 'labels', 'deletedImages', 'deletedImages[]'];
        for (const key of keys) {
          const values = (fd as any).getAll ? (fd as any).getAll(key) : [(fd as any).get ? (fd as any).get(key) : undefined];
          values.forEach((v: any) => {
            if (v instanceof File) console.log('FormData:', key, v.name);
            else console.log('FormData:', key, v);
          });
        }
      }
    } catch (err) {
      console.warn('Could not enumerate FormData for debug logging', err);
    }
    console.log('imagesData JSON:', JSON.stringify(imagesMeta));

    this.versionService.addVersions(fd).subscribe({
    
      
      next: (response) => {
        console.log('✅ Version created successfully:', response);
        this.toastr.success('Version created successfully');
        this.dialogRef.close(true);
          console.log('hi',fd);
      },
      error: (error) => {
        console.error('❌ Error creating version:', error);
        this.toastr.error('Failed to create version');
        this.isSubmitting = false;
         console.log('hi',fd);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
