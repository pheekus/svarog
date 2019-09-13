import {
  JSONSchema7,
  JSONSchema7Definition,
} from 'json-schema';

import cel from '../cel';
import compile from './';

export default function(schema: JSONSchema7, ref: string, strictRef: string): string {
  const properties = schema.properties || {};
  const requiredProperties = new Set(schema.required || []);
  const allProperties = Object.keys(properties);
  const actualKeys = cel.ref(cel.call(cel.ref(ref, 'keys')));
  const actualKeysSize = cel.call(cel.ref(actualKeys, 'size'));

  let guard = cel.calc(ref, 'is', cel.ref('map'));

  if (allProperties.length > 0) {
    const expectedKeys = cel.val(allProperties);
    guard = cel.calc(guard, '&&', cel.call(cel.ref(actualKeys, 'hasOnly'), expectedKeys));
  }

  allProperties.forEach(key => {
    const value = properties[key];
    const valueRef = cel.ref(ref, key);

    if (typeof value === 'boolean') {
      guard = cel.calc(guard, '&&', valueRef);
    } else if (typeof value === 'object') {
      let valueGuard = compile(value, valueRef, strictRef);

      if (requiredProperties.has(key)) {
        const includesKey = cel.call(cel.ref(actualKeys, 'hasAll'), cel.val([key]))
        const definedOrStrict = cel.calc(strictRef, '||', includesKey);
        valueGuard = cel.calc(definedOrStrict, '&&', valueGuard);
      } else {
        valueGuard = cel.calc(valueRef, '&&', valueGuard);
      }

      guard = cel.calc(guard, '&&', valueGuard);
    }
  });

  if (typeof schema.minProperties === 'number') {
    const minPropertiesGuard = cel.calc(actualKeysSize, '>=', cel.val(schema.minProperties));
    guard = cel.calc(guard, '&&', minPropertiesGuard);
  }

  if (typeof schema.maxProperties === 'number') {
    const maxPropertiesGuard = cel.calc(actualKeysSize, '<=', cel.val(schema.maxProperties));
    guard = cel.calc(guard, '&&', maxPropertiesGuard);
  }

  // TODO: propertyNames
  // TODO: dependencies
  // TODO: patternProperties

  return guard;
}
