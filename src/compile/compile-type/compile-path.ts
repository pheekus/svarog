import {
  JSONSchema7
} from 'json-schema';

import cel from '../cel';

export default function(schema: JSONSchema7, ref: string): string {
  const map = cel.calc(ref, 'is', 'map');
  const hasOnly = cel.call(cel.ref(cel.call(cel.ref(ref, 'keys')), 'hasOnly'), cel.val(['path']));
  const withPath = cel.calc(cel.ref(ref, 'path'), 'is', 'path')

  return cel.calc(map, '&&', cel.calc(hasOnly, '&&', withPath));
}
