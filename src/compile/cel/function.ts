import { CELExpressionOperand } from './types';

export default class CELFunction {
  public name: string;
  public params: string[];
  public expression: CELExpressionOperand;

  constructor(
    name: string,
    params: string[],
    expression: CELExpressionOperand
  ) {
    this.name = name;
    this.params = params;
    this.expression = expression;
  }

  public compile(): string {
    const params = this.params.join(', ');
    const signature = `function ${this.name}(${params})`;
    const body = `return ${this.expression.compile()};`;

    return `${signature} {\n  ${body}\n}`;
  }
}
