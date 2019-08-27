import {
  JSONSchema7,
  JSONSchema7Definition,
} from 'json-schema';

import cel from '../cel';

export default function(schema: JSONSchema7, ref: string): string {
  let guard = cel.calc(ref, 'is', 'int');

  const type = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (type.includes('number')) guard = cel.calc(guard, '||', cel.calc(ref, 'is', 'float'));

  if (typeof schema.minimum === 'number') {
    const minGuard = cel.calc(ref, '>=', cel.val(schema.minimum));
    guard = cel.calc(guard, '&&', minGuard);
  }

  if (typeof schema.exclusiveMinimum === 'number') {
    const exMinGuard = cel.calc(ref, '>', cel.val(schema.exclusiveMinimum));
    guard = cel.calc(guard, '&&', exMinGuard);
  }

  if (typeof schema.maximum === 'number') {
    const maxGuard = cel.calc(ref, '<=', cel.val(schema.maximum));
    guard = cel.calc(guard, '&&', maxGuard);
  }

  if (typeof schema.exclusiveMaximum === 'number') {
    const exMaxGuard = cel.calc(ref, '<', cel.val(schema.exclusiveMaximum));
    guard = cel.calc(guard, '&&', exMaxGuard);
  }

  // TODO: multipleOf

  return guard;
}
