import { TestBed } from '@angular/core/testing';

import { TriplexServiceService } from './triplex-service.service';

describe('TriplexServiceService', () => {
  let service: TriplexServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriplexServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
