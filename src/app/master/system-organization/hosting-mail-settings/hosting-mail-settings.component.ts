import { Component, OnInit, inject } from '@angular/core';
import { HostingMail} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectHosting } from '../store/system.selectors';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UpdateHostingComponent} from './update-hosting/update-hosting.component';


@Component({
  selector: 'app-hosting-mail-settings',
  imports: [
     FormsModule,
    MatIconModule,
    CommonModule,
    MatDialogModule,
     MatFormFieldModule,
  ],
  templateUrl: './hosting-mail-settings.component.html',
  styleUrl: './hosting-mail-settings.component.scss'
})
export class HostingMailSettingsComponent  implements OnInit {

  hosting$!: Observable<HostingMail[]>;


   private dialog = inject(MatDialog); 

    constructor(private store : Store){}


   ngOnInit(): void {
  this.hosting$ = this.store.select(selectHosting).pipe(
    // ensure it's always an array
    map(data => Array.isArray(data) ? data : [data])
  );

  this.hosting$.subscribe(data => {
    console.log("data after map", data);
  });

  this.store.dispatch(RoleActions.loadHostingMail());
}


    openAddHostingMail(element?: HostingMail) {
       this.dialog.open(UpdateHostingComponent, {
            width: '500px',
            data: element || {} 
          });
}

deleteHostingMail(id: string) {
  this.store.dispatch(RoleActions.deleteHostingMail({ id }));
}

}
