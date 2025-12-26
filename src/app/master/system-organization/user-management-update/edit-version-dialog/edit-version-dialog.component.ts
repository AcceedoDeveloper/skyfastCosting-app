
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../../shared/config.service';
import { VersionService } from '../../../../services/version.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-version-dialog',
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
  templateUrl: './edit-version-dialog.component.html',
  styleUrl: './edit-version-dialog.component.scss'
})
export class EditVersionDialogComponent implements OnInit, OnDestroy {
  editForm: FormGroup;
  isSubmitting = false;
  originalFormValue: any;
  dialogData: any;

  // Live preview for selected images
  previewUrls: { [key: number]: string } = {};

  // Track successfully replaced images and updated labels
  replacedIndices: Set<number> = new Set();
  updatedLabels: Set<number> = new Set();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditVersionDialogComponent>,
    private versionService: VersionService,
    private toastr: ToastrService,
    private config: ConfigService,
    @Inject(MAT_DIALOG_DATA) public data: { version: any }
  ) {
    this.dialogData = data;

    this.editForm = this.fb.group({
      heading: [data?.version?.heading || '', Validators.required],
      sections: this.fb.array([])
    });

    // Populate existing images with sub-document _id
    if (data?.version?.images && Array.isArray(data.version.images) && data.version.images.length > 0) {
      data.version.images.forEach((img: any) => {
        this.sections.push(
          this.fb.group({
            label: [img.label || '', Validators.required],
            existingImageUrl: [this.buildUploadUrl(`version/${img.image}`)],
            image: [null],
            isNew: [false],
            originalImage: [img.image],
            imageId: [img._id]
          })
        );
      });
    }

    this.originalFormValue = this.editForm.getRawValue();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    Object.values(this.previewUrls).forEach(url => URL.revokeObjectURL(url));
    this.replacedIndices.clear();
    this.updatedLabels.clear();
  }

  get sections(): FormArray {
    return this.editForm.get('sections') as FormArray;
  }

  addSection(): void {
    this.sections.push(
      this.fb.group({
        label: ['', Validators.required],
        existingImageUrl: [null],
        image: [null],
        isNew: [true],
        originalImage: [null],
        imageId: [null]
      })
    );
  }

  removeSection(index: number): void {
    const section = this.sections.at(index) as FormGroup;
    const isNew = section.get('isNew')?.value;
    const imageId = section.get('imageId')?.value;

    if (isNew) {
      this.sections.removeAt(index);
      if (this.previewUrls[index]) {
        URL.revokeObjectURL(this.previewUrls[index]);
        delete this.previewUrls[index];
      }
      return;
    }

    if (imageId) {
      this.versionService.deleteVersionObject(imageId).subscribe({
        next: () => {
          this.toastr.success('Image deleted successfully');
          this.sections.removeAt(index);
          if (this.previewUrls[index]) {
            URL.revokeObjectURL(this.previewUrls[index]);
            delete this.previewUrls[index];
          }
          this.replacedIndices.delete(index);
          this.updatedLabels.delete(index);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.toastr.error('Failed to delete image');
        }
      });
    }
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const group = this.sections.at(index) as FormGroup;

      // Validate image format
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!allowed.includes(file.type)) {
        group.get('image')?.setErrors({ invalidFormat: true });
        this.toastr.error('Unsupported image format. Allowed: PNG, JPG, GIF, WEBP, BMP, SVG');
        return;
      }

      group.patchValue({ image: file });
      group.get('image')?.setErrors(null); // clear invalid format error

      // Live preview
      if (this.previewUrls[index]) {
        URL.revokeObjectURL(this.previewUrls[index]);
      }
      this.previewUrls[index] = URL.createObjectURL(file);

      // Instant replace for existing images
      if (!group.get('isNew')?.value) {
        this.replaceSingleImage(index);
      }
    }
  }

  private replaceSingleImage(index: number): void {
    const section = this.sections.at(index) as FormGroup;
    const file = section.get('image')?.value;
    const label = section.get('label')?.value?.trim();
    const imageId = section.get('imageId')?.value;

    if (!(file instanceof File) || !imageId) return;

    const fd = new FormData();
    fd.append('label', label || '');
    fd.append('image', file);

    this.versionService.updateVersionObject(imageId, fd).subscribe({
      next: () => {
        this.toastr.success('Image replaced successfully');
        this.replacedIndices.add(index);

        section.patchValue({ image: null });
        if (this.previewUrls[index]) {
          URL.revokeObjectURL(this.previewUrls[index]);
          delete this.previewUrls[index];
        }
      },
      error: (err) => {
        console.error('Replace failed:', err);
        this.toastr.error('Failed to replace image');
      }
    });
  }

  // Instant label update on blur
  onLabelBlur(index: number): void {
    const section = this.sections.at(index) as FormGroup;
    const isNew = section.get('isNew')?.value;
    if (isNew) return;

    const currentLabel = section.get('label')?.value?.trim();
    const originalLabel = this.dialogData?.version?.images[index]?.label?.trim();

    if (currentLabel !== originalLabel) {
      this.updateLabelOnly(index);
    }
  }

  private updateLabelOnly(index: number): void {
    const section = this.sections.at(index) as FormGroup;
    const label = section.get('label')?.value?.trim();
    const imageId = section.get('imageId')?.value;

    if (!imageId) return;

    const fd = new FormData();
    fd.append('label', label || '');

    this.versionService.updateVersionObject(imageId, fd).subscribe({
      next: () => {
        this.toastr.success('Label updated successfully');
        this.updatedLabels.add(index);
      },
      error: (err) => {
        console.error('Label update failed:', err);
        this.toastr.error('Failed to update label');
      }
    });
  }

  getFileName(index: number): string {
    const group = this.sections.at(index) as FormGroup;
    const file = group.get('image')?.value;

    if (this.replacedIndices.has(index)) {
      return 'Replaced Successfully';
    }

    return file instanceof File ? file.name : 'No change';
  }

  hasChanges(): boolean {
    const formChanged = JSON.stringify(this.editForm.getRawValue()) !== JSON.stringify(this.originalFormValue);
    return formChanged || this.replacedIndices.size > 0 || this.updatedLabels.size > 0;
  }

  private getBaseUrl(): string {
    try {
      const url = this.config.getCostingUrl('getVersions');
      const base = url.replace(/getVersions\/?$/, '');
      return base.replace(/\/$/, '');
    } catch (e) {
      return '';
    }
  }

  private buildUploadUrl(path: string): string {
    const base = this.getBaseUrl();
    return `${base}/uploads/${path}`.replace(/([^:]\/)\//g, '$1');
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('heading', this.editForm.get('heading')?.value.trim());

    const updatedImages: any[] = [];
    let hasNewImages = false;

    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections.at(i) as FormGroup;
      const label = section.get('label')?.value?.trim();
      const file = section.get('image')?.value;
      const isNew = section.get('isNew')?.value;
      const originalImage = section.get('originalImage')?.value;
      const imageId = section.get('imageId')?.value;

      if (isNew && file instanceof File) {
        formData.append('images', file);
        formData.append('labels[]', label || '');
        hasNewImages = true;
      }

      updatedImages.push({
        label,
        isNew,
        original: isNew ? null : originalImage,
        replace: isNew ? null : (file instanceof File ? file.name : null),
        imageId: isNew ? null : imageId
      });
    }

    formData.append('imagesData', JSON.stringify(updatedImages));

    const versionId = this.dialogData?.version?._id;

    this.versionService.updateVersions(versionId, formData).subscribe({
      next: () => {
        this.toastr.success('Version updated successfully!');
        this.dialogRef.close(true);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Update error:', err);
        this.toastr.error('Failed to update version');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.replacedIndices.clear();
    this.updatedLabels.clear();
    this.dialogRef.close(false);
  }
}