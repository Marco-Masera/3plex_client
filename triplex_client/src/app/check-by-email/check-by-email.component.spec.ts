import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckByEmailComponent } from './check-by-email.component';

describe('CheckByEmailComponent', () => {
  let component: CheckByEmailComponent;
  let fixture: ComponentFixture<CheckByEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckByEmailComponent]
    });
    fixture = TestBed.createComponent(CheckByEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
