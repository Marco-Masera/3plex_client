import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSearchableDropdownComponent } from './generic-searchable-dropdown.component';

describe('GenericSearchableDropdownComponent', () => {
  let component: GenericSearchableDropdownComponent;
  let fixture: ComponentFixture<GenericSearchableDropdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenericSearchableDropdownComponent]
    });
    fixture = TestBed.createComponent(GenericSearchableDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
