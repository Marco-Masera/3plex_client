import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendjobPromoterTestComponent } from './sendjob-promoter-test.component';

describe('SendjobPromoterTestComponent', () => {
  let component: SendjobPromoterTestComponent;
  let fixture: ComponentFixture<SendjobPromoterTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendjobPromoterTestComponent]
    });
    fixture = TestBed.createComponent(SendjobPromoterTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
