export default class CELLiteral {
  public value: string | number | boolean | null = null;
  public readonly isSimple: boolean = true;

  constructor(value: string | number | boolean | null) {
    this.value = value;
  }

  public compile(): string {
    if (typeof this.value === 'string') return `'${this.value}'`;
    if (this.value === null) return 'null';
    return String(this.value);
  }
}
