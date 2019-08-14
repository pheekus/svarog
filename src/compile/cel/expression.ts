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
    let glue = this.operator ? this.operator : '';
    if (glue === CELOperators.IS || glue === CELOperators.IN) glue = ` ${glue} `;

    let result = this.operands.map(v => v.compile()).join(glue);
    if (!this.isSimple) result = `(${result})`;

    return result;
  }
}
