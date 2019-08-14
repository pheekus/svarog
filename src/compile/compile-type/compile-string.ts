import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  CELAccessor,
  CELExpression,
  CELFunctionCall,
  CELGlobal,
  CELGlobals,
  CELList,
  CELLiteral,
  CELOperators
} from '../cel';

export default function(
  accessor: CELAccessor,
  strict: CELAccessor,
  type: JSONSchema7TypeName,
  definition: JSONSchema7
): CELExpression | null {
  if (type !== 'string') return null;

  const expression = new CELExpression([], CELOperators.AND);

  // => (accessor is string)

  expression.operands.push(
    new CELExpression(
      [accessor, new CELGlobal(CELGlobals.STRING)],
      CELOperators.IS
    )
  );

  // => (accessor.size() >= definition.minLength)

  if (typeof definition.minLength === 'number') {
    expression.operands.push(
      new CELExpression(
        [
          new CELFunctionCall(new CELAccessor(...accessor.path, 'size')),
          new CELLiteral(definition.minLength)
        ],
        CELOperators.GREATER_OR_EQUALS
      )
    );
  }

  // => (accessor.size() <= definition.minLength)

  if (typeof definition.maxLength === 'number') {
    expression.operands.push(
      new CELExpression(
        [
          new CELFunctionCall(new CELAccessor(...accessor.path, 'size')),
          new CELLiteral(definition.maxLength)
        ],
        CELOperators.LESS_OR_EQUALS
      )
    );
  }

  // => (accessor.matches(definition.pattern))

  if (typeof definition.pattern === 'string') {
    expression.operands.push(
      new CELFunctionCall(
        new CELAccessor(...accessor.path, 'matches'),
        new CELLiteral(definition.pattern)
      )
    );
  }

  // => ([ ...definition.enum ].hasSome([ accessor ]))

  if (Array.isArray(definition.enum)) {
    const enumList = new CELList(
      ...definition.enum.map(v => new CELLiteral(v as any))
    );

    expression.operands.push(
      new CELFunctionCall(
        new CELAccessor(...enumList.accessor.path, 'hasSome'),
        new CELList(accessor)
      )
    );
  }

  // => (accessor == definition.const)

  if (typeof definition.const === 'string') {
    expression.operands.push(
      new CELExpression(
        [accessor, new CELLiteral(definition.const)],
        CELOperators.EQUALS
      )
    );
  }

  return expression;
}
