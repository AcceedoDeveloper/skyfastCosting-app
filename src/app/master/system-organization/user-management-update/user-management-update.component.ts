import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type Key = 'Enter' | ' ' | 'Spacebar';

interface QuickLink {
  label: string;
  anchor: string;
}

interface VersionDetail {
  image?: string;
  caption: string;
  notes?: string[];
  highlights?: string[];
}

interface VersionComparison {
  id: string;
  title: string;
  old: VersionDetail;
  newer: VersionDetail;
}

@Component({
  selector: 'app-user-management-update',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-management-update.component.html',
  styleUrls: ['./user-management-update.component.scss'],
})
export class UserManagementUpdateComponent {
  quickLinks: QuickLink[] = [
    { label: 'Overview', anchor: 'overview' },
    { label: 'Access Control', anchor: 'access-control' },
    { label: 'User Profiles', anchor: 'user-profiles' },
    { label: 'Automation', anchor: 'automation' },
  ];

  versionComparisons: VersionComparison[] = [
    {
      id: 'overview',
      title: 'Customer Details',
      old: {
        image: 'assets/CustomerDetils-v1.png',
        caption: 'Previous user list layout',
        notes: ['Limited filtering options', 'Basic table visuals'],
      },
      newer: {
        image: 'assets/CustomerDetils-v2.png',
        caption: 'Modernized dashboard with quick filters',
        highlights: ['Contextual filters', 'Action shortcuts', 'Improved readability'],
      },
    },
    {
      id: 'access-control',
      title: 'Dashboard',
      old: {
        image: 'assets/Dashboard-v1.png',
        caption: 'Roles required manual updates',
        notes: ['No visual cues', 'Limited audit insights'],
      },
      newer: {
        image: 'assets/Dashboard-v2.png',
        caption: 'Role-centric controls with visual status',
        highlights: ['Role templates', 'Audit-ready logs'],
      },
    },
  ];

  lightboxImage: { url: string; title: string } | null = null;

  scrollTo(anchor: string) {
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleNavKey(event: KeyboardEvent, anchor: string) {
    const allowedKeys: Key[] = ['Enter', ' ', 'Spacebar'];
    if (allowedKeys.includes(event.key as Key)) {
      event.preventDefault();
      this.scrollTo(anchor);
    }
  }

  getBackgroundImage(image?: string) {
    return image ? `url('${image}')` : null;
  }

  openLightbox(image?: string, title?: string) {
    if (!image) return;
    this.lightboxImage = { url: image, title: title || 'Preview' };
  }

  handleImageKey(event: KeyboardEvent, image?: string, title?: string) {
    if (!image) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openLightbox(image, title);
    }
  }

  closeLightbox() {
    this.lightboxImage = null;
  }
}

