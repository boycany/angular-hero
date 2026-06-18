import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ResultDialogData {
  message: string;
}

@Component({
  selector: 'app-result-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './result-dialog.html',
  styleUrl: './result-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDialog {
  readonly data = inject<ResultDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ResultDialog>);
}
