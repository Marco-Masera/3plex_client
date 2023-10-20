import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbdDetailsComponent } from './dbd-details.component';

describe('DbdDetailsComponent', () => {
  let component: DbdDetailsComponent;
  let fixture: ComponentFixture<DbdDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DbdDetailsComponent]
    });
    fixture = TestBed.createComponent(DbdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
