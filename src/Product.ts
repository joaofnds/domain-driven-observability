import { randomUUID } from "node:crypto";

export class Product {
  readonly id = randomUUID();

  constructor(readonly name: string, readonly value: number) {}
}
