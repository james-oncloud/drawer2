/**
 * Exhaustiveness helper for discriminated unions / switch statements.
 * If a new union member is added and not handled, TypeScript errors here.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
