import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsComponent, getApplyRateChangesLabel } from './customer-details.component';

describe('CustomerDetailsComponent', () => {
  let component: CustomerDetailsComponent;
  let fixture: ComponentFixture<CustomerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return pending label when apply rate changes is not enabled', () => {
    expect(getApplyRateChangesLabel(false)).toBe('Pending');
  });

  it('should return applied label when apply rate changes is enabled', () => {
    expect(getApplyRateChangesLabel(true)).toBe('Applied');
  });
});
