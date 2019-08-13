import { CELExpressionOperand, CELOperators } from './types';

export default class CELExpression {
  public operator: CELOperators | null = null;
  public operands: CELExpressionOperand[] = [];

  constructor(operands?: CELExpressionOperand[], operator?: CELOperators) {
    if (operands) this.operands = operands;
    if (operator) this.operator = operator;
  }

  get isSimple(): boolean {
    return this.operands.length < 2;
  }

  public compile(): string {
    const glue = this.operator ? ` ${this.operator} ` : '';

    let result = this.operands.map(v => v.compile()).join(glue);
    if (!this.isSimple) result = `(${result})`;

    return result;
  }
}
