import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { vi } from 'vitest';

import { SpinnerButton } from './spinner-button';

describe('SpinnerButton', () => {
  let component: SpinnerButton;
  let fixture: ComponentFixture<SpinnerButton>;

  function buttonEl(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button'))?.nativeElement as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerButton],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerButton);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ----- type -----
  it('should default type to "button"', () => {
    fixture.detectChanges();
    expect(buttonEl().getAttribute('type')).toBe('button');
  });

  it('should reflect submit type', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();
    expect(buttonEl().getAttribute('type')).toBe('submit');
  });

  // ----- disabled -----
  it('should not be disabled by default', () => {
    fixture.detectChanges();
    expect(buttonEl().disabled).toBe(false);
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(buttonEl().disabled).toBe(true);
  });

  it('should be disabled when isLoading is true (even if disabled input is false)', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    expect(buttonEl().disabled).toBe(true);
  });

  // ----- loading / spinner -----
  it('should not show spinner when not loading', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
  });

  it('should show spinner when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeTruthy();
  });

  // ----- click -----
  it('should emit clickEvent when clicked', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.clickEvent.subscribe(spy);
    buttonEl().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should NOT emit clickEvent when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.clickEvent.subscribe(spy);
    buttonEl().click(); // disabled button 不會觸發 click
    expect(spy).not.toHaveBeenCalled();
  });

  it('should NOT emit clickEvent when loading', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.clickEvent.subscribe(spy);
    buttonEl().click();
    expect(spy).not.toHaveBeenCalled();
  });

  // ----- btnClass -----
  it('should apply btnClass to the button', () => {
    fixture.componentRef.setInput('btnClass', 'w-100');
    fixture.detectChanges();
    expect(buttonEl().classList.contains('w-100')).toBe(true);
  });

  it('should update btnClass when input changes', () => {
    fixture.componentRef.setInput('btnClass', 'foo');
    fixture.detectChanges();
    expect(buttonEl().classList.contains('foo')).toBe(true);

    fixture.componentRef.setInput('btnClass', 'bar');
    fixture.detectChanges();
    expect(buttonEl().classList.contains('bar')).toBe(true);
    expect(buttonEl().classList.contains('foo')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 投影內容（content projection）測試：用 host wrapper 塞入 [text] / [loadingText]
// ---------------------------------------------------------------------------
@Component({
  imports: [SpinnerButton],
  template: `
    <app-spinner-button [isLoading]="loading()">
      <span text>Submit</span>
      <span loadingText>Submitting...</span>
    </app-spinner-button>
  `,
})
class HostComponent {
  loading = signal(false);
}

describe('SpinnerButton (content projection)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('should project [text] and hide spinner when not loading', () => {
    host.loading.set(false);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Submit');
    expect(text).not.toContain('Submitting...');
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
  });

  it('should project [loadingText] and show spinner when loading', () => {
    host.loading.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Submitting...');
    expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeTruthy();
  });

  it('should switch projected content when loading toggles', () => {
    host.loading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Submit');

    host.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Submitting...');
  });
});