import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerButton } from './spinner-button';

describe('SpinnerButton', () => {
  let component: SpinnerButton;
  let fixture: ComponentFixture<SpinnerButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerButton],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
