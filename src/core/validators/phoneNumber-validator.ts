import type { ValidatorFn } from "./validator.type.js";

export const phoneValidator: ValidatorFn = (value: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(value);
};