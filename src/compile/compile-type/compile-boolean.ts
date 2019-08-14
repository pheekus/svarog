import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  CELAccessor,
  CELExpression,
  CELGlobal,
  CELGlobals,
  CELLiteral,
  CELOperators
} from '../cel';

export default function(
  accessor: CELAccessor,
  strict: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'boolean') return null;

  const expression = new CELExpression([], CELOperators.AND);

  // => (accessor is bool)

  expression.operands.push(
    new CELExpression(
      [accessor, new CELGlobal(CELGlobals.BOOLEAN)],
      CELOperators.IS
    )
  );

  // => (accessor == definition.const)

  if (typeof definition.const === 'boolean') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.const)],
        CELOperators.EQUALS
      )
    );
  }

  return expression;
}
