import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  DestroyRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { CustomErrorStateMatcher } from '../../utilities/custom-error-state-matcher';
import { noDuplicateEmailsValidator } from '../../validators/no-duplicate-emails-validator';
import { atLeastOneEmailValidator } from '../../validators/at-least-one-email-validator';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-email-list-control',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './email-list-control.html',
  styleUrl: './email-list-control.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailListControl),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailListControl),
      multi: true,
    },
  ],
})
export class EmailListControl implements ControlValueAccessor, Validator {
  private destroyRef = inject(DestroyRef);

  // inputs
  label = input('Email');
  placeholder = input('name@example.com');
  addButtonLabel = input('Add email');

  errorStateMatcher = new CustomErrorStateMatcher();

  // 內部 FormArray：每個項目是獨立的 email FormControl
  // array 層掛重複驗證
  readonly emails = new FormArray<FormControl<string>>([], {
    validators: [noDuplicateEmailsValidator(), atLeastOneEmailValidator()],
  });

  // Validator 介面要通知外層重新驗證時呼叫
  private onValidatorChange = () => {};

  onChange = (val: string[]) => {};
  onTouched = () => {};

  firstRowErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => {
      const ctrlInvalid = !!(control && control.invalid && (control.dirty || control.touched));
      const arrayRequired = this.emails.hasError('required') && this.emails.touched;
      return ctrlInvalid || arrayRequired;
    },
  };

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // 任一項目變動 → 對外送值並通知重新驗證
    this.emails.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.onChange(this.emails.getRawValue());
      this.onValidatorChange();
    });

    // 初始至少給一列空輸入框
    if (this.emails.length === 0) {
      this.addEmail();
    }
  }

  private createEmailControl(value = ''): FormControl<string> {
    return new FormControl<string>(value, {
      nonNullable: true,
      validators: [Validators.email],
    });
  }

  addEmail(value = ''): void {
    this.emails.push(this.createEmailControl(value));
    this.cdr.markForCheck();
  }

  removeEmail(index: number): void {
    this.emails.removeAt(index);
    // 永遠保留至少一列，避免使用者刪到完全沒有輸入框
    if (this.emails.length === 0) {
      this.addEmail();
    }
    this.emails.markAsTouched();
    this.cdr.markForCheck();
  }

  // 給 template 取得每個 control（型別友善）
  controlAt(index: number): FormControl<string> {
    return this.emails.at(index);
  }

  // ---- ControlValueAccessor ----
  writeValue(value: string[] | null): void {
    this.emails.clear({ emitEvent: false });

    if (Array.isArray(value) && value.length > 0) {
      value.forEach((v) => this.emails.push(this.createEmailControl(v), { emitEvent: false }));
    } else {
      // 沒值或 reset：保留一列空白
      this.emails.push(this.createEmailControl(), { emitEvent: false });
    }

    // 與外層 reset 對齊
    this.emails.markAsUntouched();
    this.emails.markAsPristine();
    this.emails.updateValueAndValidity({ emitEvent: false });
    this.onValidatorChange();
    this.cdr.markForCheck(); // ← 通知 OnPush 重新渲染 @for
  }

  registerOnChange(fn: (val: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.emails.disable() : this.emails.enable();
  }

  // ---- Validator ----
  validate(control: AbstractControl): ValidationErrors | null {
    // 任一子項 email 格式錯
    if (this.emails.controls.some((c) => c.invalid)) {
      return { emailInvalid: true };
    }
    // array 層的重複錯誤往上吐
    if (this.emails.errors) {
      return this.emails.errors; // 含 duplicate 與 required
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
