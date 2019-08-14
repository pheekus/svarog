import { CELAccessor, CELExpressionOperand } from '.';

export default class CELList {
  public readonly isSimple = true;
  public items: CELExpressionOperand[] = [];

  constructor(...items: CELExpressionOperand[]) {
    this.items = items;
  }

  get accessor(): CELAccessor {
    return new CELAccessor(this.compile());
  }

  public compile(): string {
    return `[${this.items.map(v => v.compile()).join(',')}]`;
  }
}
