import CELAccessor from './accessor';
import { CELExpressionOperand } from './types';

export default class CELFunction {
  public name: string;
  public params: CELAccessor[];
  public expression: CELExpressionOperand;

  constructor(
    name: string,
    params: CELAccessor[],
    expression: CELExpressionOperand
  ) {
    this.name = name;
    this.params = params;
    this.expression = expression;
  }

  public compile(): string {
    const params = this.params.map(v => v.compile()).join(',');
    const signature = `function ${this.name}(${params})`;
    const body = `return(${this.expression.compile()})`;

    return `${signature}{${body}}`;
  }
}
