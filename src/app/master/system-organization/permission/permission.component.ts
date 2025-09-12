import { Component } from '@angular/core';
import {  OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Role } from '../../../model/role.model';
import { selectAllRoles } from '../store/system.selectors';
import * as RoleActions from '../store/system.actions';
import {  ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RoleManagementComponent } from '../role-management/role-management.component';


@Component({
  selector: 'app-permission',
   imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent implements OnInit{

  showForm = false;
  roles$!: Observable<Role[]>;   

  constructor(private store: Store) {}

   ngOnInit() {
    this.roles$ = this.store.select(selectAllRoles);
    this.store.dispatch(RoleActions.loadRoles());
  }


    toggleForm() {
    this.showForm = !this.showForm;
  }


  onParentCheckboxChange(group: string, event: Event) {
    const parentChecked = (event.target as HTMLInputElement).checked;
    const subCheckboxes = document.querySelectorAll<HTMLInputElement>(`.submenu-checkbox[data-group='${group}']`);
    subCheckboxes.forEach(cb => cb.checked = parentChecked);
  }

  
  onSubCheckboxChange(group: string) {
    const subCheckboxes = document.querySelectorAll<HTMLInputElement>(`.submenu-checkbox[data-group='${group}']`);
    const parentCheckbox = document.querySelector<HTMLInputElement>(`.nav-checkbox[data-group='${group}']`);

    if (parentCheckbox) {
      const allChecked = Array.from(subCheckboxes).every(cb => cb.checked);
      parentCheckbox.checked = allChecked;
    }
  }

}
