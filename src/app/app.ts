import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PhoneNumberControl } from './shared/components/phone-number-control/phone-number-control';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomErrorStateMatcher } from './shared/utilities/custom-error-state-matcher';
import { SpinnerButton } from './shared/components/spinner-button/spinner-button';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, PhoneNumberControl, MatFormFieldModule, MatInputModule, SpinnerButton, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('[Wipro] Angular Hero - Dynamic Questionnaire Form');

  readonly form = new FormGroup<QuestionnaireForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    age: new FormControl(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    phone: new FormControl(null,{
      nonNullable: false,
      validators: [Validators.required]
    }), // validated inside PhoneNumberControl component
  })

  get nameControl(){
    return this.form.get('name') as FormControl<string>;
  }

  get ageControl(){
    return this.form.get('age') as FormControl<number | null>;
  }

  get phoneControl() {
    return this.form.get('phone') as FormControl<string | null>;
  }

  errorStateMatcher = new CustomErrorStateMatcher()

  onSubmit(){
    console.log('this.form.value: ', this.form.value)
  }

  onReset(){
    this.form.reset()
  }
}

interface QuestionnaireForm {
  name: FormControl<string>;
  age: FormControl<number | null>;
  phone:  FormControl<string | null>;
}