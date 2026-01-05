import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToptenList } from './topten-list';

describe('ToptenList', () => {
  let component: ToptenList;
  let fixture: ComponentFixture<ToptenList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToptenList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToptenList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
