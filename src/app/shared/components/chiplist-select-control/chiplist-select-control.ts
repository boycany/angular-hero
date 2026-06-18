import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MatAutocompleteModule,
  type MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { type MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomErrorStateMatcher } from '../../utilities/custom-error-state-matcher';

@Component({
  selector: 'app-chiplist-select-control',
  // MatAutocompleteModule 必須在 MatChipsModule 之前，避免鍵盤選取時誤加 chip
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './chiplist-select-control.html',
  styleUrl: './chiplist-select-control.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChiplistSelectControl),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ChiplistSelectControl),
      multi: true,
    },
  ],
})
export class ChiplistSelectControl implements ControlValueAccessor, Validator {
  // inputs（皆由外部提供，元件本身不寫死）
  label = input('');
  placeholder = input('');
  options = input<string[]>([]);
  required = input(false);
  allowFreeForm = input(true);

  separatorKeysCodes = [ENTER, COMMA];

  // 已選清單作為元件值來源
  selected = signal<string[]>([]);

  // 用一個真正的 FormControl 驅動 errorState，與 PhoneNumberControl 一致
  chipControl = new FormControl<string[] | null>(null, {
    nonNullable: false,
  });

  // 輸入框文字（autocomplete 過濾用）
  inputControl = new FormControl<string>('', { nonNullable: true });
  inputValue = signal('');

  errorStateMatcher = new CustomErrorStateMatcher();

  // 過濾掉已選 + 比對輸入字串的可選清單
  filteredOptions = computed(() => {
    const filterValue = this.inputValue().toLowerCase().trim();
    const chosen = this.selected();
    return this.options().filter(
      (opt) => !chosen.includes(opt) && opt.toLowerCase().includes(filterValue),
    );
  });

  onChange = (val: string[] | null) => {};
  onTouched = () => {};

  registerOnChange(fn: (val: string[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private justSelected = false;

  constructor() {
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((val) => this.inputValue.set(val ?? ''));

    effect(() => {
      if (this.required() === true) {
        this.chipControl.addValidators(Validators.required);
      } else {
        this.chipControl.removeValidators(Validators.required);
      }
      this.chipControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  add(event: MatChipInputEvent): void {
    if (this.chipControl.disabled) return;

    // 剛透過 autocomplete 選取 → 略過這次 token end，避免重複加入殘留文字
    if (this.justSelected) {
      this.justSelected = false;
      event.chipInput?.clear();
      this.inputControl.setValue('');
      return;
    }

    const value = (event.value ?? '').trim();

    // 不允許 free-form 時，只接受清單內的選項
    if (value && (this.allowFreeForm() || this.options().includes(value))) {
      this.pushValue(value);
    }
    event.chipInput?.clear();
    this.inputControl.setValue('');
  }

  selectedOption(event: MatAutocompleteSelectedEvent): void {
    if (this.chipControl.disabled) return;
    this.justSelected = true; // 標記:這次是 autocomplete 選取
    this.pushValue(event.option.viewValue);
    this.inputControl.setValue('');
    event.option.deselect();
  }

  remove(item: string): void {
    if (this.chipControl.disabled) return;
    this.selected.update((items) => items.filter((i) => i !== item));
    this.syncControl();
  }

  private pushValue(value: string): void {
    if (this.selected().includes(value)) return;
    this.selected.update((items) => [...items, value]);
    this.syncControl();
  }

  // 把 selected 同步進 chipControl，並對外送值
  private syncControl(): void {
    const val = this.selected();
    const out = val.length ? val : null;
    this.chipControl.setValue(out);
    this.chipControl.markAsTouched();
    this.onChange(out);
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.chipControl.disable();
      this.inputControl.disable();
    } else {
      this.chipControl.enable();
      this.inputControl.enable();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.chipControl.errors;
  }

  writeValue(value: string[] | null): void {
    const arr = Array.isArray(value) ? [...value] : [];
    this.selected.set(arr);
    this.chipControl.setValue(arr.length ? arr : null, { emitEvent: false });

    // 與外層 reset 對齊：清掉殘留輸入並把內部 control 標回 untouched/pristine
    this.inputControl.setValue('', { emitEvent: false });
    this.chipControl.markAsUntouched();
    this.chipControl.markAsPristine();
  }
}
