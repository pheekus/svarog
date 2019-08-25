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

  let guard = cel.calc(ref, 'is', cel.ref('map'));

  if (allProperties.length > 0) {
    const expectedKeys = cel.val(allProperties);
    const actualKeys = cel.ref(cel.call(cel.ref(ref, 'keys')));

    guard = cel.calc(guard, '&&', cel.call(actualKeys, 'hasOnly', expectedKeys));
  }

  allProperties.forEach(key => {
    const value = properties[key];
    if (typeof value !== 'object') return;

    const valueRef = cel.ref(ref, key);
    const valueGuard = compile(value, valueRef, strictRef);

    guard = cel.calc(guard, '&&', valueGuard);

    if (!requiredProperties.has(key)) {
      const definedOrStrict = cel.calc(strictRef, '||', valueRef);
      guard = cel.calc(definedOrStrict, '&&', guard);
    }
  });

  // TODO: minProperties
  // TODO: maxProperties
  // TODO: propertyNames
  // TODO: dependencies
  // TODO: patternProperties

  return guard;
}
