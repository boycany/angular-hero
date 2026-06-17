import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PhoneNumberControl } from './shared/components/phone-number-control/phone-number-control';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, PhoneNumberControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('[Wipro] Angular Hero - dynamic questionnaire form');

  readonly form = new FormGroup<QuestionnaireForm>({
    phone: new FormControl(null), // validated inside PhoneNumberControl component
  })

  get phoneControl() {
    return this.form.get('phone') as FormControl<string | null>;
  }
}

interface QuestionnaireForm {
  phone:  FormControl<string | null>;
}