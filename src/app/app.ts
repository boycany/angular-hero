import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PhoneNumberControl } from './shared/components/phone-number-control/phone-number-control';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomErrorStateMatcher } from './shared/utilities/custom-error-state-matcher';
import { SpinnerButton } from './shared/components/spinner-button/spinner-button';
import { MatButtonModule } from '@angular/material/button';
import { ChiplistSelectControl } from './shared/components/chiplist-select-control/chiplist-select-control';
import { positiveIntegerValidator } from './shared/validators/positive-integer-validator';
import { EmailListControl } from './shared/components/email-list-control/email-list-control';
import { MatDialog } from '@angular/material/dialog';
import { ResultDialog, ResultDialogData } from './shared/components/result-dialog/result-dialog';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    PhoneNumberControl,
    MatFormFieldModule,
    MatInputModule,
    SpinnerButton,
    MatButtonModule,
    ChiplistSelectControl,
    EmailListControl,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('[Wipro] Angular Hero - Dynamic Questionnaire Form');
  private dialog = inject(MatDialog);

  // 表單三態
  readonly formStatus = signal<FormStatus>('editing');
  readonly isSubmitting = computed(() => this.formStatus() === 'submitting');
  readonly isCompleted = computed(() => this.formStatus() === 'completed');

  readonly form = new FormGroup<QuestionnaireForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    age: new FormControl(null, {
      nonNullable: false,
      validators: [Validators.required, positiveIntegerValidator()],
    }),
    phone: new FormControl(null, {
      nonNullable: false,
      validators: [Validators.required],
    }), // validated inside PhoneNumberControl component
    habits: new FormControl<string[] | null>(null, {
      nonNullable: false,
      validators: [Validators.required],
    }),
    emails: new FormControl<string[] | null>(null, {
      nonNullable: false,
    }),
    status: new FormControl('', { nonNullable: true }), // readonly 顯示用
  });
  readonly habitOptions = ['hiking', 'swimming', 'traveling'];

  get nameControl() {
    return this.form.get('name') as FormControl<string>;
  }

  get ageControl() {
    return this.form.get('age') as FormControl<number | null>;
  }

  get phoneControl() {
    return this.form.get('phone') as FormControl<string | null>;
  }

  get habitsControl() {
    return this.form.get('habits') as FormControl<string[] | null>;
  }

  get emailsControl() {
    return this.form.get('emails') as FormControl<string[] | null>;
  }

  get statusControl() {
    return this.form.get('status') as FormControl<string>;
  }

  errorStateMatcher = new CustomErrorStateMatcher();
  readonly formDir = viewChild.required(FormGroupDirective);

  onSubmit() {
    if (this.form.invalid || this.formStatus() !== 'editing') return;

    this.formStatus.set('submitting');

    const age = this.ageControl.value ?? 0;
    const message = this.buildMessage(age);

    this.dialog
      .open<ResultDialog, ResultDialogData, boolean>(ResultDialog, {
        data: { message },
        disableClose: true,
        width: '400px',
      })
      .afterClosed()
      .subscribe(() => {
        // 使用者按 OK 後才解除 loading
        if (age < 18) {
          // 未成年：回到可編輯狀態，允許重新調整再次 submit
          this.formStatus.set('editing');
        } else {
          // 18+：設定 status、鎖定表單為完成狀態
          this.statusControl.setValue(this.buildStatus(age));
          this.form.disable({ emitEvent: false }); // 所有欄位 readonly/disabled
          this.formStatus.set('completed');
        }
      });
  }

  private buildMessage(age: number): string {
    if (age < 18) {
      return `Currently, you're ${age} years old. Please submit the questionnaire once you are 18.`;
    }
    return 'Thanks for your application.';
  }

  private buildStatus(age: number): string {
    return age >= 61 ? `APPROVAL(${age})` : 'APPROVAL';
  }

  onReset() {
    this.form.enable({ emitEvent: false }); // 解除 completed 的鎖定
    this.formDir().resetForm();
    this.statusControl.setValue('');
    this.formStatus.set('editing');
  }
}

interface QuestionnaireForm {
  name: FormControl<string>;
  age: FormControl<number | null>;
  phone: FormControl<string | null>;
  habits: FormControl<string[] | null>;
  emails: FormControl<string[] | null>;
  status: FormControl<string>;
}

type FormStatus = 'editing' | 'submitting' | 'completed';
