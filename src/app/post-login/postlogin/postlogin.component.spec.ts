import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostloginComponent } from './postlogin.component';

describe('PostloginComponent', () => {
  let component: PostloginComponent;
  let fixture: ComponentFixture<PostloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostloginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
