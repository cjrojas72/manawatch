import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDetailPage } from './card-detail.page';

describe('CardDetailPage', () => {
  let component: CardDetailPage;
  let fixture: ComponentFixture<CardDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
