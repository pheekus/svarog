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
import compileType from './index';

export default function(
  accessor: CELAccessor,
  strict: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'array') return null;

  const expression = new CELExpression([], CELOperators.AND);

  // => (accessor is list)

  expression.operands.push(
    new CELExpression(
      [accessor, new CELGlobal(CELGlobals.LIST)],
      CELOperators.IS
    )
  );

  // => (accessor.size() >= definition.minItems)

  if (typeof definition.minItems === 'number') {
    expression.operands.push(
      new CELExpression(
        [
          new CELFunctionCall(new CELAccessor(...accessor.path, 'size')),
          new CELLiteral(definition.minItems)
        ],
        CELOperators.GREATER_OR_EQUALS
      )
    );
  }

  // => (accessor.size() <= definition.maxItems)

  if (typeof definition.maxItems === 'number') {
    expression.operands.push(
      new CELExpression(
        [
          new CELFunctionCall(new CELAccessor(...accessor.path, 'size')),
          new CELLiteral(definition.maxItems)
        ],
        CELOperators.LESS_OR_EQUALS
      )
    );
  }

  // => (accessor.size() == definition.items.length) # if definition.additionalItems === false
  // => (accessor.size() >= definition.items.length) # otherwise
  // => # + appropriate validators for each type

  if (Array.isArray(definition.items)) {
    const sizeOperator =
      definition.additionalItems === false
        ? CELOperators.EQUALS
        : CELOperators.GREATER_OR_EQUALS;

    expression.operands.push(
      new CELExpression(
        [
          new CELFunctionCall(new CELAccessor(...accessor.path, 'size')),
          new CELLiteral(definition.items.length)
        ],
        sizeOperator
      )
    );

    expression.operands.push(
      ...definition.items.map((nestedDefinition, index) => {
        return compileType(
          new CELAccessor(...accessor.path, `[${index}]`),
          strict,
          nestedDefinition as JSONSchema7,
          true
        );
      })
    );
  }

  // TODO: list type validation in items and additionalItems
  // TODO: uniqueItems support

  return expression;
}
