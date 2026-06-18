import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
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
import { JsonPipe } from '@angular/common';
import { positiveIntegerValidator } from './shared/validators/positive-integer-validator';
import { atLeastOneEmailValidator } from './shared/validators/at-least-one-email-validator';
import { EmailListControl } from './shared/components/email-list-control/email-list-control';

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
    JsonPipe,
    EmailListControl,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('[Wipro] Angular Hero - Dynamic Questionnaire Form');

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

  errorStateMatcher = new CustomErrorStateMatcher();
  readonly formDir = viewChild.required(FormGroupDirective);

  onSubmit() {
    console.log('this.form.value: ', this.form.value);
  }

  onReset() {
    // this.form.reset()
    this.formDir().resetForm();
  }
}

interface QuestionnaireForm {
  name: FormControl<string>;
  age: FormControl<number | null>;
  phone: FormControl<string | null>;
  habits: FormControl<string[] | null>;
  emails: FormControl<string[] | null>;
}
