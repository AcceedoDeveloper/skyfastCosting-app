import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPreferencesComponent } from './company-preferences.component';

describe('CompanyPreferencesComponent', () => {
  let component: CompanyPreferencesComponent;
  let fixture: ComponentFixture<CompanyPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPreferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
