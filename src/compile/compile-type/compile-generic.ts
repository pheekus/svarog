import {
  JSONSchema7,
  JSONSchema7Array,
  JSONSchema7Type,
} from 'json-schema';

import cel from '../cel';
import compileType from './';

function createEnumValueGuard(schema: JSONSchema7Type, ref: string): string {
  if (typeof schema === 'object' && schema !== null) {
    return Object.keys(schema).reduce((guard: string, key: string) => {
      const value = Array.isArray(schema) ? schema[parseInt(key, 10)] : (schema as any)[key];
      const valueRef = cel.ref(ref, Array.isArray(schema) ? parseInt(key, 10) : key);
      const valueGuard = typeof value === 'object'
        ? createEnumValueGuard(value, valueRef)
        : cel.calc(valueRef, '==', cel.val(value));

      return cel.calc(guard, '&&', valueGuard);
    }, '');
  }

  return cel.calc(ref, '==', cel.val(schema));
}

function createEnumGuard(declaration: JSONSchema7Type[], ref: string): string {
  return declaration.reduce((guard: string, value: JSONSchema7Type) => {
    return cel.calc(guard, '||', createEnumValueGuard(value, ref));
  }, '');
}

export default function(schema: JSONSchema7, ref: string, strictRef: string) {
  let guard = '';

  if (typeof schema.const !== 'undefined') guard = createEnumGuard([schema.const], ref);
  if (typeof schema.enum !== 'undefined') guard = cel.calc(guard, '&&', createEnumGuard(schema.enum, ref));

  if (Array.isArray(schema.allOf)) {
    const allOfGuard = schema.allOf.reduce((partialGuard, variant) => {
      if (typeof variant === 'boolean') return partialGuard;
      if (!variant.hasOwnProperty('type')) variant.type = schema.type;

      return cel.calc(partialGuard, '&&', compileType(variant, ref, strictRef));
    }, '');

    guard = cel.calc(guard, '&&', allOfGuard);
  }

  if (Array.isArray(schema.anyOf)) {
    const anyOfGuard = schema.anyOf.reduce((partialGuard, variant) => {
      if (typeof variant === 'boolean') return partialGuard;
      if (!variant.hasOwnProperty('type')) variant.type = schema.type;

      return cel.calc(partialGuard, '||', compileType(variant, ref, strictRef));
    }, '');

    guard = cel.calc(guard, '&&', anyOfGuard);
  }

  return guard;
}
