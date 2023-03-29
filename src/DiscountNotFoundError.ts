export class DiscountNotFoundError extends Error {
  constructor(code: string) {
    super(`could not found discount for code '${code}`);
  }
}
