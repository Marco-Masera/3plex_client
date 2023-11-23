import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullTpxTableComponent } from './full-tpx-table.component';

describe('FullTpxTableComponent', () => {
  let component: FullTpxTableComponent;
  let fixture: ComponentFixture<FullTpxTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullTpxTableComponent]
    });
    fixture = TestBed.createComponent(FullTpxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
