import { TestBed } from '@angular/core/testing';

import { MtgjsonService } from './mtgjson.service';

describe('MtgjsonService', () => {
  let service: MtgjsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MtgjsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
