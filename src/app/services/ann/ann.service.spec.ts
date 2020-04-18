import { TestBed } from '@angular/core/testing';

import { AnnService } from './ann.service';

describe('AnnService', () => {
  let service: AnnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
