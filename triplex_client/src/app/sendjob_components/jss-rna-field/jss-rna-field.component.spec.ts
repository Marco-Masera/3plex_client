import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JssRNAFieldComponent } from './jss-rna-field.component';

describe('JssRNAFieldComponent', () => {
  let component: JssRNAFieldComponent;
  let fixture: ComponentFixture<JssRNAFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JssRNAFieldComponent]
    });
    fixture = TestBed.createComponent(JssRNAFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
