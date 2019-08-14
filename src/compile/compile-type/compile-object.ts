import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  CELAccessor,
  CELExpression,
  CELExpressionOperand,
  CELFunctionCall,
  CELList,
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

  // => accessor.keys().hasOnly(allowedKeys)

  const allowedKeys = Object.keys(definition.properties as any).map(
    v => new CELLiteral(v)
  );

  operands.unshift(
    new CELFunctionCall(
      new CELAccessor(
        new CELFunctionCall(new CELAccessor(...accessor.path, 'keys')),
        'hasOnly'
      ),
      new CELList(...allowedKeys)
    )
  );

  return new CELExpression(operands, CELOperators.AND);
}
