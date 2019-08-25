import {
  JSONSchema7
} from 'json-schema';

import cel from '../cel';

export default function(schema: JSONSchema7, ref: string): string {
  let guard = cel.calc(ref, 'is', cel.ref('string'));

  if (typeof schema.minLength === 'number') {
    const minGuard = cel.calc(cel.call(cel.ref(ref, 'size')), '>=', cel.val(schema.minLength));
    guard = cel.calc(guard, '&&', minGuard);
  }

  if (typeof schema.maxLength === 'number') {
    const maxGuard = cel.calc(cel.call(cel.ref(ref, 'size')), '<=', cel.val(schema.maxLength));
    guard = cel.calc(guard, '&&', maxGuard);
  }

  if (typeof schema.pattern === 'string') {
    const patternGuard = cel.call(cel.ref(ref, 'matches'), cel.val(schema.pattern));
    guard = cel.calc(guard, '&&', patternGuard);
  }

  if (Array.isArray(schema.enum)) {
    const enumGuard = cel.call(cel.ref(cel.val(schema.enum as any), 'hasSome'), `[${ref}]`);
    guard = cel.calc(guard, '&&', enumGuard);
  }

  if (typeof schema.const === 'string') {
    const constGuard = cel.calc(ref, '==', cel.val(schema.const));
    guard = cel.calc(guard, '&&', constGuard);
  }

  return guard;
}