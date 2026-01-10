import { TestBed } from '@angular/core/testing';

import { SearchqueryEvent } from './searchquery.event';

describe('SearchqueryEvent', () => {
  let service: SearchqueryEvent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchqueryEvent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
