import { ValidatorFn } from "@angular/forms";
import { utilityRegexValidator } from "./utility-regex-validator";

export function positiveIntegerValidator(): ValidatorFn {
    const regex = new RegExp('^[0-9]*$');
    return utilityRegexValidator(regex, { notPositiveInteger: true });
}
  