import {
  CELExpression,
  CELExpressionOperand,
  CELLiteral,
  CELOperators
} from '.';

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
    return new CELExpression(
      [
        new CELExpression([this.expression, this.onTrue], CELOperators.AND),
        this.onFalse
      ],
      CELOperators.OR
    ).compile();
  }
}
