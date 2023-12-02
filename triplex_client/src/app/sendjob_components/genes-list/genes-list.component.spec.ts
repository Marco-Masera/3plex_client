import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenesListComponent } from './genes-list.component';

describe('GenesListComponent', () => {
  let component: GenesListComponent;
  let fixture: ComponentFixture<GenesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenesListComponent]
    });
    fixture = TestBed.createComponent(GenesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
