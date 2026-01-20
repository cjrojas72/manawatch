import { TestBed } from '@angular/core/testing';

import { ScryfallService } from './scryfall';

describe('Scryfall', () => {
  let service: ScryfallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScryfallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
