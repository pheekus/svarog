import {
  JSONSchema7,
  JSONSchema7Definition,
} from 'json-schema';

import cel from '../cel';
import compile from './';

export default function(schema: JSONSchema7, ref: string, strictRef: string): string {
  let guard = cel.calc(ref, 'is', 'list');

  const arraySize = cel.call(cel.ref(ref, 'size'));
  const hasItemsDescriptor = Array.isArray(schema.items);

  if (!hasItemsDescriptor || schema.additionalItems === true) {
    if (typeof schema.minItems === 'number') {
      const greaterOrEqual = cel.calc(arraySize, '>=', cel.val(schema.minItems));
      guard = cel.calc(guard, '&&', greaterOrEqual);
    }

    if (typeof schema.maxItems === 'number') {
      const lessOrEqual = cel.calc(arraySize, '<=', cel.val(schema.maxItems));
      guard = cel.calc(guard, '&&', lessOrEqual);
    }
  }

  if (hasItemsDescriptor) {
    const items = schema.items as JSONSchema7Definition[];
    const equalityOperator = schema.additionalItems ? '>=' : '==';

    guard = cel.calc(arraySize, equalityOperator, cel.val(items.length));

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const itemRef = cel.ref(ref, i);

      let itemGuard = itemRef;
      if (typeof item === 'object') itemGuard = compile(item, itemRef, strictRef);

      guard = cel.calc(guard, '&&', itemGuard);
    }
  }

  // TODO: list type validation in items and additionalItems
  // TODO: uniqueItems support

  return guard;
}
