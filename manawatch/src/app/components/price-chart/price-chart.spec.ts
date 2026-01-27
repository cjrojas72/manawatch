import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceChartComponent } from './price-chart';

describe('PriceChart', () => {
  let component: PriceChartComponent;
  let fixture: ComponentFixture<PriceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
