import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import { CELAccessor, CELExpression, CELLiteral, CELOperators } from '../cel';

export default function(
  accessor: CELAccessor,
  strict: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'null') return null;

  const expression = new CELExpression([], CELOperators.AND);

  // => (accessor is bool)

  expression.operands.push(
    new CELExpression([accessor, new CELLiteral(null)], CELOperators.EQUALS)
  );

  return expression;
}
