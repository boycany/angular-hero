import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner-button',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './spinner-button.html',
  styleUrl: './spinner-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerButton {
  readonly type = input<'button' | 'submit'>('button');
  readonly appearance = input<MatButtonAppearance>('filled');
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly btnClass = input<string>('');
  readonly clickEvent = output<void>();
}
