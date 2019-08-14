import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  CELAccessor,
  CELExpression,
  CELExpressionOperand,
  CELLiteral,
  CELOperators
} from '../cel';
import compileType from './index';

export default function(
  accessor: CELAccessor,
  strict: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'object') return null;

  const required = definition.required ? definition.required : [];

  const operands: CELExpressionOperand[] = Object.keys(
    definition.properties as any
  ).map((property: string) =>
    compileType(
      new CELAccessor(...accessor.path, property),
      strict,
      (definition.properties as any)[property] as JSONSchema7,
      required.includes(property)
    )
  );

  if (operands.length === 0) {
    operands.push(new CELLiteral(true));
  }

  return new CELExpression(operands, CELOperators.AND);
}
