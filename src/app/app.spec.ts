import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';

import { App } from './app';

import { Observable, of, Subject } from 'rxjs';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  // afterClosed() 回傳的 observable 可由各測試替換
  let afterClosedReturn: Observable<boolean> = of(true);

  const dialogRefMock = {
    afterClosed: vi.fn((): Observable<boolean> => afterClosedReturn),
  };

  const dialogMock = {
    open: vi.fn((_component: unknown, _config?: any) => dialogRefMock),
  };

  // 灌入一組通過驗證的表單值
  function fillValidForm(age: number) {
    component.form.setValue({
      name: 'Red',
      age,
      phone: '+886 912 345 678',
      habits: ['hiking'],
      emails: ['a@example.com'],
      status: '',
    });
    component.form.updateValueAndValidity();
  }

  beforeEach(async () => {
    afterClosedReturn = of(true);
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: MatDialog, useValue: dialogMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // Creation & initial state
  // -------------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in editing state', () => {
    expect(component.formStatus()).toBe('editing');
    expect(component.isSubmitting()).toBe(false);
    expect(component.isCompleted()).toBe(false);
  });

  it('should have an empty status control initially', () => {
    expect(component.statusControl.value).toBe('');
  });

  // -------------------------------------------------------------------------
  // onSubmit guards
  // -------------------------------------------------------------------------
  it('should not open dialog when form is invalid', () => {
    // 初始空表單 → invalid
    component.onSubmit();
    expect(dialogMock.open).not.toHaveBeenCalled();
    expect(component.formStatus()).toBe('editing');
  });

  it('should not re-submit when not in editing state', () => {
    fillValidForm(30);
    component.formStatus.set('submitting');
    component.onSubmit();
    expect(dialogMock.open).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Branch: underage (0-17)
  // -------------------------------------------------------------------------
  it('underage: should open dialog with the underage message', () => {
    fillValidForm(15);
    component.onSubmit();

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    const config = dialogMock.open.mock.calls[0][1];
    expect(config.data.message).toBe(
      "Currently, you're 15 years old. Please submit the questionnaire once you are 18.",
    );
    expect(config.disableClose).toBe(true);
  });

  it('underage: should return to editing after dialog closes (not locked)', () => {
    fillValidForm(15);
    component.onSubmit();
    // afterClosed 已 emit（of(true) 同步）
    expect(component.formStatus()).toBe('editing');
    expect(component.statusControl.value).toBe(''); // 不設 status
    expect(component.form.disabled).toBe(false); // 不鎖表單
  });

  // -------------------------------------------------------------------------
  // Branch: adult (18-60)
  // -------------------------------------------------------------------------
  it('adult: should open dialog with the thanks message', () => {
    fillValidForm(30);
    component.onSubmit();

    const config = dialogMock.open.mock.calls[0][1];
    expect(config.data.message).toBe('Thanks for your application.');
  });

  it('adult: should set status to APPROVAL and lock the form', () => {
    const disableSpy = vi.spyOn(component.form, 'disable');
    fillValidForm(30);
    component.onSubmit();

    expect(component.statusControl.value).toBe('APPROVAL');
    expect(component.formStatus()).toBe('completed');
    expect(component.isCompleted()).toBe(true);
    expect(disableSpy).toHaveBeenCalled(); // 驗「有呼叫 disable」而非整體 disabled 狀態
  });

  // -------------------------------------------------------------------------
  // Branch: senior (61+)
  // -------------------------------------------------------------------------
  it('senior: should set status to APPROVAL(age) and lock the form', () => {
    const disableSpy = vi.spyOn(component.form, 'disable');
    fillValidForm(65);
    component.onSubmit();

    expect(component.statusControl.value).toBe('APPROVAL(65)');
    expect(component.formStatus()).toBe('completed');
    expect(disableSpy).toHaveBeenCalled();
  });

  it('senior: boundary at 61 should use the APPROVAL(age) form', () => {
    fillValidForm(61);
    component.onSubmit();
    expect(component.statusControl.value).toBe('APPROVAL(61)');
  });

  it('adult: boundary at 60 should use plain APPROVAL', () => {
    fillValidForm(60);
    component.onSubmit();
    expect(component.statusControl.value).toBe('APPROVAL');
  });

  it('adult: boundary at 18 should use plain APPROVAL (not underage)', () => {
    fillValidForm(18);
    component.onSubmit();
    expect(component.statusControl.value).toBe('APPROVAL');
    expect(component.formStatus()).toBe('completed');
  });

  it('underage: boundary at 17 should stay editing', () => {
    fillValidForm(17);
    component.onSubmit();
    expect(component.formStatus()).toBe('editing');
  });

  // -------------------------------------------------------------------------
  // submitting state (dialog still open)
  // -------------------------------------------------------------------------
  it('should be in submitting state while the dialog is open (before close)', () => {
    const subject = new Subject<boolean>();
    afterClosedReturn = subject.asObservable();

    fillValidForm(30);
    component.onSubmit();

    expect(component.isSubmitting()).toBe(true);

    subject.next(true);
    subject.complete();
    expect(component.formStatus()).toBe('completed');
  });

  // -------------------------------------------------------------------------
  // onReset
  // -------------------------------------------------------------------------
  it('reset: should restore editing state and clear status after completion', () => {
    fillValidForm(30);
    component.onSubmit();
    expect(component.formStatus()).toBe('completed');

    const enableSpy = vi.spyOn(component.form, 'enable');
    component.onReset();

    expect(enableSpy).toHaveBeenCalled();
    expect(component.formStatus()).toBe('editing');
    expect(component.statusControl.value).toBe('');
  });

  it('reset: should call enable to unlock the form', () => {
    fillValidForm(40);
    component.onSubmit();

    const enableSpy = vi.spyOn(component.form, 'enable');
    component.onReset();
    expect(enableSpy).toHaveBeenCalled();
  });
});
