import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderline',
})
export class RemoveUnderlinePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value?.toString().replace(/_/g, ' ') ?? '';
  }
}