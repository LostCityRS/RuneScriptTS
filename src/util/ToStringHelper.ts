export class ToStringHelper {
  private readonly className: string;
  private readonly fields: Array<[string, unknown]> = [];

  constructor(instance: object) {
    this.className = instance.constructor.name;
  }

  add(name: string, value: unknown): this {
    this.fields.push([name, value]);
    return this;
  }

  toString(): string {
    const body = this.fields
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(", ");

    return `${this.className}{${body}}`;
  }
}
