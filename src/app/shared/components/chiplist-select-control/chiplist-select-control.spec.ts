import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiplistSelectControl } from './chiplist-select-control';

describe('ChiplistSelectControl', () => {
  let component: ChiplistSelectControl;
  let fixture: ComponentFixture<ChiplistSelectControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChiplistSelectControl],
    }).compileComponents();

    fixture = TestBed.createComponent(ChiplistSelectControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
