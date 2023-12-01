import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobInfoFormComponent } from './job-info-form.component';

describe('JobInfoFormComponent', () => {
  let component: JobInfoFormComponent;
  let fixture: ComponentFixture<JobInfoFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobInfoFormComponent]
    });
    fixture = TestBed.createComponent(JobInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
