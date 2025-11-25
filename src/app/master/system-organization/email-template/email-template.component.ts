import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface EmailTemplate {
  id?: string;
  templateName: string;
  subject: string;
  body: string;
  templateType: string;
}

@Component({
  selector: 'app-email-template',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './email-template.component.html',
  styleUrl: './email-template.component.scss'
})
export class EmailTemplateComponent implements OnInit {
  emailTemplates: EmailTemplate[] = [];
  emailTemplateForm!: FormGroup;
  isEditing: boolean = false;
  editingTemplateId: string | null = null;
  templateTypes: string[] = ['Welcome Email', 'Password Reset', 'Invoice', 'Notification', 'Custom'];
  bodyPlaceholder: string = 'Enter email body. You can use variables like {{userName}}, {{invoiceNumber}}, etc.';
  bodyHint: string = 'Tip: Use variables like {{userName}}, {{invoiceNumber}}, etc. in your template';

  constructor(private fb: FormBuilder) {
    this.initializeForm();
    this.loadSampleTemplates();
  }

  ngOnInit(): void {
    // Component initialization
  }

  initializeForm(): void {
    this.emailTemplateForm = this.fb.group({
      templateName: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      body: ['', [Validators.required]],
      templateType: ['', [Validators.required]]
    });
  }

  loadSampleTemplates(): void {
    // Sample templates for demonstration
    this.emailTemplates = [
      {
        id: '1',
        templateName: 'Welcome Email',
        subject: 'Welcome to Sky-fast Costing',
        body: 'Dear {{userName}},\n\nWelcome to Sky-fast Costing! We are excited to have you on board.\n\nBest regards,\nSky-fast Team',
        templateType: 'Welcome Email'
      },
      {
        id: '2',
        templateName: 'Password Reset',
        subject: 'Password Reset Request',
        body: 'Dear {{userName}},\n\nYou have requested to reset your password. Please click on the following link to reset your password:\n\n{{resetLink}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nSky-fast Team',
        templateType: 'Password Reset'
      },
      {
        id: '3',
        templateName: 'Invoice Notification',
        subject: 'Invoice #{{invoiceNumber}}',
        body: 'Dear {{customerName}},\n\nYour invoice #{{invoiceNumber}} for the amount of {{amount}} is ready.\n\nPlease find the invoice attached.\n\nThank you for your business!\n\nBest regards,\nSky-fast Team',
        templateType: 'Invoice'
      }
    ];
  }

  editTemplate(template: EmailTemplate): void {
    this.isEditing = true;
    this.editingTemplateId = template.id || null;
    this.emailTemplateForm.patchValue({
      templateName: template.templateName,
      subject: template.subject,
      body: template.body,
      templateType: template.templateType
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingTemplateId = null;
    this.emailTemplateForm.reset();
  }

  saveTemplate(): void {
    if (this.emailTemplateForm.valid) {
      const formValue = this.emailTemplateForm.value;
      
      if (this.editingTemplateId) {
        // Update existing template
        const index = this.emailTemplates.findIndex(t => t.id === this.editingTemplateId);
        if (index !== -1) {
          this.emailTemplates[index] = {
            ...this.emailTemplates[index],
            ...formValue
          };
        }
      } else {
        // Add new template
        const newTemplate: EmailTemplate = {
          id: Date.now().toString(),
          ...formValue
        };
        this.emailTemplates.push(newTemplate);
      }

      this.cancelEdit();
    }
  }

  deleteTemplate(templateId: string): void {
    this.emailTemplates = this.emailTemplates.filter(t => t.id !== templateId);
    if (this.editingTemplateId === templateId) {
      this.cancelEdit();
    }
  }

  addNewTemplate(): void {
    this.isEditing = true;
    this.editingTemplateId = null;
    this.emailTemplateForm.reset();
  }

  previewTemplate(template: EmailTemplate): void {
    // Simple preview - in a real app, this would open a modal or preview pane
    console.log('Preview Template:', template);
    alert(`Subject: ${template.subject}\n\nBody:\n${template.body}`);
  }
}

