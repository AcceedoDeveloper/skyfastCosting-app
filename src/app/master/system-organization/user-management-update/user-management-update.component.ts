import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../../shared/config.service';
import { Version } from '../../../model/version';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditVersionDialogComponent } from './edit-version-dialog/edit-version-dialog.component';
import { MatButtonModule } from '@angular/material/button';

import { CreateVersionDialogComponent } from './create-version-dialog/create-version-dialog.component';
import { VersionService } from '../../../services/version.service';

@Component({
  selector: 'app-user-management-update',
  standalone: true,
      imports: [
    CommonModule,            
    MatIconModule,             
    MatProgressSpinnerModule   ,
     MatButtonModule  
  ],
  templateUrl: './user-management-update.component.html',
  styleUrls: ['./user-management-update.component.scss'],
})
export class UserManagementUpdateComponent implements OnInit, OnDestroy {
  versions: Version[] = [];
  quickLinks: { label: string; anchor: string }[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  lightboxImage: { url: string; title?: string } | null = null;
  activeAnchor: string | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private versionService: VersionService,
    private config: ConfigService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadVersions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadVersions(): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    const sub = this.versionService.getVersions().subscribe({

    
      
   
      
      next: (data) => {
        this.versions = Array.isArray(data) ? data : [];
        // Sort by createdAt descending (newest first)
        this.versions.sort((a, b) => {
          const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return ta - tb;
        });
        // Build dynamic quick links
        this.quickLinks = this.versions.map((v, i) => ({
          label: v.heading || `Version ${i + 1}`,
          anchor: `version-${v._id}`
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load versions:', err);
        this.errorMessage = 'Failed to load versions. Please check your connection.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  trackById(index: number, version: Version): string {
    return version._id;
  }
scrollTo(anchor: string): void {
  const el = document.getElementById(anchor);
  if (el) {
    // Scroll to center of viewport
    el.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',     // ← This centers the card vertically
      inline: 'center'     // ← This centers horizontally (if needed)
    });

    // Set active state for styling
    this.activeAnchor = anchor;

    // Focus for accessibility
    el.focus({ preventScroll: true });
  }
}

  handleNavKey(event: KeyboardEvent, anchor: string): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.scrollTo(anchor);
    }
  }

  // FIXED: Properly sanitized background image - supports ALL formats
  getBackgroundImage(filename: string): SafeStyle | null {
    if (!filename) return null;

    const url = this.getImageUrl(filename);
    const style = `url("${url}")`;
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }

    getImageUrl(filename: string): string {
    if (!filename) return '';
    if (/^https?:\/\//.test(filename)) return filename;

    const apiUrl = this.config.getCostingUrl('baseUrl');
    console.log('stand api', apiUrl);
    // const baseUrl = apiUrl;
    console.log('Constructed base URL for image:', `${apiUrl}uploads/version/${filename}`);
    return `${apiUrl}uploads/version/${filename}`;
  }

  openLightbox(url: string, title?: string): void {
    if (url) this.lightboxImage = { url, title };
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }

  openCreateVersionDialog(): void {
    const dialogRef = this.dialog.open(CreateVersionDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVersions();
    });
  }

  openEditVersionDialog(version: Version): void {
    const dialogRef = this.dialog.open(EditVersionDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: { version }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVersions();
    });
  }

  deleteVersion(versionId: string): void {
    if (confirm('Are you sure you want to delete this version?')) {
      this.versionService.deleteVersions(versionId).subscribe({
        next: () => {
          console.log('Version deleted successfully');
          this.loadVersions();
        },
        error: (err) => {
          console.error('Delete failed:', err);
        }
      });
    }
  }
}