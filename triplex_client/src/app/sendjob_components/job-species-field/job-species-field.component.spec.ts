import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSpeciesFieldComponent } from './job-species-field.component';

describe('JobSpeciesFieldComponent', () => {
  let component: JobSpeciesFieldComponent;
  let fixture: ComponentFixture<JobSpeciesFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobSpeciesFieldComponent]
    });
    fixture = TestBed.createComponent(JobSpeciesFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
