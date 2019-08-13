import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  CELAccessor,
  CELExpression,
  CELFunctionCall,
  CELGlobal,
  CELGlobals,
  CELLiteral,
  CELOperators
} from '../cel';

export default function(
  accessor: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'number' && type !== 'integer') return null;

  const expression = new CELExpression([], CELOperators.AND);

  // => ((accessor is int) || (accessor is double))

  if (type === 'number') {
    expression.operands.push(
      new CELExpression(
        [
          new CELExpression(
            [accessor, new CELGlobal(CELGlobals.INTEGER)],
            CELOperators.IS
          ),
          new CELExpression(
            [accessor, new CELGlobal(CELGlobals.FLOAT)],
            CELOperators.IS
          )
        ],
        CELOperators.OR
      )
    );
  }

  // => (accessor is int)

  if (type === 'integer') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELGlobal(CELGlobals.INTEGER)],
        CELOperators.IS
      )
    );
  }

  // => (accessor >= definition.minumum)

  if (typeof definition.minimum === 'number') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.minimum)],
        CELOperators.GREATER_OR_EQUALS
      )
    );
  }

  // => (accessor > definition.exclusiveMinimum)

  if (typeof definition.exclusiveMinimum === 'number') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.exclusiveMinimum)],
        CELOperators.GREATER
      )
    );
  }

  // => (accessor <= definition.maximum)

  if (typeof definition.maximum === 'number') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.maximum)],
        CELOperators.LESS_OR_EQUALS
      )
    );
  }

  // => (accessor < definition.exclusiveMaximum)

  if (typeof definition.exclusiveMaximum === 'number') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.exclusiveMaximum)],
        CELOperators.LESS
      )
    );
  }

  // => (accessor == definition.const)

  if (typeof definition.const === 'number') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.const)],
        CELOperators.EQUALS
      )
    );
  }

  return expression;
}
