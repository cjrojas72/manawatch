import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingList } from './trending-list';

describe('TrendingList', () => {
  let component: TrendingList;
  let fixture: ComponentFixture<TrendingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
