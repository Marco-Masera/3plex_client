import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataVisualizationAltComponent } from './data-visualization-alt.component';

describe('DataVisualizationAltComponent', () => {
  let component: DataVisualizationAltComponent;
  let fixture: ComponentFixture<DataVisualizationAltComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataVisualizationAltComponent]
    });
    fixture = TestBed.createComponent(DataVisualizationAltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
