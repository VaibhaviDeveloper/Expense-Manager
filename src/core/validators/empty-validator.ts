import type { ValidatorFn } from "./validator.type.ts"; // adjust path if needed

export const requiredValidator = (fieldName: string) => {
  return (input: string) => {
    if (!input.trim()) {
      console.log(`❌ ${fieldName} cannot be empty.`);
      return false;
    }
    return true;
  };
};