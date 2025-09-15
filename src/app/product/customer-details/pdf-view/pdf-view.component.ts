// pdf-view.component.ts
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2pdf from 'html2pdf.js';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pdf-view',
  imports: [
    CommonModule
  ],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss'
})
export class PdfViewComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public quotationData: any) {}

  ngAfterViewInit() {
    setTimeout(() => this.downloadPDF(), 300);
  }

  downloadPDF() {
    const element = this.pdfContent.nativeElement;
    const options = {
      margin: 10,
      filename: `Quotation_${this.quotationData?.customerName}_${this.quotationData?.partName}_Rev${this.quotationData?.revision}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
  }
}
