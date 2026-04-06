import type { ValidatorFn } from "./validator.type.ts";

export const emailValidator: ValidatorFn = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};