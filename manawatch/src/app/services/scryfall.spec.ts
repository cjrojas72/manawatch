import { TestBed } from '@angular/core/testing';

import { Scryfall } from './scryfall';

describe('Scryfall', () => {
  let service: Scryfall;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Scryfall);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
