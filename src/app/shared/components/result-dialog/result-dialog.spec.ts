import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { ResultDialog, ResultDialogData } from './result-dialog';

describe('ResultDialog', () => {
  let component: ResultDialog;
  let fixture: ComponentFixture<ResultDialog>;

  // 假的 MatDialogRef
  const dialogRefMock = {
    close: vi.fn(),
  };

  function setup(data: ResultDialogData) {
    TestBed.configureTestingModule({
      imports: [ResultDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    });

    fixture = TestBed.createComponent(ResultDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------
  it('should create', () => {
    setup({ message: 'Hello' });
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Injected data
  // -------------------------------------------------------------------------
  it('should expose the injected dialog data', () => {
    setup({ message: 'Thanks for your application.' });
    expect(component.data.message).toBe('Thanks for your application.');
  });

  // -------------------------------------------------------------------------
  // Message rendering
  // -------------------------------------------------------------------------
  it('should render the message in the dialog content', () => {
    setup({ message: 'Thanks for your application.' });
    const content = fixture.debugElement.query(By.css('mat-dialog-content'))
      ?.nativeElement as HTMLElement;
    expect(content.textContent).toContain('Thanks for your application.');
  });

  it('should render an underage message verbatim', () => {
    const msg = "Currently, you're 15 years old. Please submit the questionnaire once you are 18.";
    setup({ message: msg });
    const content = fixture.debugElement.query(By.css('mat-dialog-content'))
      ?.nativeElement as HTMLElement;
    expect(content.textContent).toContain(msg);
  });

  // -------------------------------------------------------------------------
  // Structure (Material dialog directives)
  // -------------------------------------------------------------------------
  it('should render a dialog title', () => {
    setup({ message: 'Hello' });
    const title = fixture.debugElement.query(By.css('[mat-dialog-title]'));
    expect(title).toBeTruthy();
  });

  it('should render an OK action button', () => {
    setup({ message: 'Hello' });
    const button = fixture.debugElement.query(By.css('mat-dialog-actions button'))
      ?.nativeElement as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('OK');
  });

  // -------------------------------------------------------------------------
  // OK closes the dialog with `true`
  // -------------------------------------------------------------------------
  it('should close with true when OK is clicked', () => {
    setup({ message: 'Hello' });
    const button = fixture.debugElement.query(By.css('mat-dialog-actions button'))
      ?.nativeElement as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
