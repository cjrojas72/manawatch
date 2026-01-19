import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPage } from './market.page';

describe('MarketPage', () => {
  let component: MarketPage;
  let fixture: ComponentFixture<MarketPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
