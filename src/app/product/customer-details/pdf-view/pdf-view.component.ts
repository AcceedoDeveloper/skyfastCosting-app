// pdf-view.component.ts
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ConfigService } from '../../../shared/config.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-pdf-view',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss'
})
export class PdfViewComponent implements OnInit {
  quotationData: any;
  domesticpdf = false;
  pdfwithouticon = false;
  domesticpdfwithouticon = false;
  isDialogMode = false;
  customerName: string = '';
  partName: string = '';
  revision: number = 0;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { customerName: string; partName: string; revision: number } | null,
    @Optional() private dialogRef: MatDialogRef<PdfViewComponent>,
    private productService: ProductService,
    private config: ConfigService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Check if component is used as dialog or route
    this.isDialogMode = !!this.data && !!this.dialogRef;
  }

  ngOnInit(): void {
    if (this.isDialogMode) {
      // Dialog mode - use injected data
      this.customerName = this.data!.customerName;
      this.partName = this.data!.partName;
      this.revision = this.data!.revision;
      this.fetchQuotationData();
    } else {
      // Route mode - get data from query params
      this.route.queryParamMap.pipe(
        switchMap(params => {
          // Handle both lowercase and capitalized parameter names for compatibility
          this.customerName = params.get('CustomerName') || params.get('customerName') || '';
          this.partName = params.get('partName') || '';
          this.revision = parseInt(params.get('Revision') || params.get('revision') || '0', 10);
          
          if (!this.customerName || !this.partName || !this.revision) {
            console.error('Missing required query parameters', {
              customerName: this.customerName,
              partName: this.partName,
              revision: this.revision
            });
            return [];
          }
          
          return this.productService.quotationData(this.customerName, this.partName, this.revision);
        })
      ).subscribe({
        next: (res) => {
          if (res) {
            this.setQuotationData(res);
          }
        },
        error: (err) => {
          console.error('Error fetching quotation:', err);
        }
      });
    }
    this.downloadPDF();

  }

  private fetchQuotationData(): void {
    this.productService.quotationData(this.customerName, this.partName, this.revision)
      .subscribe({
        next: (res) => {
          this.setQuotationData(res);
        },
        error: (err) => {
          console.error('Error fetching quotation:', err);
        }
      });
  }

  private setQuotationData(res: any): void {
    this.quotationData = res;
    console.log('Quotation Data:', this.quotationData);
    
    // Determine which PDF view to show based on currency
    const hasCurrency = res.results[0]?.revisions[0]?.currency != null;
    if (hasCurrency) {
      this.pdfwithouticon = true;
      this.domesticpdf = false;
      this.domesticpdfwithouticon = false;
    } else {
      this.domesticpdfwithouticon = true;
      this.domesticpdf = false;
      this.pdfwithouticon = false;
    }
  }

  closeda() {
    if (this.isDialogMode && this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Route mode - navigate back or close window
      this.router.navigate(['/product/quotation']);
    }
  }

  downloadPDF() {
    const params = {
      customerName: this.customerName,
      partName: this.partName,
      revision: this.revision
    };
  
    this.productService.downloadQuotationPDF(params).subscribe({
      next: ({ fileName }) => {
        const reportUrl = this.config.getCostingUrl('') + `get-report/${fileName}`;
        window.open(reportUrl, '_blank');
      },
      error: (err) => console.error('Error generating PDF:', err)
    });
  }

  getDrawingImage(): string {
    if (!this.quotationData?.results?.[0]?.drawingImage) {
      return '';
    }

    const api = this.config.getCostingUrl('');
    const imagePath = this.quotationData.results[0].drawingImage;
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Normalize path - add /uploads/ if it's just a filename
    let normalizedPath = imagePath;
    if (!imagePath.startsWith('/')) {
      normalizedPath = `/uploads/${imagePath}`;
    } else if (!imagePath.startsWith('/uploads/')) {
      normalizedPath = `/uploads${imagePath}`;
    }
    
    return api + encodeURI(normalizedPath);
  }

  getProcessCostByCurrency(process: any, currency: string = '') {
    if (!currency) return process.cost;
    const key = `ProcessCost${currency}`;
    return process[key] ?? process.cost;
  }
  
  getSumOfProcessCostByCurrency(revision: any, currency: string = '') {
    if (!currency) return revision.sumOfProcessCost;
    const key = `sumOfProcessCost${currency}`;
    return revision[key] ?? revision.sumOfProcessCost;
  }
  
  getRejectionCostByCurrency(revision: any, currency: string = '') {
    if (!currency) return revision.RejectionCost;
    const key = `RejectionCost${currency}`;
    return revision[key] ?? revision.RejectionCost;
  }
  
  getTotalProcessCostByCurrency(revision: any, currency: string = '') {
    if (!currency) return revision.TotalProcessCost;
    const key = `TotalProcessCost${currency}`;
    return revision[key] ?? revision.TotalProcessCost;
  }
  
  getTotalPriceByCurrency(revision: any, currency: string = '') {
    if (!currency) return revision.TotalPrice;
    const key = `TotalPrice${currency}`;
    return revision[key] ?? revision.TotalPrice;
  }
}
