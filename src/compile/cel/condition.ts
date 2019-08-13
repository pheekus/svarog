import { CELExpressionOperand, CELLiteral } from '.';

export default class CELCondition {
  public readonly isSimple = false;

  public expression: CELExpressionOperand = new CELLiteral(true);
  public onTrue: CELExpressionOperand = new CELLiteral(true);
  public onFalse: CELExpressionOperand = new CELLiteral(true);

  constructor(
    expression?: CELExpressionOperand,
    onTrue?: CELExpressionOperand,
    onFalse?: CELExpressionOperand
  ) {
    if (expression) this.expression = expression;
    if (onTrue) this.onTrue = onTrue;
    if (onFalse) this.onFalse = onFalse;
  }

  public compile(): string {
    return `${this.expression.compile()} ? ${this.onTrue.compile()} : ${this.onFalse.compile()}`;
  }
}
