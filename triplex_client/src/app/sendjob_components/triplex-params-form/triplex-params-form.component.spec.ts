import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriplexParamsFormComponent } from './triplex-params-form.component';

describe('TriplexParamsFormComponent', () => {
  let component: TriplexParamsFormComponent;
  let fixture: ComponentFixture<TriplexParamsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TriplexParamsFormComponent]
    });
    fixture = TestBed.createComponent(TriplexParamsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
