import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryWebTableComponent } from './summary-web-table.component';

describe('SummaryWebTableComponent', () => {
  let component: SummaryWebTableComponent;
  let fixture: ComponentFixture<SummaryWebTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryWebTableComponent]
    });
    fixture = TestBed.createComponent(SummaryWebTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
