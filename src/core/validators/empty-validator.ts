import type { ValidatorFn } from "./validator.type.ts"; // adjust path if needed

export const requiredValidator: ValidatorFn = (input: string) => {
    return input.trim().length > 0;
};