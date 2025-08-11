import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {
  roles = [
    { id: 1, name: 'Admin', description: 'Has full access to all features.' },
    { id: 2, name: 'Manager', description: 'Can manage projects and teams.' },
    { id: 3, name: 'User', description: 'Has limited access to assigned tasks.' }
  ];

  addRole() {
    const newId = this.roles.length + 1;
    this.roles.push({
      id: newId,
      name: `Role ${newId}`,
      description: `Description for Role ${newId}`
    });
  }
}
