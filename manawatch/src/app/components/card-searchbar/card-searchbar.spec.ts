import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSearchbar } from './card-searchbar';

describe('CardSearchbar', () => {
  let component: CardSearchbar;
  let fixture: ComponentFixture<CardSearchbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSearchbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSearchbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
