import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckjobComponent } from './checkjob.component';

describe('CheckjobComponent', () => {
  let component: CheckjobComponent;
  let fixture: ComponentFixture<CheckjobComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckjobComponent]
    });
    fixture = TestBed.createComponent(CheckjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
